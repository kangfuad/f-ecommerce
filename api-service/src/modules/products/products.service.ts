import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { PrismaService } from '../../database/prisma.service';
import { ProductQueryDto, ProductSortBy } from './dto/product-query.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll(query: ProductQueryDto) {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      condition,
      location,
      sortBy = ProductSortBy.POPULAR,
      page = 1,
      limit = 12,
    } = query;

    const cacheKey = `products:list:${JSON.stringify({
      category,
      search,
      minPrice,
      maxPrice,
      condition,
      location,
      sortBy,
      page,
      limit,
    })}`;

    try {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        return cached;
      }
    } catch (e) {
      this.logger.warn(`Redis cache get error: ${e.message}`);
    }

    // Build Prisma Where Clause
    const where: any = {
      isPublished: true,
      isActive: true,
    };

    if (category) {
      where.OR = [
        { categoryId: category },
        { category: { code: category } },
        { category: { slug: category } },
      ];
    }

    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { location: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.dailyRate = {};
      if (minPrice !== undefined) {
        where.dailyRate.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.dailyRate.lte = maxPrice;
      }
    }

    if (condition) {
      where.condition = condition;
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    // Determine Sort Order
    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === ProductSortBy.PRICE_ASC) {
      orderBy = { dailyRate: 'asc' };
    } else if (sortBy === ProductSortBy.PRICE_DESC) {
      orderBy = { dailyRate: 'desc' };
    } else if (sortBy === ProductSortBy.RATING) {
      orderBy = { providerStore: { rating: 'desc' } };
    } else if (sortBy === ProductSortBy.NEWEST) {
      orderBy = { createdAt: 'desc' };
    } else if (sortBy === ProductSortBy.POPULAR) {
      orderBy = { providerStore: { reviewCount: 'desc' } };
    }

    const skip = (page - 1) * limit;

    const [totalItems, products] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: true,
          providerStore: true,
          images: {
            orderBy: { displayOrder: 'asc' },
          },
          includedItems: {
            orderBy: { displayOrder: 'asc' },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    const formattedData = products.map((prod) => {
      const primaryImgObj = prod.images.find((img) => img.isPrimary) || prod.images[0];
      return {
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        category: prod.category.code,
        categoryName: prod.category.name,
        description: prod.description,
        dailyRate: Number(prod.dailyRate),
        depositAmount: Number(prod.depositAmount),
        rating: Number(prod.providerStore.rating),
        reviewCount: prod.providerStore.reviewCount,
        condition: prod.condition,
        badgeText: prod.badgeText || null,
        location: prod.location || 'Jakarta Selatan',
        stockTotal: prod.stockTotal,
        stockAvailable: prod.stockAvailable,
        primaryImage: primaryImgObj ? primaryImgObj.imageUrl : null,
        images: prod.images.map((img) => img.imageUrl),
        includedItems: prod.includedItems.map((item) => item.itemName),
        provider: {
          id: prod.providerStore.id,
          name: prod.providerStore.storeName,
          slug: prod.providerStore.slug,
          phone: prod.providerStore.phone,
          rating: Number(prod.providerStore.rating),
          isVerified: prod.providerStore.isVerified,
        },
      };
    });

    const result = {
      message: 'Daftar katalog berhasil diambil.',
      data: formattedData,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        limit,
      },
    };

    try {
      await this.cacheManager.set(cacheKey, result, 600000); // 10 mins TTL
    } catch (e) {
      this.logger.warn(`Redis cache set error: ${e.message}`);
    }

    return result;
  }

  async findOne(idOrSlug: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        isPublished: true,
        isActive: true,
      },
      include: {
        category: true,
        providerStore: true,
        images: {
          orderBy: { displayOrder: 'asc' },
        },
        includedItems: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Produk dengan identitas '${idOrSlug}' tidak ditemukan.`);
    }

    const primaryImgObj = product.images.find((img) => img.isPrimary) || product.images[0];

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      category: product.category.code,
      categoryName: product.category.name,
      description: product.description,
      dailyRate: Number(product.dailyRate),
      depositAmount: Number(product.depositAmount),
      condition: product.condition,
      rating: Number(product.providerStore.rating),
      reviewCount: product.providerStore.reviewCount,
      badgeText: product.badgeText || null,
      location: product.location || 'Jakarta Selatan',
      stockTotal: product.stockTotal,
      stockAvailable: product.stockAvailable,
      primaryImage: primaryImgObj ? primaryImgObj.imageUrl : null,
      images: product.images.map((img) => img.imageUrl),
      includedItems: product.includedItems.map((item) => item.itemName),
      includedItemsDetailed: product.includedItems.map((item) => ({
        id: item.id,
        itemName: item.itemName,
        quantity: item.quantity,
      })),
      provider: {
        id: product.providerStore.id,
        name: product.providerStore.storeName,
        slug: product.providerStore.slug,
        address: product.providerStore.address,
        phone: product.providerStore.phone,
        rating: Number(product.providerStore.rating),
        reviewCount: product.providerStore.reviewCount,
        isVerified: product.providerStore.isVerified,
      },
    };
  }
}
