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
    const rawIdentifier = dto.identifier.trim();
    const identifierLower = rawIdentifier.toLowerCase();

    // Support:
    // 1. Exact email (e.g. "auri.fuad@example.com")
    // 2. Username / email prefix (e.g. "auri.fuad" matching "auri.fuad@...")
    // 3. Exact phone number (e.g. "081234567890")
    const isEmailFormat = identifierLower.includes('@');
    const isPhoneFormat = /^08[0-9]{8,13}$/.test(rawIdentifier);

    let whereClause: any;

    if (isEmailFormat) {
      whereClause = { email: identifierLower };
    } else if (isPhoneFormat) {
      whereClause = {
        OR: [
          { phone: rawIdentifier },
          { email: { startsWith: `${identifierLower}@`, mode: 'insensitive' } },
        ],
      };
    } else {
      // Username prefix lookup or exact matches
      whereClause = {
        OR: [
          { email: { startsWith: `${identifierLower}@`, mode: 'insensitive' } },
          { email: identifierLower },
          { phone: rawIdentifier },
        ],
      };
    }

    const user = await this.prisma.user.findFirst({
      where: whereClause,
      include: {
        profile: true,
        providerStore: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Identitas login (email / username / no telepon) atau kata sandi tidak valid.',
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Akun Anda telah dinonaktifkan. Silakan hubungi admin.');
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, dto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Identitas login (email / username / no telepon) atau kata sandi tidak valid.',
      );
    }

    const payload = {
      sub: user.id,
      email: user.email,
      phone: user.phone,
      hasProviderStore: user.hasProviderStore,
    };

    const token = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>(
        'jwt.refreshSecret',
        'epunyasewa-default-refresh-secret-key-2026',
      ),
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn', '30d'),
    });

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        displayName: user.displayName || user.fullName,
        username: user.email.split('@')[0],
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
    const email = dto.email.toLowerCase().trim();
    const phone = dto.phone.trim();
    const desiredUsername = dto.username
      ? dto.username.toLowerCase().trim()
      : email.split('@')[0];

    // 1. Check Email Uniqueness
    const existingEmail = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) {
      throw new ConflictException('Alamat email sudah terdaftar.');
    }

    // 2. Check Phone Uniqueness
    const existingPhone = await this.prisma.user.findUnique({
      where: { phone },
    });
    if (existingPhone) {
      throw new ConflictException('Nomor telepon sudah terdaftar.');
    }

    // 3. Check Username Prefix Uniqueness
    const existingPrefix = await this.prisma.user.findFirst({
      where: {
        email: {
          startsWith: `${desiredUsername}@`,
          mode: 'insensitive',
        },
      },
    });
    if (existingPrefix && dto.username) {
      throw new ConflictException('Username sudah digunakan oleh akun lain.');
    }

    const passwordHash = await argon2.hash(dto.password);
    const initials = extractInitials(dto.fullName);

    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName.trim(),
        displayName: dto.fullName.trim(),
        email,
        phone,
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
        username: user.email.split('@')[0],
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
