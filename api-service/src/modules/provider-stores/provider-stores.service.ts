import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ProviderStoresService {
  constructor(private prisma: PrismaService) {}

  async findOne(idOrSlug: string) {
    const store = await this.prisma.providerStore.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        isActive: true,
      },
      include: {
        products: {
          where: { isPublished: true, isActive: true },
          include: {
            images: { orderBy: { displayOrder: 'asc' } },
            category: true,
          },
        },
      },
    });

    if (!store) {
      throw new NotFoundException(`Toko penyedia '${idOrSlug}' tidak ditemukan.`);
    }

    return {
      id: store.id,
      storeName: store.storeName,
      slug: store.slug,
      description: store.description,
      phone: store.phone,
      email: store.email,
      address: store.address,
      rating: Number(store.rating),
      reviewCount: store.reviewCount,
      isVerified: store.isVerified,
      productsCount: store.products.length,
      products: store.products.map((p) => {
        const primaryImg = p.images.find((img) => img.isPrimary) || p.images[0];
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          category: p.category.code,
          dailyRate: Number(p.dailyRate),
          primaryImage: primaryImg ? primaryImg.imageUrl : null,
          condition: p.condition,
          badgeText: p.badgeText,
          location: p.location,
        };
      }),
    };
  }
}
