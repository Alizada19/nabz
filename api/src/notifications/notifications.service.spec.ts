import { NotFoundException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: any;
  let fcmProvider: any;

  beforeEach(() => {
    prisma = {
      notification: {
        create: jest.fn(),
        createMany: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };
    fcmProvider = { send: jest.fn(), sendBatch: jest.fn() };
    service = new NotificationsService(prisma, fcmProvider);
  });

  it('creates a notification and dispatches a push message', async () => {
    prisma.notification.create.mockResolvedValue({ id: 'n1' });

    await service.create({
      userId: 'u1',
      title: 'Emergency Blood Request',
      message: 'A patient requires A+ blood near KL.',
    });

    expect(prisma.notification.create).toHaveBeenCalled();
    expect(fcmProvider.send).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'u1' }),
    );
  });

  it('notifyMany batches persistence and push dispatch for multiple donors', async () => {
    await service.notifyMany(['u1', 'u2', 'u3'], 'Title', 'Message');

    expect(prisma.notification.createMany).toHaveBeenCalledWith({
      data: [
        { userId: 'u1', title: 'Title', message: 'Message' },
        { userId: 'u2', title: 'Title', message: 'Message' },
        { userId: 'u3', title: 'Title', message: 'Message' },
      ],
    });
    expect(fcmProvider.sendBatch).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ userId: 'u1' })]),
    );
  });

  it('notifyMany is a no-op for an empty donor list', async () => {
    await service.notifyMany([], 'Title', 'Message');
    expect(prisma.notification.createMany).not.toHaveBeenCalled();
    expect(fcmProvider.sendBatch).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when marking a non-existent notification as read', async () => {
    prisma.notification.findFirst.mockResolvedValue(null);

    await expect(service.markAsRead('n404', 'u1')).rejects.toThrow(
      NotFoundException,
    );
  });
});
