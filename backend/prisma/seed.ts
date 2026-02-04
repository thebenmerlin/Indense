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

    // Create sample indents with different statuses
    console.log('📝 Creating sample indents...');
    
    // Get engineer user for creating indents
    const engineer = users.find(u => u.role === Role.SITE_ENGINEER);
    const purchaseUser = users.find(u => u.role === Role.PURCHASE_TEAM);
    const directorUser = users.find(u => u.role === Role.DIRECTOR);
    
    if (engineer) {
        // Indent 1: Submitted status
        const indent1 = await prisma.indent.create({
            data: {
                indentNumber: 'IND-MUM-2024-001',
                name: 'Foundation Materials',
                status: 'SUBMITTED',
                priority: 'HIGH',
                createdById: engineer.id,
                siteId: sites[0].id,
                items: {
                    create: [
                        {
                            materialId: materials[0].id, // Cement
                            requestedQty: 50,
                            pendingQty: 50,
                        },
                        {
                            materialId: materials[1].id, // Steel
                            requestedQty: 500,
                            pendingQty: 500,
                        },
                    ],
                },
            },
        });

        // Indent 2: Purchase Approved status
        const indent2 = await prisma.indent.create({
            data: {
                indentNumber: 'IND-MUM-2024-002',
                name: 'Electrical Installation Phase 1',
                status: 'PURCHASE_APPROVED',
                priority: 'MEDIUM',
                createdById: engineer.id,
                siteId: sites[0].id,
                purchaseApprovedById: purchaseUser?.id,
                purchaseApprovedAt: new Date(),
                items: {
                    create: [
                        {
                            materialId: materials[3].id, // Electrical Wire
                            requestedQty: 1000,
                            pendingQty: 1000,
                        },
                    ],
                },
            },
        });

        // Indent 3: Director Approved (ready for purchase)
        const indent3 = await prisma.indent.create({
            data: {
                indentNumber: 'IND-MUM-2024-003',
                name: 'Plumbing Materials',
                status: 'DIRECTOR_APPROVED',
                priority: 'HIGH',
                createdById: engineer.id,
                siteId: sites[0].id,
                purchaseApprovedById: purchaseUser?.id,
                purchaseApprovedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                directorApprovedById: directorUser?.id,
                directorApprovedAt: new Date(),
                items: {
                    create: [
                        {
                            materialId: materials[4].id, // PVC Pipe
                            requestedQty: 200,
                            pendingQty: 200,
                        },
                    ],
                },
            },
        });

        // Indent 4: Order Placed status
        const indent4 = await prisma.indent.create({
            data: {
                indentNumber: 'IND-MUM-2024-004',
                name: 'Hardware for Doors',
                status: 'ORDER_PLACED',
                priority: 'MEDIUM',
                createdById: engineer.id,
                siteId: sites[0].id,
                purchaseApprovedById: purchaseUser?.id,
                purchaseApprovedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
                directorApprovedById: directorUser?.id,
                directorApprovedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                items: {
                    create: [
                        {
                            materialId: materials[2].id, // Door Hinges
                            requestedQty: 100,
                            pendingQty: 100,
                        },
                    ],
                },
                order: {
                    create: {
                        orderNumber: 'ORD-2024-001',
                        vendorName: 'Hardware World Ltd',
                        vendorContact: '+91 98765 43210',
                        vendorEmail: 'sales@hardwareworld.com',
                        vendorAddress: 'Industrial Area, Mumbai',
                        expectedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                        totalAmount: 15000,
                        remarks: 'Standard delivery',
                        createdById: purchaseUser?.id || engineer.id,
                        isPurchased: true,
                        purchasedAt: new Date(),
                        orderItems: {
                            create: [{
                                materialName: 'Door Hinges 4 inch',
                                materialCode: 'MAT-003',
                                quantity: 100,
                                unitPrice: 150,
                                totalPrice: 15000,
                            }],
                        },
                    },
                },
            },
        });

        // Indent 5: Closed status
        const indent5 = await prisma.indent.create({
            data: {
                indentNumber: 'IND-MUM-2024-005',
                name: 'Cement for Second Floor',
                status: 'CLOSED',
                priority: 'HIGH',
                createdById: engineer.id,
                siteId: sites[0].id,
                purchaseApprovedById: purchaseUser?.id,
                purchaseApprovedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
                directorApprovedById: directorUser?.id,
                directorApprovedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
                items: {
                    create: [
                        {
                            materialId: materials[0].id, // Cement
                            requestedQty: 100,
                            receivedQty: 100,
                            pendingQty: 0,
                            arrivalStatus: 'ARRIVED',
                        },
                    ],
                },
                order: {
                    create: {
                        orderNumber: 'ORD-2024-002',
                        vendorName: 'UltraTech Cement',
                        vendorContact: '+91 98765 11111',
                        expectedDeliveryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                        totalAmount: 35000,
                        createdById: purchaseUser?.id || engineer.id,
                        isPurchased: true,
                        purchasedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                        orderItems: {
                            create: [{
                                materialName: 'Portland Cement OPC 53',
                                materialCode: 'MAT-001',
                                quantity: 100,
                                unitPrice: 350,
                                totalPrice: 35000,
                            }],
                        },
                    },
                },
            },
        });

        // Create receipt for indent 5
        await prisma.receipt.create({
            data: {
                receiptNumber: 'REC-MUM-2024-001',
                name: 'Cement Delivery Receipt',
                indentId: indent5.id,
                createdById: engineer.id,
                siteId: sites[0].id,
            },
        });

        // Indent 6: Order Placed with damage report
        const indent6 = await prisma.indent.create({
            data: {
                indentNumber: 'IND-MUM-2024-006',
                name: 'Steel for Columns',
                status: 'ORDER_PLACED',
                priority: 'HIGH',
                createdById: engineer.id,
                siteId: sites[0].id,
                purchaseApprovedById: purchaseUser?.id,
                purchaseApprovedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
                directorApprovedById: directorUser?.id,
                directorApprovedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
                items: {
                    create: [
                        {
                            materialId: materials[1].id, // Steel
                            requestedQty: 2000,
                            receivedQty: 1800,
                            pendingQty: 200,
                            arrivalStatus: 'PARTIAL',
                        },
                    ],
                },
                order: {
                    create: {
                        orderNumber: 'ORD-2024-003',
                        vendorName: 'Tata Steel Ltd',
                        vendorContact: '+91 98765 22222',
                        expectedDeliveryDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
                        totalAmount: 120000,
                        createdById: purchaseUser?.id || engineer.id,
                        isPurchased: true,
                        purchasedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
                        orderItems: {
                            create: [{
                                materialName: 'TMT Steel Bars 12mm',
                                materialCode: 'MAT-002',
                                quantity: 2000,
                                unitPrice: 60,
                                totalPrice: 120000,
                            }],
                        },
                    },
                },
            },
        });

        // Create damage report for indent 6 (DRAFT)
        await prisma.damageReport.create({
            data: {
                name: 'Rust damage on steel bars',
                description: 'Some steel bars arrived with rust damage',
                severity: 'MODERATE',
                status: 'DRAFT',
                indentId: indent6.id,
                reportedById: engineer.id,
                siteId: sites[0].id,
            },
        });

        // Create damage report for indent 6 (REPORTED)
        await prisma.damageReport.create({
            data: {
                name: 'Bent steel bars',
                description: 'Steel bars bent during transportation',
                severity: 'SEVERE',
                status: 'REPORTED',
                indentId: indent6.id,
                reportedById: engineer.id,
                siteId: sites[0].id,
                submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            },
        });

        console.log('✅ Created 6 sample indents with various statuses\n');
        console.log('✅ Created 1 receipt and 2 damage reports\n');
    }

    console.log('='.repeat(50));
    console.log('🎉 Database seeding completed!');
    console.log('='.repeat(50));
    console.log('\nTest Credentials:');
    console.log('  Director:  director@indense.com / password123');
    console.log('  Purchase:  purchase@indense.com / password123');
    console.log('  Engineer:  engineer1@indense.com / password123');
    console.log('\nSample Data:');
    console.log('  - 3 Sites (Mumbai, Delhi, Bangalore)');
    console.log('  - 5 Item Groups');
    console.log('  - 5 Units of Measure');
    console.log('  - 5 Materials');
    console.log('  - 6 Indents with different statuses');
    console.log('  - 1 Receipt');
    console.log('  - 2 Damage Reports (1 Draft, 1 Reported)');
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
