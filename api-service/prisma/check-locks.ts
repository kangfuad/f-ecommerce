import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const locks = await prisma.$queryRawUnsafe<any[]>(`
    SELECT 
      l.pid,
      l.locktype,
      l.mode,
      l.granted,
      c.relname,
      a.query
    FROM pg_locks l
    LEFT JOIN pg_class c ON l.relation = c.oid
    LEFT JOIN pg_stat_activity a ON l.pid = a.pid
    WHERE c.relname IS NOT NULL;
  `);
  console.log('Current locks:', JSON.stringify(locks, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
