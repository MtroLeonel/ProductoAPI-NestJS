import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL no esta definido');
  }

  const adminEmail = (process.env.ADMIN_SEED_EMAIL ?? 'admin@demo.com').toLowerCase();
  const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? 'Admin12345!';

  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        role: Role.ADMIN,
        password: passwordHash,
        isActive: true,
      },
      create: {
        email: adminEmail,
        password: passwordHash,
        role: Role.ADMIN,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    console.log('Admin listo para usar:', admin);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Error ejecutando seed:', error);
  process.exit(1);
});
