import { Injectable, NotFoundException } from '@nestjs/common';
import { extractInitials } from '../../common/utils/helpers.util';
import { PrismaService } from '../../database/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        providerStore: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan.');
    }

    return {
      id: user.id,
      fullName: user.fullName,
      displayName: user.displayName || user.fullName,
      email: user.email,
      phone: user.phone,
      initials: user.initials || extractInitials(user.fullName),
      isKycVerified: user.isKycVerified,
      kycStatus: user.kycStatus,
      hasProviderStore: user.hasProviderStore,
      providerStore: user.providerStore
        ? {
            id: user.providerStore.id,
            storeName: user.providerStore.storeName,
            slug: user.providerStore.slug,
            rating: Number(user.providerStore.rating),
            reviewCount: user.providerStore.reviewCount,
            isVerified: user.providerStore.isVerified,
          }
        : null,
      providerStoreName: user.providerStore?.storeName || null,
      profession: user.profile?.profession || null,
      companyOrStudio: user.profile?.companyOrStudio || null,
      socialMediaInstagram: user.profile?.socialMediaInstagram || null,
      provinceId: user.profile?.provinceId || null,
      provinceName: user.profile?.provinceName || null,
      regencyId: user.profile?.regencyId || null,
      regencyName: user.profile?.regencyName || null,
      districtId: user.profile?.districtId || null,
      districtName: user.profile?.districtName || null,
      villageId: user.profile?.villageId || null,
      villageName: user.profile?.villageName || null,
      city: user.profile?.cityText || null,
      address: user.profile?.address || null,
      postalCode: user.profile?.postalCode || null,
      emergencyContactName: user.profile?.emergencyContactName || null,
      emergencyPhone: user.profile?.emergencyPhone || null,
      emergencyRelation: user.profile?.emergencyRelation || null,
      bio: user.profile?.bio || null,
      joinedAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan.');
    }

    // Update User model fields if provided
    const userUpdateData: any = {};
    if (dto.fullName) {
      userUpdateData.fullName = dto.fullName.trim();
      userUpdateData.initials = extractInitials(dto.fullName);
    }
    if (dto.displayName) {
      userUpdateData.displayName = dto.displayName.trim();
    }
    if (dto.phone) {
      userUpdateData.phone = dto.phone.trim();
    }

    if (Object.keys(userUpdateData).length > 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: userUpdateData,
      });
    }

    // Upsert UserProfile
    const profileUpdateData: any = {
      profession: dto.profession,
      companyOrStudio: dto.companyOrStudio,
      socialMediaInstagram: dto.socialMediaInstagram,
      provinceId: dto.provinceId,
      provinceName: dto.provinceName,
      regencyId: dto.regencyId,
      regencyName: dto.regencyName,
      districtId: dto.districtId,
      districtName: dto.districtName,
      villageId: dto.villageId,
      villageName: dto.villageName,
      cityText: dto.city,
      address: dto.address,
      postalCode: dto.postalCode,
      emergencyContactName: dto.emergencyContactName,
      emergencyPhone: dto.emergencyPhone,
      emergencyRelation: dto.emergencyRelation,
      bio: dto.bio,
    };

    // Filter out undefined keys
    Object.keys(profileUpdateData).forEach((key) => {
      if (profileUpdateData[key] === undefined) {
        delete profileUpdateData[key];
      }
    });

    const updatedProfile = await this.prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        ...profileUpdateData,
      },
      update: profileUpdateData,
    });

    const updatedUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    return {
      id: updatedUser?.id,
      fullName: updatedUser?.fullName,
      phone: updatedUser?.phone,
      city: updatedProfile.cityText,
      profession: updatedProfile.profession,
      companyOrStudio: updatedProfile.companyOrStudio,
      address: updatedProfile.address,
      emergencyContactName: updatedProfile.emergencyContactName,
      emergencyPhone: updatedProfile.emergencyPhone,
      updatedAt: updatedProfile.updatedAt.toISOString(),
    };
  }
}
