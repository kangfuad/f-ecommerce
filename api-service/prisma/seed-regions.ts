import { PrismaClient, Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

async function main() {
  console.log('🚀 Starting Indonesian Master Regions Data Migration...');
  const baseDir = path.resolve(__dirname, '../plan/master-wilayah');

  // 1. Provinces
  console.log('📦 Reading provinces.json...');
  const provincesRaw = JSON.parse(
    fs.readFileSync(path.join(baseDir, 'provinces.json'), 'utf-8'),
  );
  const provincesData: Prisma.ProvinceCreateManyInput[] = provincesRaw.map((p: any) => ({
    id: String(p.id).trim(),
    name: p.name ? String(p.name).trim().toUpperCase() : '',
    altName: p.alt_name ? String(p.alt_name).trim() : null,
    latitude: p.latitude ? parseFloat(p.latitude) : null,
    longitude: p.longitude ? parseFloat(p.longitude) : null,
  }));

  console.log(`⏳ Inserting ${provincesData.length} provinces...`);
  await prisma.province.createMany({
    data: provincesData,
    skipDuplicates: true,
  });
  console.log(`✅ Provinces migration complete (${provincesData.length} records).`);

  // 2. Regencies
  console.log('📦 Reading regencies.json...');
  const regenciesRaw = JSON.parse(
    fs.readFileSync(path.join(baseDir, 'regencies.json'), 'utf-8'),
  );
  const validProvinceIds = new Set(provincesData.map((p) => p.id));
  const regenciesData: Prisma.RegencyCreateManyInput[] = regenciesRaw
    .filter((r: any) => validProvinceIds.has(String(r.province_id).trim()))
    .map((r: any) => ({
      id: String(r.id).trim(),
      provinceId: String(r.province_id).trim(),
      name: r.name ? String(r.name).trim().toUpperCase() : '',
      altName: r.alt_name ? String(r.alt_name).trim() : null,
      latitude: r.latitude ? parseFloat(r.latitude) : null,
      longitude: r.longitude ? parseFloat(r.longitude) : null,
    }));

  console.log(`⏳ Inserting ${regenciesData.length} regencies...`);
  await prisma.regency.createMany({
    data: regenciesData,
    skipDuplicates: true,
  });
  console.log(`✅ Regencies migration complete (${regenciesData.length} records).`);

  // 3. Districts
  console.log('📦 Reading districts.json...');
  const districtsRaw = JSON.parse(
    fs.readFileSync(path.join(baseDir, 'districts.json'), 'utf-8'),
  );
  const validRegencyIds = new Set(regenciesData.map((r) => r.id));
  const districtsData: Prisma.DistrictCreateManyInput[] = districtsRaw
    .filter((d: any) => validRegencyIds.has(String(d.regency_id).trim()))
    .map((d: any) => ({
      id: String(d.id).trim(),
      regencyId: String(d.regency_id).trim(),
      name: d.name ? String(d.name).trim().toUpperCase() : '',
      altName: d.alt_name ? String(d.alt_name).trim() : null,
      latitude: d.latitude ? parseFloat(d.latitude) : null,
      longitude: d.longitude ? parseFloat(d.longitude) : null,
    }));

  console.log(`⏳ Inserting ${districtsData.length} districts in batches...`);
  const districtChunks = chunkArray(districtsData, 1000);
  for (let i = 0; i < districtChunks.length; i++) {
    await prisma.district.createMany({
      data: districtChunks[i],
      skipDuplicates: true,
    });
    if ((i + 1) % 2 === 0 || i === districtChunks.length - 1) {
      console.log(`   ➡️ Batch ${i + 1}/${districtChunks.length} districts processed.`);
    }
  }
  console.log(`✅ Districts migration complete (${districtsData.length} records).`);

  // 4. Villages
  console.log('📦 Reading villages.json...');
  const villagesRaw = JSON.parse(
    fs.readFileSync(path.join(baseDir, 'villages.json'), 'utf-8'),
  );
  const validDistrictIds = new Set(districtsData.map((d) => d.id));
  const villagesData: Prisma.VillageCreateManyInput[] = villagesRaw
    .filter((v: any) => validDistrictIds.has(String(v.district_id).trim()))
    .map((v: any) => ({
      id: String(v.id).trim(),
      districtId: String(v.district_id).trim(),
      name: v.name ? String(v.name).trim().toUpperCase() : '',
      latitude: v.latitude ? parseFloat(v.latitude) : null,
      longitude: v.longitude ? parseFloat(v.longitude) : null,
    }));

  console.log(`⏳ Inserting ${villagesData.length} villages in batches...`);
  const villageChunks = chunkArray(villagesData, 2000);
  for (let i = 0; i < villageChunks.length; i++) {
    await prisma.village.createMany({
      data: villageChunks[i],
      skipDuplicates: true,
    });
    if ((i + 1) % 5 === 0 || i === villageChunks.length - 1) {
      console.log(`   ➡️ Batch ${i + 1}/${villageChunks.length} villages processed.`);
    }
  }
  console.log(`✅ Villages migration complete (${villagesData.length} records).`);

  console.log('🎉 Master Wilayah Migration Succeeded 100%!');
}

main()
  .catch((e) => {
    console.error('❌ Error migrating master wilayah:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
