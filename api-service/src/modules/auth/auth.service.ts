import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { extractInitials } from '../../common/utils/helpers.util';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const identifier = dto.identifier.trim();

    // Check if identifier is email or phone
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
      },
      include: {
        profile: true,
        providerStore: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Identitas atau kata sandi tidak valid.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Akun Anda telah dinonaktifkan. Silakan hubungi admin.');
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, dto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Identitas atau kata sandi tidak valid.');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      phone: user.phone,
      hasProviderStore: user.hasProviderStore,
    };

    const token = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret', 'epunyasewa-default-refresh-secret-key-2026'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn', '30d'),
    });

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        displayName: user.displayName || user.fullName,
        email: user.email,
        phone: user.phone,
        initials: user.initials || extractInitials(user.fullName),
        isKycVerified: user.isKycVerified,
        kycStatus: user.kycStatus,
        hasProviderStore: user.hasProviderStore,
        providerStoreName: user.providerStore?.storeName || null,
        profession: user.profile?.profession || null,
        companyOrStudio: user.profile?.companyOrStudio || null,
        socialMediaInstagram: user.profile?.socialMediaInstagram || null,
        city: user.profile?.cityText || null,
        address: user.profile?.address || null,
        postalCode: user.profile?.postalCode || null,
        emergencyContactName: user.profile?.emergencyContactName || null,
        emergencyPhone: user.profile?.emergencyPhone || null,
        emergencyRelation: user.profile?.emergencyRelation || null,
        bio: user.profile?.bio || null,
        joinedAt: user.createdAt.toISOString(),
      },
    };
  }

  async register(dto: RegisterDto) {
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existingEmail) {
      throw new ConflictException('Alamat email sudah terdaftar.');
    }

    const existingPhone = await this.prisma.user.findUnique({
      where: { phone: dto.phone.trim() },
    });
    if (existingPhone) {
      throw new ConflictException('Nomor telepon sudah terdaftar.');
    }

    const passwordHash = await argon2.hash(dto.password);
    const initials = extractInitials(dto.fullName);

    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName.trim(),
        displayName: dto.fullName.trim(),
        email: dto.email.toLowerCase().trim(),
        phone: dto.phone.trim(),
        passwordHash,
        initials,
        hasProviderStore: false,
        isKycVerified: true,
        kycStatus: 'VERIFIED',
        profile: {
          create: {},
        },
      },
      include: {
        profile: true,
      },
    });

    const payload = {
      sub: user.id,
      email: user.email,
      phone: user.phone,
      hasProviderStore: user.hasProviderStore,
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        initials: user.initials,
        isKycVerified: user.isKycVerified,
        hasProviderStore: user.hasProviderStore,
        joinedAt: user.createdAt.toISOString(),
      },
    };
  }
}
