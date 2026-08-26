import {
  ItemCondition,
  KycStatus,
  MeetupLocationType,
  OrderLifecycleStatus,
  PrismaClient,
  ReviewAuthorRole,
} from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting e-punyasewa database seeding...');

  // 1. Clean existing records in reverse dependency order
  await prisma.rentalReview.deleteMany();
  await prisma.orderPricing.deleteMany();
  await prisma.orderMeetup.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.rentalOrder.deleteMany();
  await prisma.productIncludedItem.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.providerStore.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned previous database records.');

  // 2. Hash default passwords
  const passwordProvider = await argon2.hash('PasswordRahasia123!');
  const passwordTenant = await argon2.hash('PasswordKuat123!');

  // 3. Seed Users
  const userAuri = await prisma.user.create({
    data: {
      id: 'usr_01jk98az89',
      fullName: 'Auri Fuad',
      displayName: 'Auri Fuad',
      email: 'auri.fuad@example.com',
      phone: '081234567890',
      passwordHash: passwordProvider,
      initials: 'AF',
      isKycVerified: true,
      kycStatus: KycStatus.VERIFIED,
      hasProviderStore: true,
      profile: {
        create: {
          profession: 'Sinematografer & Produser',
          companyOrStudio: 'Cinema Works Asia',
          socialMediaInstagram: '@aurifilm',
          provinceId: '31',
          provinceName: 'DKI JAKARTA',
          regencyId: '3171',
          regencyName: 'KOTA JAKARTA SELATAN',
          districtId: '3171060',
          districtName: 'KEBAYORAN BARU',
          villageId: '3171060008',
          villageName: 'SELONG',
          cityText: 'Kel. Selong, Kec. Kebayoran Baru, Kota Jakarta Selatan, DKI Jakarta',
          address: 'Jl. Gandaria 1 No. 12',
          postalCode: '12190',
          emergencyContactName: 'Rina Fuad',
          emergencyPhone: '081298765432',
          emergencyRelation: 'Pasangan',
          bio: 'Spesialis produksi video komersial, bioskop, dan drone berlisensi resmi.',
        },
      },
    },
  });

  const userBudi = await prisma.user.create({
    data: {
      id: 'usr_02jk99bb12',
      fullName: 'Budi Santoso',
      displayName: 'Budi Santoso',
      email: 'budi.santoso@example.com',
      phone: '081399887766',
      passwordHash: passwordTenant,
      initials: 'BS',
      isKycVerified: true,
      kycStatus: KycStatus.VERIFIED,
      hasProviderStore: false,
      profile: {
        create: {
          profession: 'Fotografer Event & Wedding',
          companyOrStudio: 'Budi Moments',
          socialMediaInstagram: '@budisantosophoto',
          provinceId: '32',
          provinceName: 'JAWA BARAT',
          regencyId: '3273',
          regencyName: 'KOTA BANDUNG',
          districtId: '3273010',
          districtName: 'COBLONG',
          villageId: '3273010001',
          villageName: 'DAGO',
          cityText: 'Dago, Kec. Coblong, Kota Bandung, Jawa Barat',
          address: 'Jl. Ir. H. Juanda No. 88, Dago',
          postalCode: '40135',
          emergencyContactName: 'Siti Rahma',
          emergencyPhone: '081311223344',
          emergencyRelation: 'Ibu Kandung',
          bio: 'Dokumentasi visual pernikahan dan kegiatan korporat profesional.',
        },
      },
    },
  });

  const userDian = await prisma.user.create({
    data: {
      id: 'usr_03jk77cc34',
      fullName: 'Dian Pratama',
      displayName: 'Dian Pratama',
      email: 'dian.pratama@example.com',
      phone: '081987654321',
      passwordHash: passwordTenant,
      initials: 'DP',
      isKycVerified: true,
      kycStatus: KycStatus.VERIFIED,
      hasProviderStore: false,
      profile: {
        create: {
          profession: 'Content Creator & Indie Filmmaker',
          companyOrStudio: 'Dian Visuals',
          socialMediaInstagram: '@dianvisuals',
          provinceId: '35',
          provinceName: 'JAWA TIMUR',
          regencyId: '3578',
          regencyName: 'KOTA SURABAYA',
          cityText: 'Kota Surabaya, Jawa Timur',
          address: 'Jl. Raya Darmo No. 40',
          postalCode: '60241',
          emergencyContactName: 'Hendro Pratama',
          emergencyPhone: '081900112233',
          emergencyRelation: 'Kakak',
          bio: 'Kreator konten digital kreatif dan sutradara film pendek independen.',
        },
      },
    },
  });

  console.log('👤 Seeded users & profiles.');

  // 4. Seed Provider Store
  const providerStore = await prisma.providerStore.create({
    data: {
      id: 'prv_01',
      userId: userAuri.id,
      storeName: 'CinemaTech Rental Jakarta',
      slug: 'cinematech-rental-jakarta',
      description:
        'Penyedia rental kamera bioskop, lensa prime/zoom, drone aerial 5.1K Apple ProRes, dan audio profesional terpercaya dengan unit berstandar QC industri.',
      phone: '0811-9876-5432',
      email: 'rental@cinematech.id',
      address: 'Jl. Gandaria 1 No. 12, Kebayoran Baru, Jakarta Selatan',
      provinceId: '31',
      regencyId: '3171',
      rating: 5.0,
      reviewCount: 42,
      isVerified: true,
      isActive: true,
    },
  });

  console.log('🏪 Seeded provider store: CinemaTech Rental Jakarta.');

  // 5. Seed Categories
  const categories = [
    {
      id: 'CAMERA',
      code: 'CAMERA',
      name: 'Kamera & Lensa Bioskop',
      slug: 'kamera-dan-lensa',
      iconName: 'camera',
      description: 'Kamera sinema full-frame, mirrorless profesional, dan set lensa cinema prime.',
      displayOrder: 1,
    },
    {
      id: 'DRONE_AUDIO',
      code: 'DRONE_AUDIO',
      name: 'Drone & Audio Lapangan',
      slug: 'drone-dan-audio',
      iconName: 'mic',
      description: 'Drone aerial 4K/5.1K, wireless mic lavalier, boom shotgun mic, dan field audio recorder.',
      displayOrder: 2,
    },
    {
      id: 'OUTDOOR',
      code: 'OUTDOOR',
      name: 'Peralatan Outdoor & Camping',
      slug: 'peralatan-outdoor',
      iconName: 'compass',
      description: 'Tenda dome kapasitas besar, portable power station, cooler box, dan gear petualangan.',
      displayOrder: 3,
    },
    {
      id: 'LAPTOP_GADGET',
      code: 'LAPTOP_GADGET',
      name: 'Laptop & Gadget Multimedia',
      slug: 'laptop-dan-gadget',
      iconName: 'laptop',
      description: 'Laptop editing performa tinggi Apple MacBook Pro & workstation render portabel.',
      displayOrder: 4,
    },
    {
      id: 'STAGE_EVENT',
      code: 'STAGE_EVENT',
      name: 'Tata Panggung & Lighting',
      slug: 'tata-panggung-lighting',
      iconName: 'sun',
      description: 'Lampu continuous studio COB, panel LED RGBWW, softbox, C-Stand, dan kabel distribusi.',
      displayOrder: 5,
    },
  ];

  for (const cat of categories) {
    await prisma.category.create({ data: cat });
  }

  console.log('📁 Seeded categories.');

  // 6. Seed Products
  const productFx3 = await prisma.product.create({
    data: {
      id: 'eps_cam_01',
      providerStoreId: providerStore.id,
      categoryId: 'CAMERA',
      name: 'Sony FX3 Full-Frame Cinema Line Camera',
      slug: 'sony-fx3-full-frame-cinema-line-camera',
      description:
        'Kamera sinema full-frame ringkas dengan sensor 10.2MP BSI CMOS, 4K 120p 10-bit 4:2:2, 15+ stops dynamic range, S-Cinetone, dan pegangan audio XLR ganda.',
      dailyRate: 650000,
      depositAmount: 3000000,
      condition: ItemCondition.LIKE_NEW,
      badgeText: 'POPULAR',
      location: 'Jakarta Selatan (Hub Gandaria)',
      stockTotal: 4,
      stockAvailable: 3,
      isPublished: true,
      isActive: true,
      images: {
        create: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800',
            isPrimary: true,
            displayOrder: 1,
          },
          {
            imageUrl: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800',
            isPrimary: false,
            displayOrder: 2,
          },
        ],
      },
      includedItems: {
        create: [
          { itemName: '1x Bodi Sony FX3 Cinema Line', quantity: 1, displayOrder: 1 },
          { itemName: '1x XLR Audio Handle Unit Original', quantity: 1, displayOrder: 2 },
          { itemName: '3x Baterai Sony NP-FZ100 Original', quantity: 3, displayOrder: 3 },
          { itemName: '1x Dual Fast Charger Digital', quantity: 1, displayOrder: 4 },
          { itemName: '2x Kartu CFexpress Type A 160GB VPG200', quantity: 2, displayOrder: 5 },
          { itemName: '1x Hardcase Waterproof Pelindung Heavy Duty', quantity: 1, displayOrder: 6 },
        ],
      },
    },
  });

  const productMavic = await prisma.product.create({
    data: {
      id: 'eps_drone_01',
      providerStoreId: providerStore.id,
      categoryId: 'DRONE_AUDIO',
      name: 'DJI Mavic 3 Pro Cine Combo Drone',
      slug: 'dji-mavic-3-pro-cine-combo-drone',
      description:
        'Drone flagship dengan triple-camera Hasselblad Apple ProRes 422 HQ, transmisi O3+ hingga 15km, sensor omnidirectional obstacle sensing, dan waktu terbang hingga 43 menit.',
      dailyRate: 550000,
      depositAmount: 2500000,
      condition: ItemCondition.LIKE_NEW,
      badgeText: 'POPULAR',
      location: 'Jakarta Selatan',
      stockTotal: 3,
      stockAvailable: 2,
      isPublished: true,
      isActive: true,
      images: {
        create: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800',
            isPrimary: true,
            displayOrder: 1,
          },
          {
            imageUrl: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800',
            isPrimary: false,
            displayOrder: 2,
          },
        ],
      },
      includedItems: {
        create: [
          { itemName: '1x Drone DJI Mavic 3 Pro Cine Edition', quantity: 1, displayOrder: 1 },
          { itemName: '1x Smart Remote Controller DJI RC Pro', quantity: 1, displayOrder: 2 },
          { itemName: '3x Baterai Intelligent Flight Battery', quantity: 3, displayOrder: 3 },
          { itemName: '1x ND Filter Set Asli (ND8/16/32/64)', quantity: 1, displayOrder: 4 },
          { itemName: '1x Battery Charging Hub 100W', quantity: 1, displayOrder: 5 },
          { itemName: '1x Hardcase Safety Pelindung Anti Benturan', quantity: 1, displayOrder: 6 },
        ],
      },
    },
  });

  const productMic = await prisma.product.create({
    data: {
      id: 'eps_audio_01',
      providerStoreId: providerStore.id,
      categoryId: 'DRONE_AUDIO',
      name: 'Sennheiser EW-DP ME2 Wireless Microphone Set',
      slug: 'sennheiser-ew-dp-me2-wireless-microphone-set',
      description:
        'Sistem wireless audio digital portabel UHF dengan dynamic range 134 dB, transmisi stabil ultra-low latency, dan mic lavalier omnidirectional ME 2.',
      dailyRate: 225000,
      depositAmount: 1000000,
      condition: ItemCondition.EXCELLENT,
      badgeText: 'RECOMMENDED',
      location: 'Jakarta Selatan',
      stockTotal: 5,
      stockAvailable: 4,
      isPublished: true,
      isActive: true,
      images: {
        create: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800',
            isPrimary: true,
            displayOrder: 1,
          },
        ],
      },
      includedItems: {
        create: [
          { itemName: '1x EW-DP EK Portable Receiver', quantity: 1, displayOrder: 1 },
          { itemName: '1x EW-D SK Bodypack Transmitter', quantity: 1, displayOrder: 2 },
          { itemName: '1x Clip-on Lavalier Mic Sennheiser ME 2', quantity: 1, displayOrder: 3 },
          { itemName: '2x BA 70 Rechargeable Battery Pack', quantity: 2, displayOrder: 4 },
          { itemName: '1x Kabel Locking 3.5mm TRS & XLR Cable', quantity: 1, displayOrder: 5 },
        ],
      },
    },
  });

  const productLens = await prisma.product.create({
    data: {
      id: 'eps_cam_02',
      providerStoreId: providerStore.id,
      categoryId: 'CAMERA',
      name: 'Sony FE 24-70mm f/2.8 GM II Lens',
      slug: 'sony-fe-24-70mm-f28-gm-ii-lens',
      description:
        'Lensa zoom standar G Master generasi kedua yang lebih ringan, tajam, dengan 4 motor XD Linear untuk autofokus super cepat.',
      dailyRate: 350000,
      depositAmount: 2000000,
      condition: ItemCondition.NEW,
      badgeText: 'POPULAR',
      location: 'Jakarta Selatan',
      stockTotal: 3,
      stockAvailable: 3,
      isPublished: true,
      isActive: true,
      images: {
        create: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800',
            isPrimary: true,
            displayOrder: 1,
          },
        ],
      },
      includedItems: {
        create: [
          { itemName: '1x Lensa Sony FE 24-70mm GM II', quantity: 1, displayOrder: 1 },
          { itemName: '1x Front Cap & Rear Cap', quantity: 1, displayOrder: 2 },
          { itemName: '1x Lens Hood ALC-SH168', quantity: 1, displayOrder: 3 },
          { itemName: '1x UV Filter B+W Master 82mm', quantity: 1, displayOrder: 4 },
          { itemName: '1x Padded Pouch Case', quantity: 1, displayOrder: 5 },
        ],
      },
    },
  });

  const productLight = await prisma.product.create({
    data: {
      id: 'eps_light_01',
      providerStoreId: providerStore.id,
      categoryId: 'STAGE_EVENT',
      name: 'Aputure LS 600d Pro Daylight LED Kit',
      slug: 'aputure-ls-600d-pro-daylight-led-kit',
      description:
        'Lampu continuous studio 600W daylight 5600K weather-resistant dengan Bowens mount dan kontroler nirkabel Sidus Link.',
      dailyRate: 480000,
      depositAmount: 2200000,
      condition: ItemCondition.LIKE_NEW,
      badgeText: 'RECOMMENDED',
      location: 'Jakarta Selatan',
      stockTotal: 2,
      stockAvailable: 2,
      isPublished: true,
      isActive: true,
      images: {
        create: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800',
            isPrimary: true,
            displayOrder: 1,
          },
        ],
      },
      includedItems: {
        create: [
          { itemName: '1x Lamp Head LS 600d Pro', quantity: 1, displayOrder: 1 },
          { itemName: '1x Control Box & Power Cable Neutrik', quantity: 1, displayOrder: 2 },
          { itemName: '1x Hyper Reflector 55°', quantity: 1, displayOrder: 3 },
          { itemName: '1x C-Stand Heavy Duty with Boom Arm', quantity: 1, displayOrder: 4 },
          { itemName: '1x Rolling Hard Case', quantity: 1, displayOrder: 5 },
        ],
      },
    },
  });

  console.log('📦 Seeded product units and inventory.');

  // 7. Seed Sample Orders across all lifecycle states
  // Order 1: PENDING_CONFIRMATION (Tenant Budi -> Provider Auri)
  const order1 = await prisma.rentalOrder.create({
    data: {
      id: 'EPS-20260826-8901',
      tenantUserId: userBudi.id,
      providerStoreId: providerStore.id,
      lifecycleStatus: OrderLifecycleStatus.PENDING_CONFIRMATION,
      bookingNotes: 'Untuk dokumentasi video profile korporat klien di Sudirman.',
      items: {
        create: [
          {
            productId: productFx3.id,
            productName: productFx3.name,
            primaryImageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800',
            quantity: 1,
            rentalDays: 2,
            startDate: new Date('2026-08-28'),
            endDate: new Date('2026-08-30'),
            dailyRate: 650000,
            depositRate: 3000000,
            totalAmount: 1300000,
          },
        ],
      },
      meetup: {
        create: {
          locationType: MeetupLocationType.PROVIDER_HUB,
          locationName: 'Hub Gandaria Jakarta Selatan',
          locationAddress: 'Jl. Gandaria 1 No. 12, Kebayoran Baru, Jakarta Selatan',
          scheduleDate: new Date('2026-08-28'),
          scheduleTime: '09:00 WIB',
          notes: 'Uji fungsi dan penyerahan tanda bukti identitas asli di tempat.',
        },
      },
      pricing: {
        create: {
          subtotalRental: 1300000,
          totalDeposit: 3000000,
          deliveryFee: 0,
          grandTotal: 1300000,
        },
      },
    },
  });

  // Order 2: ACTIVE_RENTAL (Tenant Dian -> Provider Auri, with uploaded docs)
  const order2 = await prisma.rentalOrder.create({
    data: {
      id: 'EPS-20260826-8902',
      tenantUserId: userDian.id,
      providerStoreId: providerStore.id,
      lifecycleStatus: OrderLifecycleStatus.ACTIVE_RENTAL,
      bookingNotes: 'Shooting aerial projek video iklan properti.',
      confirmedAt: new Date('2026-08-25T08:00:00.000Z'),
      signedAgreementUrl: 'http://localhost:3000/uploads/samples/sp_eps_8902_signed.pdf',
      paymentBillUrl: 'http://localhost:3000/uploads/samples/bill_eps_8902.jpg',
      items: {
        create: [
          {
            productId: productMavic.id,
            productName: productMavic.name,
            primaryImageUrl: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800',
            quantity: 1,
            rentalDays: 3,
            startDate: new Date('2026-08-25'),
            endDate: new Date('2026-08-28'),
            dailyRate: 550000,
            depositRate: 2500000,
            totalAmount: 1650000,
          },
        ],
      },
      meetup: {
        create: {
          locationType: MeetupLocationType.PROVIDER_HUB,
          locationName: 'Hub Gandaria Jakarta Selatan',
          locationAddress: 'Jl. Gandaria 1 No. 12, Kebayoran Baru, Jakarta Selatan',
          scheduleDate: new Date('2026-08-25'),
          scheduleTime: '10:00 WIB',
        },
      },
      pricing: {
        create: {
          subtotalRental: 1650000,
          totalDeposit: 2500000,
          deliveryFee: 0,
          grandTotal: 1650000,
        },
      },
    },
  });

  // Order 3: COMPLETED (Tenant Budi -> Provider Auri, with reviews)
  const order3 = await prisma.rentalOrder.create({
    data: {
      id: 'EPS-20260826-8903',
      tenantUserId: userBudi.id,
      providerStoreId: providerStore.id,
      lifecycleStatus: OrderLifecycleStatus.COMPLETED,
      bookingNotes: 'Shooting interview seminar nasional.',
      confirmedAt: new Date('2026-08-20T09:00:00.000Z'),
      completedAt: new Date('2026-08-22T17:00:00.000Z'),
      signedAgreementUrl: 'http://localhost:3000/uploads/samples/sp_eps_8903_signed.pdf',
      paymentBillUrl: 'http://localhost:3000/uploads/samples/bill_eps_8903.jpg',
      items: {
        create: [
          {
            productId: productMic.id,
            productName: productMic.name,
            primaryImageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800',
            quantity: 1,
            rentalDays: 2,
            startDate: new Date('2026-08-20'),
            endDate: new Date('2026-08-22'),
            dailyRate: 225000,
            depositRate: 1000000,
            totalAmount: 450000,
          },
        ],
      },
      meetup: {
        create: {
          locationType: MeetupLocationType.PROVIDER_HUB,
          locationName: 'Hub Gandaria Jakarta Selatan',
          locationAddress: 'Jl. Gandaria 1 No. 12, Kebayoran Baru, Jakarta Selatan',
          scheduleDate: new Date('2026-08-20'),
          scheduleTime: '08:30 WIB',
        },
      },
      pricing: {
        create: {
          subtotalRental: 450000,
          totalDeposit: 1000000,
          deliveryFee: 0,
          grandTotal: 450000,
        },
      },
      reviews: {
        create: [
          {
            authorUserId: userBudi.id,
            targetUserId: userAuri.id,
            authorRole: ReviewAuthorRole.TENANT,
            overallRating: 5,
            comment: 'Mic Sennheiser sangat bersih sinyalnya, tanpa drop frekuensi sama sekali!',
            tags: ['Unit Bersih', 'Pelayanan Cepat', 'Sangat Direkomendasikan'],
          },
          {
            authorUserId: userAuri.id,
            targetUserId: userBudi.id,
            authorRole: ReviewAuthorRole.PROVIDER,
            overallRating: 5,
            comment: 'Penyewa sangat komunikatif, tepat waktu, dan unit kembali dalam kondisi bersih mulus.',
            tags: ['Pengembalian Tepat Waktu', 'Unit Terawat Sangat Baik'],
          },
        ],
      },
    },
  });

  console.log('🛒 Seeded sample rental orders and reviews.');
  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
