/**
 * Main Seed Script
 * Creates initial users, sites, and sample materials for development
 * 
 * Run with: npx prisma db seed
 */

import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...\n');

    // Create Sites
    console.log('📍 Creating sites...');
    const sites = await Promise.all([
        prisma.site.upsert({
            where: { code: 'SITE-MUM-001' },
            update: {},
            create: {
                name: 'Mumbai Project - Andheri',
                code: 'SITE-MUM-001',
                address: '123 Andheri East',
                city: 'Mumbai',
                state: 'Maharashtra',
            },
        }),
        prisma.site.upsert({
            where: { code: 'SITE-DEL-001' },
            update: {},
            create: {
                name: 'Delhi Project - Gurgaon',
                code: 'SITE-DEL-001',
                address: 'DLF Cyber City',
                city: 'Gurgaon',
                state: 'Haryana',
            },
        }),
        prisma.site.upsert({
            where: { code: 'SITE-BLR-001' },
            update: {},
            create: {
                name: 'Bangalore Project - Whitefield',
                code: 'SITE-BLR-001',
                address: 'ITPL Road',
                city: 'Bangalore',
                state: 'Karnataka',
            },
        }),
    ]);
    console.log(`✅ Created ${sites.length} sites\n`);

    // Create Users
    console.log('👥 Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = await Promise.all([
        // Director
        prisma.user.upsert({
            where: { email: 'director@indense.com' },
            update: {},
            create: {
                email: 'director@indense.com',
                password: hashedPassword,
                name: 'Rajesh Kumar',
                role: Role.DIRECTOR,
            },
        }),
        // Purchase Team
        prisma.user.upsert({
            where: { email: 'purchase@indense.com' },
            update: {},
            create: {
                email: 'purchase@indense.com',
                password: hashedPassword,
                name: 'Priya Sharma',
                role: Role.PURCHASE_TEAM,
            },
        }),
        // Site Engineers
        prisma.user.upsert({
            where: { email: 'engineer1@indense.com' },
            update: {},
            create: {
                email: 'engineer1@indense.com',
                password: hashedPassword,
                name: 'Amit Patel',
                role: Role.SITE_ENGINEER,
                currentSiteId: sites[0].id,
                sites: {
                    create: [{ siteId: sites[0].id }],
                },
            },
        }),
        prisma.user.upsert({
            where: { email: 'engineer2@indense.com' },
            update: {},
            create: {
                email: 'engineer2@indense.com',
                password: hashedPassword,
                name: 'Sneha Reddy',
                role: Role.SITE_ENGINEER,
                currentSiteId: sites[1].id,
                sites: {
                    create: [{ siteId: sites[1].id }],
                },
            },
        }),
    ]);
    console.log(`✅ Created ${users.length} users\n`);

    // Create Item Groups
    console.log('📁 Creating item groups...');
    const itemGroups = await Promise.all([
        prisma.itemGroup.upsert({
            where: { name: 'CEMENT' },
            update: {},
            create: { name: 'CEMENT' },
        }),
        prisma.itemGroup.upsert({
            where: { name: 'STEEL' },
            update: {},
            create: { name: 'STEEL' },
        }),
        prisma.itemGroup.upsert({
            where: { name: 'HARDWARE' },
            update: {},
            create: { name: 'HARDWARE' },
        }),
        prisma.itemGroup.upsert({
            where: { name: 'ELECTRICAL' },
            update: {},
            create: { name: 'ELECTRICAL' },
        }),
        prisma.itemGroup.upsert({
            where: { name: 'PLUMBING' },
            update: {},
            create: { name: 'PLUMBING' },
        }),
    ]);
    console.log(`✅ Created ${itemGroups.length} item groups\n`);

    // Create Units of Measure
    console.log('📐 Creating units of measure...');
    const uoms = await Promise.all([
        prisma.unitOfMeasure.upsert({
            where: { code: 'BAGS' },
            update: {},
            create: { code: 'BAGS', name: 'Bags' },
        }),
        prisma.unitOfMeasure.upsert({
            where: { code: 'KG' },
            update: {},
            create: { code: 'KG', name: 'Kilogram' },
        }),
        prisma.unitOfMeasure.upsert({
            where: { code: 'NOS' },
            update: {},
            create: { code: 'NOS', name: 'Numbers' },
        }),
        prisma.unitOfMeasure.upsert({
            where: { code: 'MTR' },
            update: {},
            create: { code: 'MTR', name: 'Meter' },
        }),
        prisma.unitOfMeasure.upsert({
            where: { code: 'SFT' },
            update: {},
            create: { code: 'SFT', name: 'Square Foot' },
        }),
    ]);
    console.log(`✅ Created ${uoms.length} units of measure\n`);

    // Create Sample Materials
    console.log('🏗️ Creating sample materials...');
    const materials = await Promise.all([
        prisma.material.upsert({
            where: { code: 'MAT-001' },
            update: {},
            create: {
                name: 'Portland Cement OPC 53',
                code: 'MAT-001',
                itemGroupId: itemGroups[0].id, // CEMENT
                unitId: uoms[0].id, // BAGS
                description: 'OPC 53 Grade Cement',
                isSystemData: true,
            },
        }),
        prisma.material.upsert({
            where: { code: 'MAT-002' },
            update: {},
            create: {
                name: 'TMT Steel Bars 12mm',
                code: 'MAT-002',
                itemGroupId: itemGroups[1].id, // STEEL
                unitId: uoms[1].id, // KG
                description: 'TMT reinforcement steel bars',
                isSystemData: true,
            },
        }),
        prisma.material.upsert({
            where: { code: 'MAT-003' },
            update: {},
            create: {
                name: 'Door Hinges 4 inch',
                code: 'MAT-003',
                itemGroupId: itemGroups[2].id, // HARDWARE
                unitId: uoms[2].id, // NOS
                description: 'Stainless steel door hinges',
                isSystemData: true,
            },
        }),
        prisma.material.upsert({
            where: { code: 'MAT-004' },
            update: {},
            create: {
                name: 'Electrical Wire 2.5mm',
                code: 'MAT-004',
                itemGroupId: itemGroups[3].id, // ELECTRICAL
                unitId: uoms[3].id, // MTR
                description: 'Copper electrical wire',
                isSystemData: true,
            },
        }),
        prisma.material.upsert({
            where: { code: 'MAT-005' },
            update: {},
            create: {
                name: 'PVC Pipe 1 inch',
                code: 'MAT-005',
                itemGroupId: itemGroups[4].id, // PLUMBING
                unitId: uoms[3].id, // MTR
                description: 'PVC plumbing pipe',
                isSystemData: true,
            },
        }),
    ]);
    console.log(`✅ Created ${materials.length} sample materials\n`);

    console.log('='.repeat(50));
    console.log('🎉 Database seeding completed!');
    console.log('='.repeat(50));
    console.log('\nTest Credentials:');
    console.log('  Director:  director@indense.com / password123');
    console.log('  Purchase:  purchase@indense.com / password123');
    console.log('  Engineer:  engineer1@indense.com / password123');
    console.log('');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
