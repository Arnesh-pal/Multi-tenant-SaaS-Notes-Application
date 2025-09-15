import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');
    const hash = await bcrypt.hash('password', 10);

    // 1. Create Acme Tenant
    const acme = await prisma.tenant.create({
        data: {
            name: 'Acme Inc.',
            slug: 'acme',
            plan: 'FREE',
        },
    });
    console.log('Created tenant: Acme');

    // 2. Create Globex Tenant
    const globex = await prisma.tenant.create({
        data: {
            name: 'Globex Corp.',
            slug: 'globex',
            plan: 'FREE',
        },
    });
    console.log('Created tenant: Globex');

    // 3. Create Acme Users
    await prisma.user.create({
        data: {
            email: 'admin@acme.test',
            passwordHash: hash,
            role: 'ADMIN',
            tenantId: acme.id,
        },
    });
    await prisma.user.create({
        data: {
            email: 'user@acme.test',
            passwordHash: hash,
            role: 'MEMBER',
            tenantId: acme.id,
        },
    });
    console.log('Created Acme users');

    // 4. Create Globex Users
    await prisma.user.create({
        data: {
            email: 'admin@globex.test',
            passwordHash: hash,
            role: 'ADMIN',
            tenantId: globex.id,
        },
    });
    await prisma.user.create({
        data: {
            email: 'user@globex.test',
            passwordHash: hash,
            role: 'MEMBER',
            tenantId: globex.id,
        },
    });
    console.log('Created Globex users');
    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });