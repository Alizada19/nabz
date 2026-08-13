"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const blood_requests_service_1 = require("./blood-requests.service");
describe('BloodRequestsService', () => {
    let service;
    let prisma;
    let bloodTypesService;
    let donorMatchingService;
    let notificationsService;
    const dto = {
        bloodType: 'A+',
        hospitalName: 'Hospital KL',
        hospitalAddress: 'Jalan Pahang',
        latitude: 3.139,
        longitude: 101.6869,
        unitsRequired: 2,
    };
    beforeEach(() => {
        prisma = {
            bloodRequest: {
                create: jest.fn(),
                findMany: jest.fn(),
                count: jest.fn(),
                findUnique: jest.fn(),
                update: jest.fn(),
            },
        };
        bloodTypesService = {
            findByName: jest.fn().mockResolvedValue({ id: 'bt-1', name: 'A+' }),
        };
        donorMatchingService = {
            findMatchingDonors: jest.fn().mockResolvedValue({ items: [], total: 0 }),
        };
        notificationsService = { notifyMany: jest.fn() };
        service = new blood_requests_service_1.BloodRequestsService(prisma, bloodTypesService, donorMatchingService, notificationsService);
    });
    describe('create', () => {
        it('allows an individual (without donor profile) to create a blood request', async () => {
            prisma.bloodRequest.create.mockResolvedValue({
                id: 'req-1',
                status: 'pending',
                bloodType: { name: 'A+' },
            });
            const result = await service.create('user-1', client_1.Role.individual, dto);
            expect(prisma.bloodRequest.create).toHaveBeenCalled();
            expect(result.id).toBe('req-1');
        });
        it('allows an individual who has a donor profile to create a blood request', async () => {
            prisma.bloodRequest.create.mockResolvedValue({
                id: 'req-1',
                status: 'pending',
                bloodType: { name: 'A+' },
            });
            const result = await service.create('user-1', client_1.Role.individual, dto);
            expect(prisma.bloodRequest.create).toHaveBeenCalled();
            expect(result.id).toBe('req-1');
        });
        it('allows a hospital account to create a blood request', async () => {
            prisma.bloodRequest.create.mockResolvedValue({
                id: 'req-2',
                status: 'pending',
                bloodType: { name: 'A+' },
            });
            const result = await service.create('hospital-1', client_1.Role.hospital, dto);
            expect(prisma.bloodRequest.create).toHaveBeenCalled();
            expect(result.id).toBe('req-2');
        });
        it('allows an NGO account to create a blood request', async () => {
            prisma.bloodRequest.create.mockResolvedValue({
                id: 'req-3',
                status: 'pending',
                bloodType: { name: 'A+' },
            });
            const result = await service.create('ngo-1', client_1.Role.ngo, dto);
            expect(prisma.bloodRequest.create).toHaveBeenCalled();
            expect(result.id).toBe('req-3');
        });
    });
    describe('updateStatus', () => {
        const baseRequest = {
            id: 'req-1',
            requesterId: 'user-1',
            status: 'pending',
            bloodType: { name: 'A+' },
        };
        it('allows a valid transition from pending to matched', async () => {
            prisma.bloodRequest.findUnique.mockResolvedValue(baseRequest);
            prisma.bloodRequest.update.mockResolvedValue({
                ...baseRequest,
                status: 'matched',
            });
            const result = await service.updateStatus('req-1', 'user-1', client_1.Role.individual, { status: 'matched' });
            expect(result.status).toBe('matched');
        });
        it('rejects an invalid transition from pending to completed', async () => {
            prisma.bloodRequest.findUnique.mockResolvedValue(baseRequest);
            await expect(service.updateStatus('req-1', 'user-1', client_1.Role.individual, {
                status: 'completed',
            })).rejects.toThrow(common_1.BadRequestException);
        });
        it('rejects updates from a user who does not own the request', async () => {
            prisma.bloodRequest.findUnique.mockResolvedValue(baseRequest);
            await expect(service.updateStatus('req-1', 'someone-else', client_1.Role.individual, {
                status: 'matched',
            })).rejects.toThrow(common_1.ForbiddenException);
        });
    });
});
//# sourceMappingURL=blood-requests.service.spec.js.map