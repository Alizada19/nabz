import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { RequestStatus, Role } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { BloodTypesService } from '../blood-types/blood-types.service';
import { DonorMatchingService } from '../matching/donor-matching.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateBloodRequestDto } from './dto/create-blood-request.dto';
import { QueryBloodRequestDto } from './dto/query-blood-request.dto';
import { UpdateBloodRequestStatusDto } from './dto/update-status.dto';

@Injectable()
export class BloodRequestsService {
  private readonly logger = new Logger(BloodRequestsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly bloodTypesService: BloodTypesService,
    private readonly donorMatchingService: DonorMatchingService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(seekerId: string, seekerRole: Role, dto: CreateBloodRequestDto) {
    if (
      seekerRole !== Role.seeker &&
      seekerRole !== Role.hospital &&
      seekerRole !== Role.blood_bank &&
      seekerRole !== Role.admin
    ) {
      throw new ForbiddenException('Only seekers, hospitals, or blood banks can create blood requests');
    }

    const bloodType = await this.bloodTypesService.findByName(dto.bloodType);

    const request = await this.prisma.bloodRequest.create({
      data: {
        seekerId,
        bloodTypeId: bloodType.id,
        hospitalName: dto.hospitalName,
        hospitalAddress: dto.hospitalAddress,
        latitude: dto.latitude,
        longitude: dto.longitude,
        unitsRequired: dto.unitsRequired,
        urgencyLevel: dto.urgencyLevel,
      },
      include: { bloodType: true },
    });

    // Fire-and-forget matching + notification workflow. Errors here should
    // never fail the request-creation response to the seeker.
    this.matchAndNotify(request.id, bloodType.name, dto.latitude, dto.longitude).catch(
      (err) =>
        this.logger.error(
          `Matching/notification workflow failed for request ${request.id}: ${err.message}`,
        ),
    );

    return request;
  }

  private async matchAndNotify(
    requestId: string,
    bloodTypeName: string,
    latitude: number,
    longitude: number,
  ) {
    const { items } = await this.donorMatchingService.findMatchingDonors({
      requiredBloodType: bloodTypeName,
      latitude,
      longitude,
    });

    if (items.length === 0) {
      this.logger.log(`No compatible nearby donors found for request ${requestId}`);
      return;
    }

    const city = items[0]?.city ?? 'your area';
    await this.notificationsService.notifyMany(
      items.map((d) => d.userId),
      'Emergency Blood Request',
      `A patient requires ${bloodTypeName} blood near ${city}. Units needed urgently.`,
    );
  }

  async findMyRequests(seekerId: string, query: QueryBloodRequestDto) {
    const { skip, limit = 10, status } = query;
    const where = { seekerId, ...(status ? { status } : {}) };

    const [items, total] = await Promise.all([
      this.prisma.bloodRequest.findMany({
        where,
        include: { bloodType: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.bloodRequest.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page: query.page ?? 1,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, requesterId: string, requesterRole: Role) {
    const request = await this.prisma.bloodRequest.findUnique({
      where: { id },
      include: { bloodType: true },
    });
    if (!request) {
      throw new NotFoundException('Blood request not found');
    }
    if (requesterRole !== Role.admin && request.seekerId !== requesterId) {
      throw new ForbiddenException('You do not have access to this request');
    }
    return request;
  }

  async updateStatus(
    id: string,
    requesterId: string,
    requesterRole: Role,
    dto: UpdateBloodRequestStatusDto,
  ) {
    const request = await this.findOne(id, requesterId, requesterRole);

    this.assertValidTransition(request.status, dto.status);

    return this.prisma.bloodRequest.update({
      where: { id },
      data: { status: dto.status },
      include: { bloodType: true },
    });
  }

  private assertValidTransition(current: RequestStatus, next: RequestStatus) {
    const allowed: Record<RequestStatus, RequestStatus[]> = {
      [RequestStatus.pending]: [RequestStatus.matched, RequestStatus.cancelled],
      [RequestStatus.matched]: [RequestStatus.completed, RequestStatus.cancelled],
      [RequestStatus.completed]: [],
      [RequestStatus.cancelled]: [],
    };
    if (current === next) return;
    if (!allowed[current].includes(next)) {
      throw new BadRequestException(
        `Cannot transition blood request from "${current}" to "${next}"`,
      );
    }
  }
}
