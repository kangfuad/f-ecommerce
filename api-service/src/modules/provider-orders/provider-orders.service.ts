import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderLifecycleStatus, ReviewAuthorRole } from '@prisma/client';
import { formatDateToYMD } from '../../common/utils/helpers.util';
import { PrismaService } from '../../database/prisma.service';
import { StorageService } from '../storage/storage.service';
import { ProviderReviewTenantDto } from './dto/provider-review-tenant.dto';
import { RejectOrderDto } from './dto/reject-order.dto';

@Injectable()
export class ProviderOrdersService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  private async getProviderStoreByUserId(userId: string) {
    const store = await this.prisma.providerStore.findUnique({
      where: { userId },
    });
    if (!store) {
      throw new ForbiddenException('Toko penyedia tidak ditemukan untuk akun ini.');
    }
    return store;
  }

  async getTimelineOrders(userId: string) {
    const store = await this.getProviderStoreByUserId(userId);

    const orders = await this.prisma.rentalOrder.findMany({
      where: { providerStoreId: store.id },
      orderBy: { createdAt: 'desc' },
      include: {
        tenant: {
          include: {
            profile: true,
          },
        },
        items: true,
        meetup: true,
        pricing: true,
        reviews: true,
      },
    });

    const pendingCount = orders.filter(
      (o) => o.lifecycleStatus === OrderLifecycleStatus.PENDING_CONFIRMATION,
    ).length;
    const activeCount = orders.filter(
      (o) =>
        o.lifecycleStatus === OrderLifecycleStatus.CONFIRMED ||
        o.lifecycleStatus === OrderLifecycleStatus.ACTIVE_RENTAL,
    ).length;
    const completedCount = orders.filter(
      (o) => o.lifecycleStatus === OrderLifecycleStatus.COMPLETED,
    ).length;

    const formattedOrders = orders.map((order) => {
      const userReview = order.reviews.find((r) => r.authorRole === ReviewAuthorRole.TENANT);
      const providerReview = order.reviews.find((r) => r.authorRole === ReviewAuthorRole.PROVIDER);

      return {
        id: order.id,
        lifecycleStatus: order.lifecycleStatus,
        createdAt: order.createdAt.toISOString(),
        confirmedAt: order.confirmedAt ? order.confirmedAt.toISOString() : null,
        completedAt: order.completedAt ? order.completedAt.toISOString() : null,
        bookingNotes: order.bookingNotes,
        rejectionReason: order.rejectionReason,
        customer: {
          id: order.tenant.id,
          fullName: order.tenant.fullName,
          phone: order.tenant.phone,
          email: order.tenant.email,
          isKycVerified: order.tenant.isKycVerified,
          kycStatus: order.tenant.kycStatus,
          city: order.tenant.profile?.cityText || null,
        },
        items: order.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          primaryImage: item.primaryImageUrl,
          quantity: item.quantity,
          rentalDays: item.rentalDays,
          startDate: formatDateToYMD(item.startDate),
          endDate: formatDateToYMD(item.endDate),
          dailyRate: Number(item.dailyRate),
          depositRate: Number(item.depositRate),
          totalAmount: Number(item.totalAmount),
        })),
        meetup: order.meetup
          ? {
              locationType: order.meetup.locationType,
              locationName: order.meetup.locationName,
              locationAddress: order.meetup.locationAddress,
              scheduleDate: formatDateToYMD(order.meetup.scheduleDate),
              scheduleTime: order.meetup.scheduleTime,
              notes: order.meetup.notes,
            }
          : null,
        pricing: order.pricing
          ? {
              subtotalRental: Number(order.pricing.subtotalRental),
              totalDeposit: Number(order.pricing.totalDeposit),
              deliveryFee: Number(order.pricing.deliveryFee),
              grandTotal: Number(order.pricing.grandTotal),
            }
          : null,
        signedAgreementUrl: order.signedAgreementUrl,
        paymentBillUrl: order.paymentBillUrl,
        userReview: userReview
          ? {
              overallRating: userReview.overallRating,
              comment: userReview.comment,
              tags: userReview.tags,
            }
          : null,
        providerReview: providerReview
          ? {
              overallRating: providerReview.overallRating,
              comment: providerReview.comment,
              tags: providerReview.tags,
            }
          : null,
      };
    });

    return {
      pendingCount,
      activeCount,
      completedCount,
      orders: formattedOrders,
    };
  }

  async confirmOrder(userId: string, orderId: string) {
    const store = await this.getProviderStoreByUserId(userId);
    const order = await this.prisma.rentalOrder.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Pesanan '${orderId}' tidak ditemukan.`);
    }

    if (order.providerStoreId !== store.id) {
      throw new ForbiddenException('Pesanan ini bukan milik toko Anda.');
    }

    if (order.lifecycleStatus !== OrderLifecycleStatus.PENDING_CONFIRMATION) {
      throw new BadRequestException(
        `Pesanan tidak dapat dikonfirmasi pada status ${order.lifecycleStatus}.`,
      );
    }

    const updated = await this.prisma.rentalOrder.update({
      where: { id: orderId },
      data: {
        lifecycleStatus: OrderLifecycleStatus.CONFIRMED,
        confirmedAt: new Date(),
      },
    });

    return {
      orderId: updated.id,
      lifecycleStatus: updated.lifecycleStatus,
      documentNo: `SP-EPS-${updated.id}`,
    };
  }

  async rejectOrder(userId: string, orderId: string, dto: RejectOrderDto) {
    const store = await this.getProviderStoreByUserId(userId);
    const order = await this.prisma.rentalOrder.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Pesanan '${orderId}' tidak ditemukan.`);
    }

    if (order.providerStoreId !== store.id) {
      throw new ForbiddenException('Pesanan ini bukan milik toko Anda.');
    }

    const updated = await this.prisma.rentalOrder.update({
      where: { id: orderId },
      data: {
        lifecycleStatus: OrderLifecycleStatus.REJECTED,
        rejectionReason: dto.reason,
      },
    });

    return {
      orderId: updated.id,
      lifecycleStatus: updated.lifecycleStatus,
    };
  }

  async uploadDocuments(
    userId: string,
    orderId: string,
    files: {
      signedAgreementFile?: Express.Multer.File[];
      paymentBillFile?: Express.Multer.File[];
    },
  ) {
    const store = await this.getProviderStoreByUserId(userId);
    const order = await this.prisma.rentalOrder.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Pesanan '${orderId}' tidak ditemukan.`);
    }

    if (order.providerStoreId !== store.id) {
      throw new ForbiddenException('Pesanan ini bukan milik toko Anda.');
    }

    let signedAgreementUrl = order.signedAgreementUrl;
    let paymentBillUrl = order.paymentBillUrl;

    if (files.signedAgreementFile && files.signedAgreementFile[0]) {
      const saved = await this.storageService.saveFile(files.signedAgreementFile[0], 'agreements');
      signedAgreementUrl = saved.url;
    }

    if (files.paymentBillFile && files.paymentBillFile[0]) {
      const saved = await this.storageService.saveFile(files.paymentBillFile[0], 'bills');
      paymentBillUrl = saved.url;
    }

    const updated = await this.prisma.rentalOrder.update({
      where: { id: orderId },
      data: {
        signedAgreementUrl,
        paymentBillUrl,
        lifecycleStatus: OrderLifecycleStatus.ACTIVE_RENTAL,
      },
    });

    return {
      orderId: updated.id,
      signedAgreementUrl: updated.signedAgreementUrl,
      paymentBillUrl: updated.paymentBillUrl,
      canComplete: true,
    };
  }

  async completeOrder(userId: string, orderId: string) {
    const store = await this.getProviderStoreByUserId(userId);
    const order = await this.prisma.rentalOrder.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Pesanan '${orderId}' tidak ditemukan.`);
    }

    if (order.providerStoreId !== store.id) {
      throw new ForbiddenException('Pesanan ini bukan milik toko Anda.');
    }

    const updated = await this.prisma.rentalOrder.update({
      where: { id: orderId },
      data: {
        lifecycleStatus: OrderLifecycleStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    return {
      orderId: updated.id,
      lifecycleStatus: updated.lifecycleStatus,
      completedAt: updated.completedAt?.toISOString(),
    };
  }

  async reviewTenant(userId: string, orderId: string, dto: ProviderReviewTenantDto) {
    const store = await this.getProviderStoreByUserId(userId);
    const order = await this.prisma.rentalOrder.findUnique({
      where: { id: orderId },
      include: { reviews: true },
    });

    if (!order) {
      throw new NotFoundException(`Pesanan '${orderId}' tidak ditemukan.`);
    }

    if (order.providerStoreId !== store.id) {
      throw new ForbiddenException('Pesanan ini bukan milik toko Anda.');
    }

    const existingReview = order.reviews.find(
      (r) => r.authorRole === ReviewAuthorRole.PROVIDER && r.authorUserId === userId,
    );
    if (existingReview) {
      throw new ConflictException('Anda sudah memberikan ulasan reputasi untuk penyewa ini.');
    }

    const review = await this.prisma.rentalReview.create({
      data: {
        orderId: order.id,
        authorUserId: userId,
        targetUserId: order.tenantUserId,
        authorRole: ReviewAuthorRole.PROVIDER,
        overallRating: dto.rating,
        comment: dto.comment,
        tags: dto.badges || [],
      },
    });

    return {
      reviewId: review.id,
      orderId: review.orderId,
      overallRating: review.overallRating,
      comment: review.comment,
      badges: review.tags,
      createdAt: review.createdAt.toISOString(),
    };
  }
}
