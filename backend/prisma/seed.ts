/**
 * Comprehensive Seed Script for Indense
 * 
 * Creates a full test dataset that exercises all features:
 * - Multiple sites with different scenarios
 * - Users with various roles and multi-role access
 * - Complete indent lifecycle (DRAFT → CLOSED)
 * - Orders, receipts, damage reports
 * - Partially received materials
 * 
 * Run with: npx prisma db seed
 */

import { PrismaClient, Role, IndentStatus, DamageStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper to create dates relative to now
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);
const daysFromNow = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

async function clearDatabase() {
    console.log('🧹 Clearing existing data...');

    // Delete in order respecting foreign key constraints
    await prisma.auditLog.deleteMany();
    await prisma.damageReport.deleteMany();
    await prisma.receipt.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.indentItem.deleteMany();
    await prisma.indent.deleteMany();
    await prisma.material.deleteMany();
    await prisma.unitOfMeasure.deleteMany();
    await prisma.itemGroup.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.userSite.deleteMany();
    await prisma.user.deleteMany();
    await prisma.site.deleteMany();

    console.log('✅ Database cleared\n');
}

async function main() {
    console.log('🌱 Starting Indense Comprehensive Seed...\n');

    // Clear existing data first
    await clearDatabase();

    // =========================================================================
    // SITES
    // =========================================================================
    console.log('📍 Creating sites...');
    const sites = await Promise.all([
        prisma.site.create({
            data: {
                name: 'Prestige Heights - Bandra',
                code: 'SITE-MUM-001',
                address: 'Plot 45, Linking Road, Bandra West',
                city: 'Mumbai',
                state: 'Maharashtra',
            },
        }),
        prisma.site.create({
            data: {
                name: 'DLF Cyber Hub - Phase 2',
                code: 'SITE-DEL-001',
                address: 'Sector 24, DLF Cyber City',
                city: 'Gurgaon',
                state: 'Haryana',
            },
        }),
        prisma.site.create({
            data: {
                name: 'Embassy Tech Park - Block C',
                code: 'SITE-BLR-001',
                address: 'Outer Ring Road, Marathahalli',
                city: 'Bangalore',
                state: 'Karnataka',
            },
        }),
    ]);
    console.log(`✅ Created ${sites.length} sites\n`);

    // =========================================================================
    // USERS
    // =========================================================================
    console.log('👥 Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Director - oversees all sites
    const director = await prisma.user.create({
        data: {
            email: 'director@indense.com',
            phone: '9876543210',
            password: hashedPassword,
            name: 'Rajesh Kumar',
            role: Role.DIRECTOR,
        },
    });

    // Purchase Team - handles procurement
    const purchaseTeam = await prisma.user.create({
        data: {
            email: 'purchase@indense.com',
            phone: '9876543211',
            password: hashedPassword,
            name: 'Priya Sharma',
            role: Role.PURCHASE_TEAM,
        },
    });

    // Multi-role user: Purchase + Site Engineer
    const multiRoleUser = await prisma.user.create({
        data: {
            email: 'manager@indense.com',
            phone: '9876543212',
            password: hashedPassword,
            name: 'Vikram Singh',
            role: Role.PURCHASE_TEAM,
            allowedRoles: [Role.PURCHASE_TEAM, Role.SITE_ENGINEER],
            currentSiteId: sites[0].id,
        },
    });

    // Site Engineers - one for each site
    const engineer1 = await prisma.user.create({
        data: {
            email: 'amit@indense.com',
            phone: '9876543213',
            password: hashedPassword,
            name: 'Amit Patel',
            role: Role.SITE_ENGINEER,
            currentSiteId: sites[0].id,
        },
    });

    const engineer2 = await prisma.user.create({
        data: {
            email: 'sneha@indense.com',
            phone: '9876543214',
            password: hashedPassword,
            name: 'Sneha Reddy',
            role: Role.SITE_ENGINEER,
            currentSiteId: sites[1].id,
        },
    });

    // Multi-site engineer (can switch between sites)
    const multiSiteEngineer = await prisma.user.create({
        data: {
            email: 'karthik@indense.com',
            phone: '9876543215',
            password: hashedPassword,
            name: 'Karthik Nair',
            role: Role.SITE_ENGINEER,
            currentSiteId: sites[2].id,
        },
    });

    // Create UserSite associations
    await Promise.all([
        // Multi-role user assigned to Mumbai
        prisma.userSite.create({ data: { userId: multiRoleUser.id, siteId: sites[0].id } }),
        // Amit -> Mumbai only
        prisma.userSite.create({ data: { userId: engineer1.id, siteId: sites[0].id } }),
        // Sneha -> Delhi only
        prisma.userSite.create({ data: { userId: engineer2.id, siteId: sites[1].id } }),
        // Karthik -> Multiple sites (Bangalore + Mumbai)
        prisma.userSite.create({ data: { userId: multiSiteEngineer.id, siteId: sites[2].id } }),
        prisma.userSite.create({ data: { userId: multiSiteEngineer.id, siteId: sites[0].id } }),
    ]);

    console.log('✅ Created 6 users (1 Director, 1 Purchase, 1 Multi-role, 3 Engineers)\n');

    // =========================================================================
    // ITEM GROUPS & UNITS OF MEASURE
    // =========================================================================
    console.log('📁 Creating item groups...');
    const itemGroups = await Promise.all([
        prisma.itemGroup.create({ data: { name: 'CEMENT' } }),
        prisma.itemGroup.create({ data: { name: 'STEEL' } }),
        prisma.itemGroup.create({ data: { name: 'HARDWARE' } }),
        prisma.itemGroup.create({ data: { name: 'ELECTRICAL' } }),
        prisma.itemGroup.create({ data: { name: 'PLUMBING' } }),
        prisma.itemGroup.create({ data: { name: 'PAINTING' } }),
        prisma.itemGroup.create({ data: { name: 'TILES' } }),
        prisma.itemGroup.create({ data: { name: 'SAFETY' } }),
    ]);
    console.log(`✅ Created ${itemGroups.length} item groups\n`);

    console.log('📐 Creating units of measure...');
    const uoms = await Promise.all([
        prisma.unitOfMeasure.create({ data: { code: 'BAGS', name: 'Bags' } }),
        prisma.unitOfMeasure.create({ data: { code: 'KG', name: 'Kilogram' } }),
        prisma.unitOfMeasure.create({ data: { code: 'NOS', name: 'Numbers' } }),
        prisma.unitOfMeasure.create({ data: { code: 'MTR', name: 'Meter' } }),
        prisma.unitOfMeasure.create({ data: { code: 'SFT', name: 'Square Foot' } }),
        prisma.unitOfMeasure.create({ data: { code: 'LTR', name: 'Litre' } }),
        prisma.unitOfMeasure.create({ data: { code: 'SET', name: 'Set' } }),
        prisma.unitOfMeasure.create({ data: { code: 'BOX', name: 'Box' } }),
    ]);
    console.log(`✅ Created ${uoms.length} units of measure\n`);

    // =========================================================================
    // MATERIALS
    // =========================================================================
    console.log('🏗️ Creating materials...');
    const materials = await Promise.all([
        // Cement
        prisma.material.create({
            data: {
                name: 'Portland Cement OPC 53 Grade',
                code: 'MAT-001',
                itemGroupId: itemGroups[0].id,
                unitId: uoms[0].id,
                description: 'Ultratech OPC 53 Grade Cement - 50kg bags',
                isSystemData: true,
            },
        }),
        prisma.material.create({
            data: {
                name: 'Portland Pozzolana Cement (PPC)',
                code: 'MAT-002',
                itemGroupId: itemGroups[0].id,
                unitId: uoms[0].id,
                description: 'ACC PPC Cement - 50kg bags',
                isSystemData: true,
            },
        }),
        // Steel
        prisma.material.create({
            data: {
                name: 'TMT Steel Bars 12mm Fe500D',
                code: 'MAT-003',
                itemGroupId: itemGroups[1].id,
                unitId: uoms[1].id,
                description: 'Tata Tiscon TMT bars for reinforcement',
                isSystemData: true,
            },
        }),
        prisma.material.create({
            data: {
                name: 'TMT Steel Bars 16mm Fe500D',
                code: 'MAT-004',
                itemGroupId: itemGroups[1].id,
                unitId: uoms[1].id,
                description: 'Jindal TMT bars for columns',
                isSystemData: true,
            },
        }),
        prisma.material.create({
            data: {
                name: 'Binding Wire 18 Gauge',
                code: 'MAT-005',
                itemGroupId: itemGroups[1].id,
                unitId: uoms[1].id,
                description: 'GI binding wire for steel tying',
                isSystemData: true,
            },
        }),
        // Hardware
        prisma.material.create({
            data: {
                name: 'Door Hinges 4 inch SS',
                code: 'MAT-006',
                itemGroupId: itemGroups[2].id,
                unitId: uoms[2].id,
                description: 'Stainless steel door hinges - heavy duty',
                isSystemData: true,
            },
        }),
        prisma.material.create({
            data: {
                name: 'Tower Bolts 8 inch',
                code: 'MAT-007',
                itemGroupId: itemGroups[2].id,
                unitId: uoms[2].id,
                description: 'Brass tower bolts for doors',
                isSystemData: true,
            },
        }),
        prisma.material.create({
            data: {
                name: 'Door Handle Set',
                code: 'MAT-008',
                itemGroupId: itemGroups[2].id,
                unitId: uoms[6].id,
                description: 'Mortise lock with handle set',
                isSystemData: true,
            },
        }),
        // Electrical
        prisma.material.create({
            data: {
                name: 'Electrical Wire 2.5mm FRLS',
                code: 'MAT-009',
                itemGroupId: itemGroups[3].id,
                unitId: uoms[3].id,
                description: 'Havells FRLS copper wire - multi strand',
                isSystemData: true,
            },
        }),
        prisma.material.create({
            data: {
                name: 'MCB 16A Single Pole',
                code: 'MAT-010',
                itemGroupId: itemGroups[3].id,
                unitId: uoms[2].id,
                description: 'Schneider MCB for distribution board',
                isSystemData: true,
            },
        }),
        prisma.material.create({
            data: {
                name: 'PVC Conduit Pipe 25mm',
                code: 'MAT-011',
                itemGroupId: itemGroups[3].id,
                unitId: uoms[3].id,
                description: 'ISI marked electrical conduit',
                isSystemData: true,
            },
        }),
        // Plumbing
        prisma.material.create({
            data: {
                name: 'CPVC Pipe 1 inch',
                code: 'MAT-012',
                itemGroupId: itemGroups[4].id,
                unitId: uoms[3].id,
                description: 'Astral CPVC pipes for hot water',
                isSystemData: true,
            },
        }),
        prisma.material.create({
            data: {
                name: 'PVC Pipe 4 inch SWR',
                code: 'MAT-013',
                itemGroupId: itemGroups[4].id,
                unitId: uoms[3].id,
                description: 'Prince SWR pipes for drainage',
                isSystemData: true,
            },
        }),
        prisma.material.create({
            data: {
                name: 'Ball Valve 1 inch',
                code: 'MAT-014',
                itemGroupId: itemGroups[4].id,
                unitId: uoms[2].id,
                description: 'Brass ball valve for water lines',
                isSystemData: true,
            },
        }),
        // Painting
        prisma.material.create({
            data: {
                name: 'Interior Emulsion Paint White',
                code: 'MAT-015',
                itemGroupId: itemGroups[5].id,
                unitId: uoms[5].id,
                description: 'Asian Paints Royale Matt finish',
                isSystemData: true,
            },
        }),
        prisma.material.create({
            data: {
                name: 'Exterior Emulsion Weather Coat',
                code: 'MAT-016',
                itemGroupId: itemGroups[5].id,
                unitId: uoms[5].id,
                description: 'Berger Weather Coat - all weather protection',
                isSystemData: true,
            },
        }),
        // Tiles
        prisma.material.create({
            data: {
                name: 'Vitrified Tiles 2x2 ft',
                code: 'MAT-017',
                itemGroupId: itemGroups[6].id,
                unitId: uoms[4].id,
                description: 'Kajaria vitrified floor tiles',
                isSystemData: true,
            },
        }),
        prisma.material.create({
            data: {
                name: 'Bathroom Wall Tiles 1x1 ft',
                code: 'MAT-018',
                itemGroupId: itemGroups[6].id,
                unitId: uoms[4].id,
                description: 'Johnson ceramic wall tiles',
                isSystemData: true,
            },
        }),
        // Safety
        prisma.material.create({
            data: {
                name: 'Safety Helmet Yellow',
                code: 'MAT-019',
                itemGroupId: itemGroups[7].id,
                unitId: uoms[2].id,
                description: 'ISI marked construction helmet',
                isSystemData: true,
            },
        }),
        prisma.material.create({
            data: {
                name: 'Safety Shoes Size 8-10',
                code: 'MAT-020',
                itemGroupId: itemGroups[7].id,
                unitId: uoms[2].id,
                description: 'Steel toe safety shoes',
                isSystemData: true,
            },
        }),
    ]);
    console.log(`✅ Created ${materials.length} materials\n`);

    // =========================================================================
    // INDENTS WITH VARIOUS STATUSES
    // =========================================================================
    console.log('📝 Creating indents...\n');

    // ----- MUMBAI SITE (sites[0]) -----
    console.log('   📍 Mumbai Site indents:');

    // 1. SUBMITTED - Waiting for Purchase Team approval
    const indent1 = await prisma.indent.create({
        data: {
            indentNumber: 'IND-MUM-2024-001',
            name: 'Foundation Phase Materials',
            status: IndentStatus.SUBMITTED,
            priority: "HIGH",
            notes: 'Urgent requirement for foundation work starting next week',
            createdById: engineer1.id,
            siteId: sites[0].id,
            items: {
                create: [
                    { materialId: materials[0].id, requestedQty: 100, pendingQty: 100 },
                    { materialId: materials[2].id, requestedQty: 2000, pendingQty: 2000 },
                    { materialId: materials[4].id, requestedQty: 50, pendingQty: 50 },
                ],
            },
        },
    });
    console.log('      ✓ SUBMITTED: Foundation Phase Materials');

    // 2. PURCHASE_APPROVED - Waiting for Director approval
    const indent2 = await prisma.indent.create({
        data: {
            indentNumber: 'IND-MUM-2024-002',
            name: 'Electrical Phase 1 - Conduit Work',
            status: IndentStatus.PURCHASE_APPROVED,
            priority: "NORMAL",
            createdById: engineer1.id,
            siteId: sites[0].id,
            purchaseApprovedById: purchaseTeam.id,
            purchaseApprovedAt: daysAgo(2),
            items: {
                create: [
                    { materialId: materials[8].id, requestedQty: 1500, pendingQty: 1500 },
                    { materialId: materials[10].id, requestedQty: 500, pendingQty: 500 },
                ],
            },
        },
    });
    console.log('      ✓ PURCHASE_APPROVED: Electrical Phase 1');

    // 3. DIRECTOR_APPROVED - Ready for order placement
    const indent3 = await prisma.indent.create({
        data: {
            indentNumber: 'IND-MUM-2024-003',
            name: 'Plumbing - Ground Floor',
            status: IndentStatus.DIRECTOR_APPROVED,
            priority: "HIGH",
            createdById: engineer1.id,
            siteId: sites[0].id,
            purchaseApprovedById: purchaseTeam.id,
            purchaseApprovedAt: daysAgo(5),
            directorApprovedById: director.id,
            directorApprovedAt: daysAgo(3),
            items: {
                create: [
                    { materialId: materials[11].id, requestedQty: 200, pendingQty: 200 },
                    { materialId: materials[12].id, requestedQty: 100, pendingQty: 100 },
                    { materialId: materials[13].id, requestedQty: 50, pendingQty: 50 },
                ],
            },
        },
    });
    console.log('      ✓ DIRECTOR_APPROVED: Plumbing Ground Floor');

    // 4. ORDER_PLACED - Hardware order placed, awaiting delivery
    const indent4 = await prisma.indent.create({
        data: {
            indentNumber: 'IND-MUM-2024-004',
            name: 'Door Hardware - Building A',
            status: IndentStatus.ORDER_PLACED,
            priority: "NORMAL",
            createdById: engineer1.id,
            siteId: sites[0].id,
            purchaseApprovedById: purchaseTeam.id,
            purchaseApprovedAt: daysAgo(12),
            directorApprovedById: director.id,
            directorApprovedAt: daysAgo(10),
            items: {
                create: [
                    { materialId: materials[5].id, requestedQty: 200, pendingQty: 200 },
                    { materialId: materials[6].id, requestedQty: 100, pendingQty: 100 },
                    { materialId: materials[7].id, requestedQty: 50, pendingQty: 50 },
                ],
            },
            order: {
                create: {
                    orderNumber: 'ORD-2024-001',
                    vendorName: 'Godrej Hardware Solutions',
                    vendorContact: '+91 98201 44444',
                    vendorEmail: 'sales@godrejhardware.com',
                    vendorAddress: 'Vikhroli Industrial Estate, Mumbai',
                    expectedDeliveryDate: daysFromNow(3),
                    totalAmount: 125000,
                    remarks: 'Premium SS hardware as specified',
                    createdById: purchaseTeam.id,
                    isPurchased: true,
                    purchasedAt: daysAgo(7),
                    orderItems: {
                        create: [
                            { materialName: 'Door Hinges 4 inch SS', materialCode: 'MAT-006', quantity: 200, unitPrice: 250, totalPrice: 50000 },
                            { materialName: 'Tower Bolts 8 inch', materialCode: 'MAT-007', quantity: 100, unitPrice: 350, totalPrice: 35000 },
                            { materialName: 'Door Handle Set', materialCode: 'MAT-008', quantity: 50, unitPrice: 800, totalPrice: 40000 },
                        ],
                    },
                },
            },
        },
    });
    console.log('      ✓ ORDER_PLACED: Door Hardware Building A');

    // 5. ORDER_PLACED with PARTIAL delivery
    const indent5 = await prisma.indent.create({
        data: {
            indentNumber: 'IND-MUM-2024-005',
            name: 'Steel for Columns - Phase 1',
            status: IndentStatus.ORDER_PLACED,
            priority: "HIGH",
            createdById: engineer1.id,
            siteId: sites[0].id,
            purchaseApprovedById: purchaseTeam.id,
            purchaseApprovedAt: daysAgo(20),
            directorApprovedById: director.id,
            directorApprovedAt: daysAgo(18),
            items: {
                create: [
                    {
                        materialId: materials[2].id,
                        requestedQty: 5000,
                        receivedQty: 3500,
                        pendingQty: 1500,
                        arrivalStatus: "PARTIAL",
                    },
                    {
                        materialId: materials[3].id,
                        requestedQty: 2000,
                        receivedQty: 2000,
                        pendingQty: 0,
                        arrivalStatus: "ARRIVED",
                    },
                ],
            },
            order: {
                create: {
                    orderNumber: 'ORD-2024-002',
                    vendorName: 'Tata Steel Dealers',
                    vendorContact: '+91 98765 11111',
                    vendorEmail: 'orders@tatasteel.com',
                    vendorAddress: 'Steel Market, Lower Parel, Mumbai',
                    expectedDeliveryDate: daysAgo(5),
                    totalAmount: 420000,
                    remarks: 'Balance 1500kg of 12mm to be delivered by next week',
                    createdById: purchaseTeam.id,
                    isPurchased: true,
                    purchasedAt: daysAgo(15),
                    orderItems: {
                        create: [
                            { materialName: 'TMT Steel Bars 12mm Fe500D', materialCode: 'MAT-003', quantity: 5000, unitPrice: 60, totalPrice: 300000 },
                            { materialName: 'TMT Steel Bars 16mm Fe500D', materialCode: 'MAT-004', quantity: 2000, unitPrice: 60, totalPrice: 120000 },
                        ],
                    },
                },
            },
        },
    });
    console.log('      ✓ ORDER_PLACED (PARTIAL): Steel for Columns');

    // 6. CLOSED - Completed cement delivery
    const indent6 = await prisma.indent.create({
        data: {
            indentNumber: 'IND-MUM-2024-006',
            name: 'Cement for Foundation',
            status: IndentStatus.CLOSED,
            priority: "HIGH",
            createdById: engineer1.id,
            siteId: sites[0].id,
            purchaseApprovedById: purchaseTeam.id,
            purchaseApprovedAt: daysAgo(25),
            directorApprovedById: director.id,
            directorApprovedAt: daysAgo(23),
            items: {
                create: [
                    {
                        materialId: materials[0].id,
                        requestedQty: 200,
                        receivedQty: 200,
                        pendingQty: 0,
                        arrivalStatus: "ARRIVED",
                    },
                ],
            },
            order: {
                create: {
                    orderNumber: 'ORD-2024-003',
                    vendorName: 'UltraTech Cement Dealers',
                    vendorContact: '+91 98765 22222',
                    vendorEmail: 'bulk@ultratech.com',
                    vendorAddress: 'Cement Depot, Mulund, Mumbai',
                    expectedDeliveryDate: daysAgo(15),
                    totalAmount: 70000,
                    createdById: purchaseTeam.id,
                    isPurchased: true,
                    purchasedAt: daysAgo(20),
                    orderItems: {
                        create: [
                            { materialName: 'Portland Cement OPC 53 Grade', materialCode: 'MAT-001', quantity: 200, unitPrice: 350, totalPrice: 70000 },
                        ],
                    },
                },
            },
        },
    });

    // Create receipt for closed indent
    await prisma.receipt.create({
        data: {
            receiptNumber: 'REC-MUM-2024-001',
            name: 'Cement Delivery Receipt',
            indentId: indent6.id,
            createdById: engineer1.id,
            siteId: sites[0].id,
        },
    });
    console.log('      ✓ CLOSED: Cement for Foundation (with receipt)');

    // 7. ORDER_PLACED with damage
    const indent7 = await prisma.indent.create({
        data: {
            indentNumber: 'IND-MUM-2024-007',
            name: 'Tiles for Lobby',
            status: IndentStatus.ORDER_PLACED,
            priority: "NORMAL",
            createdById: engineer1.id,
            siteId: sites[0].id,
            purchaseApprovedById: purchaseTeam.id,
            purchaseApprovedAt: daysAgo(15),
            directorApprovedById: director.id,
            directorApprovedAt: daysAgo(12),
            items: {
                create: [
                    {
                        materialId: materials[16].id,
                        requestedQty: 500,
                        receivedQty: 480,
                        pendingQty: 20,
                        arrivalStatus: "PARTIAL",
                    },
                ],
            },
            order: {
                create: {
                    orderNumber: 'ORD-2024-004',
                    vendorName: 'Kajaria Tiles Showroom',
                    vendorContact: '+91 98765 33333',
                    vendorEmail: 'orders@kajaria.com',
                    vendorAddress: 'Tiles Market, Andheri, Mumbai',
                    expectedDeliveryDate: daysAgo(3),
                    totalAmount: 75000,
                    createdById: purchaseTeam.id,
                    isPurchased: true,
                    purchasedAt: daysAgo(10),
                    orderItems: {
                        create: [
                            { materialName: 'Vitrified Tiles 2x2 ft', materialCode: 'MAT-017', quantity: 500, unitPrice: 150, totalPrice: 75000 },
                        ],
                    },
                },
            },
        },
    });

    // Damage reports for tiles
    await prisma.damageReport.create({
        data: {
            name: 'Broken tiles in delivery',
            description: '15 tiles arrived with cracks and chips. Photos attached.',
            severity: "MODERATE",
            status: 'REPORTED',
            indentId: indent7.id,
            reportedById: engineer1.id,
            siteId: sites[0].id,
            submittedAt: daysAgo(2),
        },
    });

    await prisma.damageReport.create({
        data: {
            name: 'Shade variation in tiles',
            description: 'Some tiles have different shade - quality issue',
            severity: "MINOR",
            status: 'DRAFT',
            indentId: indent7.id,
            reportedById: engineer1.id,
            siteId: sites[0].id,
        },
    });
    console.log('      ✓ ORDER_PLACED: Tiles for Lobby (with damages)');

    // ----- DELHI SITE (sites[1]) -----
    console.log('   📍 Delhi Site indents:');

    // 8. SUBMITTED
    const indent8 = await prisma.indent.create({
        data: {
            indentNumber: 'IND-DEL-2024-001',
            name: 'Painting Materials - Floor 5',
            status: IndentStatus.SUBMITTED,
            priority: "LOW",
            createdById: engineer2.id,
            siteId: sites[1].id,
            items: {
                create: [
                    { materialId: materials[14].id, requestedQty: 100, pendingQty: 100 },
                    { materialId: materials[15].id, requestedQty: 50, pendingQty: 50 },
                ],
            },
        },
    });
    console.log('      ✓ SUBMITTED: Painting Materials Floor 5');

    // 9. PURCHASE_APPROVED
    const indent9 = await prisma.indent.create({
        data: {
            indentNumber: 'IND-DEL-2024-002',
            name: 'Safety Equipment - Site Workers',
            status: IndentStatus.PURCHASE_APPROVED,
            priority: "HIGH",
            notes: 'New workers joining - urgent safety equipment needed',
            createdById: engineer2.id,
            siteId: sites[1].id,
            purchaseApprovedById: purchaseTeam.id,
            purchaseApprovedAt: daysAgo(1),
            items: {
                create: [
                    { materialId: materials[18].id, requestedQty: 50, pendingQty: 50 },
                    { materialId: materials[19].id, requestedQty: 50, pendingQty: 50 },
                ],
            },
        },
    });
    console.log('      ✓ PURCHASE_APPROVED: Safety Equipment');

    // 10. CLOSED
    const indent10 = await prisma.indent.create({
        data: {
            indentNumber: 'IND-DEL-2024-003',
            name: 'Bathroom Tiles - Block B',
            status: IndentStatus.CLOSED,
            priority: "NORMAL",
            createdById: engineer2.id,
            siteId: sites[1].id,
            purchaseApprovedById: purchaseTeam.id,
            purchaseApprovedAt: daysAgo(30),
            directorApprovedById: director.id,
            directorApprovedAt: daysAgo(28),
            items: {
                create: [
                    {
                        materialId: materials[17].id,
                        requestedQty: 300,
                        receivedQty: 300,
                        pendingQty: 0,
                        arrivalStatus: "ARRIVED",
                    },
                ],
            },
            order: {
                create: {
                    orderNumber: 'ORD-2024-005',
                    vendorName: 'Johnson Tiles Delhi',
                    vendorContact: '+91 98765 55555',
                    expectedDeliveryDate: daysAgo(20),
                    totalAmount: 45000,
                    createdById: purchaseTeam.id,
                    isPurchased: true,
                    purchasedAt: daysAgo(25),
                    orderItems: {
                        create: [
                            { materialName: 'Bathroom Wall Tiles 1x1 ft', materialCode: 'MAT-018', quantity: 300, unitPrice: 150, totalPrice: 45000 },
                        ],
                    },
                },
            },
        },
    });

    await prisma.receipt.create({
        data: {
            receiptNumber: 'REC-DEL-2024-001',
            name: 'Bathroom Tiles Receipt',
            indentId: indent10.id,
            createdById: engineer2.id,
            siteId: sites[1].id,
        },
    });
    console.log('      ✓ CLOSED: Bathroom Tiles Block B (with receipt)');

    // ----- BANGALORE SITE (sites[2]) -----
    console.log('   📍 Bangalore Site indents:');

    // 11. DIRECTOR_APPROVED
    const indent11 = await prisma.indent.create({
        data: {
            indentNumber: 'IND-BLR-2024-001',
            name: 'Electrical MCB and Switches',
            status: IndentStatus.DIRECTOR_APPROVED,
            priority: "HIGH",
            createdById: multiSiteEngineer.id,
            siteId: sites[2].id,
            purchaseApprovedById: purchaseTeam.id,
            purchaseApprovedAt: daysAgo(4),
            directorApprovedById: director.id,
            directorApprovedAt: daysAgo(2),
            items: {
                create: [
                    { materialId: materials[9].id, requestedQty: 100, pendingQty: 100 },
                ],
            },
        },
    });
    console.log('      ✓ DIRECTOR_APPROVED: Electrical MCB');

    // 12. ORDER_PLACED - Fresh order
    const indent12 = await prisma.indent.create({
        data: {
            indentNumber: 'IND-BLR-2024-002',
            name: 'PPC Cement for Plastering',
            status: IndentStatus.ORDER_PLACED,
            priority: "NORMAL",
            createdById: multiSiteEngineer.id,
            siteId: sites[2].id,
            purchaseApprovedById: purchaseTeam.id,
            purchaseApprovedAt: daysAgo(8),
            directorApprovedById: director.id,
            directorApprovedAt: daysAgo(6),
            items: {
                create: [
                    { materialId: materials[1].id, requestedQty: 150, pendingQty: 150 },
                ],
            },
            order: {
                create: {
                    orderNumber: 'ORD-2024-006',
                    vendorName: 'ACC Cement Bangalore',
                    vendorContact: '+91 98765 66666',
                    expectedDeliveryDate: daysFromNow(2),
                    totalAmount: 52500,
                    createdById: purchaseTeam.id,
                    isPurchased: true,
                    purchasedAt: daysAgo(4),
                    orderItems: {
                        create: [
                            { materialName: 'Portland Pozzolana Cement (PPC)', materialCode: 'MAT-002', quantity: 150, unitPrice: 350, totalPrice: 52500 },
                        ],
                    },
                },
            },
        },
    });
    console.log('      ✓ ORDER_PLACED: PPC Cement for Plastering');

    console.log('\n✅ Created 12 indents across 3 sites\n');

    // =========================================================================
    // SUMMARY
    // =========================================================================
    console.log('='.repeat(60));
    console.log('🎉 COMPREHENSIVE SEED COMPLETED!');
    console.log('='.repeat(60));
    console.log('\n📊 Database Summary:');
    console.log('   Sites:          3 (Mumbai, Delhi, Bangalore)');
    console.log('   Users:          6 (1 Director, 1 Purchase, 1 Multi-role, 3 Engineers)');
    console.log('   Item Groups:    8');
    console.log('   Units:          8');
    console.log('   Materials:      20');
    console.log('   Indents:        12 (various statuses)');
    console.log('   Orders:         6');
    console.log('   Receipts:       2');
    console.log('   Damage Reports: 2');
    console.log('\n🔑 Test Credentials (password: password123):');
    console.log('   Director:     director@indense.com  / 9876543210');
    console.log('   Purchase:     purchase@indense.com  / 9876543211');
    console.log('   Multi-role:   manager@indense.com   / 9876543212');
    console.log('   Engineer 1:   amit@indense.com      / 9876543213 (Mumbai)');
    console.log('   Engineer 2:   sneha@indense.com     / 9876543214 (Delhi)');
    console.log('   Engineer 3:   karthik@indense.com   / 9876543215 (Bangalore + Mumbai)');
    console.log('\n📋 Indent Status Distribution:');
    console.log('   SUBMITTED:          2');
    console.log('   PURCHASE_APPROVED:  2');
    console.log('   DIRECTOR_APPROVED:  2');
    console.log('   ORDER_PLACED:       4 (1 with partial, 1 with damage)');
    console.log('   CLOSED:             2 (with receipts)');
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
