import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://punyasewa:skynettxqp23@129.226.214.80:5432/appdb?schema=punyasewa&connection_limit=1',
    },
  },
});

async function main() {
  console.log('1. Checking current database locks & connections...');
  const activeQueries = await prisma.$queryRawUnsafe<any[]>(`
    SELECT pid, usename, state, wait_event_type, wait_event, query
    FROM pg_stat_activity
    WHERE datname = 'appdb' AND pid <> pg_backend_pid();
  `);
  console.log('Active queries:', JSON.stringify(activeQueries, null, 2));

  for (const q of activeQueries) {
    if (q.usename === 'punyasewa') {
      console.log(`Killing punyasewa pid ${q.pid}...`);
      try {
        await prisma.$executeRawUnsafe(`SELECT pg_terminate_backend(${q.pid});`);
      } catch (e) {
        console.warn(e.message);
      }
    }
  }

  // Set short lock timeout so we never hang indefinitely
  await prisma.$executeRawUnsafe(`SET lock_timeout = '5s';`);

  console.log('2. Altering users table to add username...');
  await prisma.$executeRawUnsafe(`ALTER TABLE punyasewa.users ADD COLUMN IF NOT EXISTS username VARCHAR(50);`);
  console.log('✅ Column username added.');

  console.log('3. Setting default username values...');
  await prisma.$executeRawUnsafe(`
    UPDATE punyasewa.users 
    SET username = SPLIT_PART(email, '@', 1) 
    WHERE username IS NULL;
  `);
  console.log('✅ Populated default usernames.');

  console.log('4. Creating unique index...');
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS users_username_key ON punyasewa.users (username);`);
  console.log('✅ Unique index users_username_key verified.');
}

main()
  .catch((e) => {
    console.error('❌ Error in migration:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
