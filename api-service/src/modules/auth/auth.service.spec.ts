import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../../database/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrisma = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('mock-secret'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should authenticate valid user and return JWT token with provider flag', async () => {
    const password = 'PasswordRahasia123!';
    const passwordHash = await argon2.hash(password);

    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'usr_01',
      fullName: 'Auri Fuad',
      displayName: 'Auri Fuad',
      email: 'auri.fuad@example.com',
      phone: '081234567890',
      passwordHash,
      initials: 'AF',
      isKycVerified: true,
      kycStatus: 'VERIFIED',
      hasProviderStore: true,
      isActive: true,
      createdAt: new Date(),
      providerStore: { storeName: 'CinemaTech Rental Jakarta' },
      profile: { profession: 'Videographer' },
    });

    const result = await service.login({
      identifier: 'auri.fuad@example.com',
      password,
    });

    expect(result.token).toBe('mock-jwt-token');
    expect(result.user.hasProviderStore).toBe(true);
    expect(result.user.providerStoreName).toBe('CinemaTech Rental Jakarta');
    expect(result.user.email).toBe('auri.fuad@example.com');
  });

  it('should throw UnauthorizedException on wrong password', async () => {
    const passwordHash = await argon2.hash('CorrectPassword123!');

    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'usr_01',
      email: 'auri.fuad@example.com',
      passwordHash,
      isActive: true,
    });

    await expect(
      service.login({
        identifier: 'auri.fuad@example.com',
        password: 'WrongPassword!',
      }),
    ).rejects.toThrow();
  });
});
