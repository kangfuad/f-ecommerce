import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const columns = await prisma.$queryRawUnsafe<any[]>(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'punyasewa' AND table_name = 'users';
  `);
  console.log('Columns in punyasewa.users:', columns.map((c) => c.column_name));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
