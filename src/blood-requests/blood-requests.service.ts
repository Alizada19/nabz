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
import { UpdateBloodRequestDto } from './dto/update-blood-request.dto';

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
      include: {
        bloodType: true,
        seeker: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
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

  async findAll(query: QueryBloodRequestDto) {
    const { skip, limit = 10, status, urgencyLevel, bloodType, location, search, requesterType } = query;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (urgencyLevel) {
      where.urgencyLevel = urgencyLevel;
    }

    if (bloodType) {
      where.bloodType = {
        name: {
          equals: bloodType,
          mode: 'insensitive',
        },
      };
    }

    if (location) {
      where.OR = [
        { hospitalAddress: { contains: location, mode: 'insensitive' } },
        { hospitalName: { contains: location, mode: 'insensitive' } },
      ];
    }

    if (search) {
      where.OR = [
        { hospitalName: { contains: search, mode: 'insensitive' } },
        { hospitalAddress: { contains: search, mode: 'insensitive' } },
        { seeker: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (requesterType) {
      where.seeker = {
        role: requesterType,
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.bloodRequest.findMany({
        where,
        include: {
          bloodType: true,
          seeker: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
              location: true,
            },
          },
        },
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

  async findMyRequests(seekerId: string, query: QueryBloodRequestDto) {
    const { skip, limit = 10, status } = query;
    const where = { seekerId, ...(status ? { status } : {}) };

    const [items, total] = await Promise.all([
      this.prisma.bloodRequest.findMany({
        where,
        include: {
          bloodType: true,
          seeker: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
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
      include: {
        bloodType: true,
        seeker: {
          select: {
            id: true,
            name: true,
            role: true,
            email: true,
            phone: true,
            location: true,
          },
        },
      },
    });
    if (!request) {
      throw new NotFoundException('Blood request not found');
    }
    if (requesterRole !== Role.admin && request.seekerId !== requesterId) {
      throw new ForbiddenException('You do not have access to this request');
    }
    return request;
  }

  async update(id: string, requesterId: string, requesterRole: Role, dto: UpdateBloodRequestDto) {
    const request = await this.prisma.bloodRequest.findUnique({
      where: { id },
    });
    if (!request) {
      throw new NotFoundException('Blood request not found');
    }
    if (requesterRole !== Role.admin && request.seekerId !== requesterId) {
      throw new ForbiddenException('You do not have access to edit this request');
    }

    let bloodTypeId = request.bloodTypeId;
    if (dto.bloodType) {
      const bt = await this.bloodTypesService.findByName(dto.bloodType);
      bloodTypeId = bt.id;
    }

    return this.prisma.bloodRequest.update({
      where: { id },
      data: {
        bloodTypeId,
        hospitalName: dto.hospitalName !== undefined ? dto.hospitalName : undefined,
        hospitalAddress: dto.hospitalAddress !== undefined ? dto.hospitalAddress : undefined,
        latitude: dto.latitude !== undefined ? dto.latitude : undefined,
        longitude: dto.longitude !== undefined ? dto.longitude : undefined,
        unitsRequired: dto.unitsRequired !== undefined ? dto.unitsRequired : undefined,
        urgencyLevel: dto.urgencyLevel !== undefined ? dto.urgencyLevel : undefined,
        status: dto.status !== undefined ? dto.status : undefined,
      },
      include: {
        bloodType: true,
        seeker: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });
  }

  async remove(id: string, requesterId: string, requesterRole: Role) {
    const request = await this.prisma.bloodRequest.findUnique({
      where: { id },
    });
    if (!request) {
      throw new NotFoundException('Blood request not found');
    }
    if (requesterRole !== Role.admin && request.seekerId !== requesterId) {
      throw new ForbiddenException('You do not have access to delete this request');
    }

    return this.prisma.bloodRequest.delete({
      where: { id },
    });
  }

  async updateStatus(
    id: string,
    requesterId: string,
    requesterRole: Role,
    dto: UpdateBloodRequestStatusDto,
  ) {
    const request = await this.prisma.bloodRequest.findUnique({
      where: { id },
    });
    if (!request) {
      throw new NotFoundException('Blood request not found');
    }

    if (requesterRole !== Role.admin && request.seekerId !== requesterId) {
      throw new ForbiddenException('You do not have access to this request');
    }

    this.assertValidTransition(request.status, dto.status);

    return this.prisma.bloodRequest.update({
      where: { id },
      data: { status: dto.status },
      include: {
        bloodType: true,
        seeker: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
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
