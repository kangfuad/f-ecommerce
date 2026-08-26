import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderLifecycleStatus, ReviewAuthorRole } from '@prisma/client';
import { addDays, formatDateToYMD } from '../../common/utils/helpers.util';
import { generateOrderId } from '../../common/utils/order-id.util';
import { PrismaService } from '../../database/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { ExtendOrderDto } from './dto/extend-order.dto';

@Injectable()
export class RentalOrdersService {
  constructor(private prisma: PrismaService) {}

  async createBooking(tenantUserId: string, dto: CreateBookingDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Pesanan sewa harus memiliki minimal 1 produk.');
    }

    // 1. Fetch products to get store IDs and primary images
    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        providerStore: true,
      },
    });

    if (products.length === 0) {
      throw new BadRequestException('Produk yang dipilih tidak ditemukan.');
    }

    const firstProduct = products[0];
    const providerStoreId = firstProduct.providerStoreId;

    // Calculate Totals
    let subtotalRental = 0;
    let totalDeposit = 0;

    const orderItemsData = dto.items.map((item) => {
      const dbProduct = products.find((p) => p.id === item.productId);
      const productName = dbProduct ? dbProduct.name : 'Unit Perlengkapan Sewa';
      const primaryImg = dbProduct?.images?.find((img) => img.isPrimary) || dbProduct?.images?.[0];
      const dailyRate = Number(item.dailyRate);
      const quantity = item.quantity || 1;
      const rentalDays = item.rentalDays || 1;
      const itemTotal = dailyRate * quantity * rentalDays;
      const itemDeposit = (item.depositRate !== undefined ? Number(item.depositRate) : Number(dbProduct?.depositAmount || 0)) * quantity;

      subtotalRental += itemTotal;
      totalDeposit += itemDeposit;

      return {
        productId: item.productId,
        productName,
        primaryImageUrl: primaryImg ? primaryImg.imageUrl : null,
        quantity,
        rentalDays,
        startDate: new Date(item.startDate),
        endDate: new Date(item.endDate),
        dailyRate,
        depositRate: itemDeposit,
        totalAmount: itemTotal,
      };
    });

    const deliveryFee = 0;
    const grandTotal = subtotalRental + deliveryFee;
    const orderId = generateOrderId();

    // 2. Persist to Database
    const order = await this.prisma.rentalOrder.create({
      data: {
        id: orderId,
        tenantUserId,
        providerStoreId,
        lifecycleStatus: OrderLifecycleStatus.PENDING_CONFIRMATION,
        bookingNotes: dto.bookingNotes,
        items: {
          create: orderItemsData,
        },
        meetup: {
          create: {
            locationType: dto.meetup.locationType,
            locationName: dto.meetup.locationName,
            locationAddress: dto.meetup.locationAddress,
            scheduleDate: new Date(dto.meetup.scheduleDate),
            scheduleTime: dto.meetup.scheduleTime,
            notes: dto.meetup.notes,
          },
        },
        pricing: {
          create: {
            subtotalRental,
            totalDeposit,
            deliveryFee,
            grandTotal,
          },
        },
      },
      include: {
        items: true,
        meetup: true,
        pricing: true,
      },
    });

    return {
      orderId: order.id,
      lifecycleStatus: order.lifecycleStatus,
      grandTotal: Number(order.pricing?.grandTotal || grandTotal),
      createdAt: order.createdAt.toISOString(),
      nextStep: 'Menunggu konfirmasi jadwal & ketersediaan dari mitra penyedia sewa.',
    };
  }

  async getMyOrders(userId: string, statusFilter?: string) {
    const where: any = {
      tenantUserId: userId,
    };

    if (statusFilter && statusFilter !== 'ALL') {
      if (statusFilter === 'PENDING') {
        where.lifecycleStatus = OrderLifecycleStatus.PENDING_CONFIRMATION;
      } else if (statusFilter === 'ACTIVE') {
        where.lifecycleStatus = {
          in: [OrderLifecycleStatus.CONFIRMED, OrderLifecycleStatus.ACTIVE_RENTAL],
        };
      } else if (statusFilter === 'COMPLETED') {
        where.lifecycleStatus = OrderLifecycleStatus.COMPLETED;
      } else if (statusFilter === 'REJECTED') {
        where.lifecycleStatus = OrderLifecycleStatus.REJECTED;
      } else {
        where.lifecycleStatus = statusFilter as OrderLifecycleStatus;
      }
    }

    const orders = await this.prisma.rentalOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        providerStore: true,
        items: true,
        meetup: true,
        pricing: true,
        reviews: true,
      },
    });

    return orders.map((order) => {
      const userReview = order.reviews.find(
        (r) => r.authorRole === ReviewAuthorRole.TENANT,
      );
      const providerReview = order.reviews.find(
        (r) => r.authorRole === ReviewAuthorRole.PROVIDER,
      );

      return {
        id: order.id,
        lifecycleStatus: order.lifecycleStatus,
        bookingNotes: order.bookingNotes,
        rejectionReason: order.rejectionReason,
        confirmedAt: order.confirmedAt ? order.confirmedAt.toISOString() : null,
        completedAt: order.completedAt ? order.completedAt.toISOString() : null,
        signedAgreementUrl: order.signedAgreementUrl,
        paymentBillUrl: order.paymentBillUrl,
        createdAt: order.createdAt.toISOString(),
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
        provider: {
          id: order.providerStore.id,
          name: order.providerStore.storeName,
          slug: order.providerStore.slug,
          phone: order.providerStore.phone,
          address: order.providerStore.address,
        },
        userReview: userReview
          ? {
              id: userReview.id,
              overallRating: userReview.overallRating,
              comment: userReview.comment,
              tags: userReview.tags,
              createdAt: userReview.createdAt.toISOString(),
            }
          : null,
        providerReview: providerReview
          ? {
              id: providerReview.id,
              overallRating: providerReview.overallRating,
              comment: providerReview.comment,
              tags: providerReview.tags,
              createdAt: providerReview.createdAt.toISOString(),
            }
          : null,
      };
    });
  }

  async extendOrder(userId: string, orderId: string, dto: ExtendOrderDto) {
    const order = await this.prisma.rentalOrder.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        pricing: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Pesanan '${orderId}' tidak ditemukan.`);
    }

    if (order.tenantUserId !== userId) {
      throw new ForbiddenException('Anda tidak memiliki hak untuk memperpanjang pesanan ini.');
    }

    if (
      order.lifecycleStatus !== OrderLifecycleStatus.ACTIVE_RENTAL &&
      order.lifecycleStatus !== OrderLifecycleStatus.CONFIRMED
    ) {
      throw new BadRequestException(
        `Perpanjangan sewa hanya dapat dilakukan saat status pesanan AKTIF (Status saat ini: ${order.lifecycleStatus}).`,
      );
    }

    let additionalFee = 0;
    let updatedLatestEndDate = new Date();

    // Update each order item
    for (const item of order.items) {
      const currentEnd = new Date(item.endDate);
      const newEnd = addDays(currentEnd, dto.additionalDays);
      const newDays = item.rentalDays + dto.additionalDays;
      const extraCost = Number(item.dailyRate) * item.quantity * dto.additionalDays;
      const newTotal = Number(item.totalAmount) + extraCost;

      additionalFee += extraCost;
      if (newEnd > updatedLatestEndDate) {
        updatedLatestEndDate = newEnd;
      }

      await this.prisma.orderItem.update({
        where: { id: item.id },
        data: {
          endDate: newEnd,
          rentalDays: newDays,
          totalAmount: newTotal,
        },
      });
    }

    // Update order pricing
    if (order.pricing) {
      const newSubtotal = Number(order.pricing.subtotalRental) + additionalFee;
      const newGrandTotal = Number(order.pricing.grandTotal) + additionalFee;

      await this.prisma.orderPricing.update({
        where: { id: order.pricing.id },
        data: {
          subtotalRental: newSubtotal,
          grandTotal: newGrandTotal,
        },
      });
    }

    return {
      orderId: order.id,
      additionalDays: dto.additionalDays,
      additionalFee,
      newEndDate: formatDateToYMD(updatedLatestEndDate),
    };
  }

  async createTenantReview(userId: string, orderId: string, dto: CreateReviewDto) {
    const order = await this.prisma.rentalOrder.findUnique({
      where: { id: orderId },
      include: {
        providerStore: true,
        reviews: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Pesanan '${orderId}' tidak ditemukan.`);
    }

    if (order.tenantUserId !== userId) {
      throw new ForbiddenException('Anda bukan penyewa dari pesanan ini.');
    }

    const existingReview = order.reviews.find(
      (r) => r.authorRole === ReviewAuthorRole.TENANT && r.authorUserId === userId,
    );
    if (existingReview) {
      throw new ConflictException('Anda sudah memberikan ulasan untuk pesanan ini.');
    }

    const targetUserId = order.providerStore.userId;

    const review = await this.prisma.rentalReview.create({
      data: {
        orderId: order.id,
        authorUserId: userId,
        targetUserId,
        authorRole: ReviewAuthorRole.TENANT,
        overallRating: dto.rating,
        comment: dto.comment,
        tags: dto.tags || [],
      },
    });

    // Update provider store rating
    const allStoreReviews = await this.prisma.rentalReview.findMany({
      where: {
        targetUserId,
        authorRole: ReviewAuthorRole.TENANT,
      },
    });

    const totalRatings = allStoreReviews.reduce((sum, r) => sum + r.overallRating, 0);
    const avgRating = totalRatings / allStoreReviews.length;

    await this.prisma.providerStore.update({
      where: { id: order.providerStoreId },
      data: {
        rating: Number(avgRating.toFixed(2)),
        reviewCount: allStoreReviews.length,
      },
    });

    return {
      reviewId: review.id,
      orderId: review.orderId,
      overallRating: review.overallRating,
      comment: review.comment,
      tags: review.tags,
      createdAt: review.createdAt.toISOString(),
    };
  }
}
