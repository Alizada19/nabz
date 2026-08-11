import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

/**
 * End-to-end tests against a real (test) PostgreSQL database configured via
 * DATABASE_URL. Run with: npm run test:e2e
 *
 * These tests assume the database has been migrated (`prisma migrate deploy`)
 * and seeded with reference blood types (`prisma db seed`) before running.
 */
describe('Blood Donation API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const testUser = {
    name: 'E2E Test Individual',
    email: `e2e-individual-${Date.now()}@example.com`,
    phone: `+601${Math.floor(10000000 + Math.random() * 89999999)}`,
    password: 'StrongP@ss123',
    role: 'individual',
    latitude: 3.139,
    longitude: 101.6869,
  };

  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = moduleFixture.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await app.close();
  });

  describe('/api/auth/register (POST)', () => {
    it('registers a new individual and returns tokens', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe(testUser.email);
      accessToken = res.body.data.accessToken;
    });

    it('rejects duplicate registration with the same email', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser)
        .expect(409);
    });

    it('rejects an invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ ...testUser, email: 'not-an-email', phone: '+60111111112' })
        .expect(400);
    });
  });

  describe('/api/auth/login (POST)', () => {
    it('logs in with correct credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200);

      expect(res.body.data.accessToken).toBeDefined();
    });

    it('rejects incorrect password', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'wrong-password' })
        .expect(401);
    });
  });

  describe('/api/auth/profile (GET)', () => {
    it('rejects requests without a JWT', async () => {
      await request(app.getHttpServer()).get('/api/auth/profile').expect(401);
    });

    it('returns the authenticated user profile with a valid JWT', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.data.email).toBe(testUser.email);
      expect(res.body.data.password).toBeUndefined();
    });
  });

  describe('/api/donors/nearby (GET)', () => {
    it('rejects an invalid blood type / missing coordinates', async () => {
      await request(app.getHttpServer())
        .get('/api/donors/nearby')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ bloodType: 'A+' }) // missing lat/lng
        .expect(400);
    });

    it('returns a paginated list of nearby compatible donors', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/donors/nearby')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ bloodType: 'A+', latitude: 3.139, longitude: 101.6869, radius: 50 })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('items');
      expect(res.body.data).toHaveProperty('meta');
      // Privacy: exact coordinates must never be exposed
      if (res.body.data.items.length > 0) {
        expect(res.body.data.items[0]).not.toHaveProperty('latitude');
        expect(res.body.data.items[0]).not.toHaveProperty('longitude');
      }
    });
  });

  describe('/api/blood-types (GET)', () => {
    it('returns all reference blood types', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/blood-types')
        .expect(200);

      expect(res.body.data.length).toBeGreaterThanOrEqual(8);
    });
  });

  describe('Multi-role acceptance (Individual = Donor + Blood Seeker)', () => {
    it('one Individual can create a donor profile AND still create a blood request', async () => {
      // 1. Create DonorProfile
      const donorRes = await request(app.getHttpServer())
        .post('/api/donor-profiles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ bloodType: 'A+' })
        .expect(201);

      expect(donorRes.body.success).toBe(true);
      expect(donorRes.body.data.userId).toBeDefined();

      // 2. The same Individual account creates a blood request
      const requestRes = await request(app.getHttpServer())
        .post('/api/blood-requests')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          requestType: 'INDIVIDUAL',
          bloodType: 'A+',
          latitude: 3.139,
          longitude: 101.6869,
          unitsRequired: 1,
        })
        .expect(201);

      expect(requestRes.body.success).toBe(true);

      // 3. DonorProfile still exists and remains active after the request
      const profileRes = await request(app.getHttpServer())
        .get('/api/donor-profiles/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(profileRes.body.success).toBe(true);
      expect(profileRes.body.data.userId).toBeDefined();
      expect(profileRes.body.data.availableStatus).toBe(true);
    });
  });
});
