/**
 * Indense — Comprehensive Seed Script
 *
 * Exercises every feature of the system:
 *   - 3 sites, 6 users (all roles, multi-role, multi-site)
 *   - 13 indents covering ALL statuses (SUBMITTED → CLOSED + REJECTED)
 *   - Orders with full vendor details, items linked to indent items
 *   - Receipts WITH ReceiptItem records (quantity tracking)
 *   - Damage reports: DRAFT, REPORTED, REORDERED, RESOLVED
 *   - Returns: PENDING, APPROVED
 *   - Notifications for various events
 *   - One indent on hold
 *
 * Run: npx prisma db seed
 */

import {
    PrismaClient,
    Role,
    IndentStatus,
    DamageStatus,
    ReturnStatus,
    NotificationType,
    SecurityQuestion,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ── Helpers ───────────────────────────────────────────────────────────────────

const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000);
const daysFromNow = (d: number) => new Date(Date.now() + d * 86_400_000);

// ── Clear ALL 21 tables in FK-safe order ──────────────────────────────────────

async function clearDatabase() {
    console.log('🧹 Clearing existing data...');
    await prisma.notification.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.return.deleteMany();
    await prisma.damageImage.deleteMany();
    await prisma.damageReport.deleteMany();
    await prisma.receiptImage.deleteMany();
    await prisma.receiptItem.deleteMany();
    await prisma.receipt.deleteMany();
    await prisma.orderItemInvoice.deleteMany();
    await prisma.orderInvoice.deleteMany();
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

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
    console.log('🌱 Starting Indense Comprehensive Seed...\n');
    await clearDatabase();

    const hashedPassword = await bcrypt.hash('password123', 10);
    const hashedSecurityAnswer = await bcrypt.hash('mumbai', 10);

    // ═══════════════════════════════════════════════════════════════════════════
    // SITES
    // ═══════════════════════════════════════════════════════════════════════════
    console.log('📍 Creating sites...');
    const [siteMUM, siteDEL, siteBLR] = await Promise.all([
        prisma.site.create({
            data: {
                name: 'Prestige Heights - Bandra',
                code: 'MUM01',
                address: 'Plot 45, Linking Road, Bandra West',
                city: 'Mumbai',
                state: 'Maharashtra',
                startDate: daysAgo(120),
                expectedHandoverDate: daysFromNow(240),
            },
        }),
        prisma.site.create({
            data: {
                name: 'DLF Cyber Hub - Phase 2',
                code: 'DEL01',
                address: 'Sector 24, DLF Cyber City',
                city: 'Gurgaon',
                state: 'Haryana',
                startDate: daysAgo(90),
                expectedHandoverDate: daysFromNow(300),
            },
        }),
        prisma.site.create({
            data: {
                name: 'Embassy Tech Park - Block C',
                code: 'BLR01',
                address: 'Outer Ring Road, Marathahalli',
                city: 'Bangalore',
                state: 'Karnataka',
                startDate: daysAgo(60),
                expectedHandoverDate: daysFromNow(360),
            },
        }),
    ]);
    console.log('✅ Created 3 sites\n');

    // ═══════════════════════════════════════════════════════════════════════════
    // USERS
    // ═══════════════════════════════════════════════════════════════════════════
    console.log('👥 Creating users...');

    const director = await prisma.user.create({
        data: {
            email: 'director@indense.com',
            phone: '9876543210',
            password: hashedPassword,
            name: 'Rajesh Kumar',
            role: Role.DIRECTOR,
            securityQuestion: SecurityQuestion.BIRTHPLACE_CITY,
            securityAnswer: hashedSecurityAnswer,
        },
    });

    const purchaseTeam = await prisma.user.create({
        data: {
            email: 'purchase@indense.com',
            phone: '9876543211',
            password: hashedPassword,
            name: 'Priya Sharma',
            role: Role.PURCHASE_TEAM,
            securityQuestion: SecurityQuestion.BIRTHPLACE_CITY,
            securityAnswer: hashedSecurityAnswer,
        },
    });

    const multiRoleUser = await prisma.user.create({
        data: {
            email: 'manager@indense.com',
            phone: '9876543212',
            password: hashedPassword,
            name: 'Vikram Singh',
            role: Role.PURCHASE_TEAM,
            allowedRoles: [Role.PURCHASE_TEAM, Role.SITE_ENGINEER],
            currentSiteId: siteMUM.id,
            securityQuestion: SecurityQuestion.BIRTHPLACE_CITY,
            securityAnswer: hashedSecurityAnswer,
        },
    });

    const engineer1 = await prisma.user.create({
        data: {
            email: 'amit@indense.com',
            phone: '9876543213',
            password: hashedPassword,
            name: 'Amit Patel',
            role: Role.SITE_ENGINEER,
            currentSiteId: siteMUM.id,
            securityQuestion: SecurityQuestion.BIRTHPLACE_CITY,
            securityAnswer: hashedSecurityAnswer,
        },
    });

    const engineer2 = await prisma.user.create({
        data: {
            email: 'sneha@indense.com',
            phone: '9876543214',
            password: hashedPassword,
            name: 'Sneha Reddy',
            role: Role.SITE_ENGINEER,
            currentSiteId: siteDEL.id,
            securityQuestion: SecurityQuestion.BIRTHPLACE_CITY,
            securityAnswer: hashedSecurityAnswer,
        },
    });

    const engineer3 = await prisma.user.create({
        data: {
            email: 'karthik@indense.com',
            phone: '9876543215',
            password: hashedPassword,
            name: 'Karthik Nair',
            role: Role.SITE_ENGINEER,
            currentSiteId: siteBLR.id,
            securityQuestion: SecurityQuestion.BIRTHPLACE_CITY,
            securityAnswer: hashedSecurityAnswer,
        },
    });

    // UserSite associations
    await Promise.all([
        prisma.userSite.create({ data: { userId: multiRoleUser.id, siteId: siteMUM.id } }),
        prisma.userSite.create({ data: { userId: engineer1.id, siteId: siteMUM.id } }),
        prisma.userSite.create({ data: { userId: engineer2.id, siteId: siteDEL.id } }),
        prisma.userSite.create({ data: { userId: engineer3.id, siteId: siteBLR.id } }),
        prisma.userSite.create({ data: { userId: engineer3.id, siteId: siteMUM.id } }), // multi-site
    ]);
    console.log('✅ Created 6 users (1 Director, 1 PT, 1 Multi-role, 3 Engineers)\n');

    // ═══════════════════════════════════════════════════════════════════════════
    // ITEM GROUPS & UNITS
    // ═══════════════════════════════════════════════════════════════════════════
    console.log('📁 Creating item groups & units...');
    const [cement, steel, hardware, electrical, plumbing, painting, tiles, safety] =
        await Promise.all([
            prisma.itemGroup.create({ data: { name: 'CEMENT' } }),
            prisma.itemGroup.create({ data: { name: 'STEEL' } }),
            prisma.itemGroup.create({ data: { name: 'HARDWARE' } }),
            prisma.itemGroup.create({ data: { name: 'ELECTRICAL' } }),
            prisma.itemGroup.create({ data: { name: 'PLUMBING' } }),
            prisma.itemGroup.create({ data: { name: 'PAINTING' } }),
            prisma.itemGroup.create({ data: { name: 'TILES' } }),
            prisma.itemGroup.create({ data: { name: 'SAFETY' } }),
        ]);

    const [uBags, uKg, uNos, uMtr, uSft, uLtr, uSet, uBox] = await Promise.all([
        prisma.unitOfMeasure.create({ data: { code: 'BAGS', name: 'Bags' } }),
        prisma.unitOfMeasure.create({ data: { code: 'KG', name: 'Kilogram' } }),
        prisma.unitOfMeasure.create({ data: { code: 'NOS', name: 'Numbers' } }),
        prisma.unitOfMeasure.create({ data: { code: 'MTR', name: 'Meter' } }),
        prisma.unitOfMeasure.create({ data: { code: 'SFT', name: 'Square Foot' } }),
        prisma.unitOfMeasure.create({ data: { code: 'LTR', name: 'Litre' } }),
        prisma.unitOfMeasure.create({ data: { code: 'SET', name: 'Set' } }),
        prisma.unitOfMeasure.create({ data: { code: 'BOX', name: 'Box' } }),
    ]);
    console.log('✅ Created 8 item groups + 8 units\n');

    // ═══════════════════════════════════════════════════════════════════════════
    // MATERIALS (20)
    // ═══════════════════════════════════════════════════════════════════════════
    console.log('🏗️  Creating materials...');
    const mat = await Promise.all([
        // 0  Cement
        prisma.material.create({ data: { name: 'Portland Cement OPC 53 Grade', code: 'MAT-001', itemGroupId: cement.id, unitId: uBags.id, description: 'Ultratech OPC 53 Grade - 50kg bags', isSystemData: true } }),
        // 1  Cement
        prisma.material.create({ data: { name: 'Portland Pozzolana Cement (PPC)', code: 'MAT-002', itemGroupId: cement.id, unitId: uBags.id, description: 'ACC PPC Cement - 50kg bags', isSystemData: true } }),
        // 2  Steel
        prisma.material.create({ data: { name: 'TMT Steel Bars 12mm Fe500D', code: 'MAT-003', itemGroupId: steel.id, unitId: uKg.id, description: 'Tata Tiscon TMT bars', isSystemData: true } }),
        // 3  Steel
        prisma.material.create({ data: { name: 'TMT Steel Bars 16mm Fe500D', code: 'MAT-004', itemGroupId: steel.id, unitId: uKg.id, description: 'Jindal TMT bars for columns', isSystemData: true } }),
        // 4  Steel
        prisma.material.create({ data: { name: 'Binding Wire 18 Gauge', code: 'MAT-005', itemGroupId: steel.id, unitId: uKg.id, description: 'GI binding wire', isSystemData: true } }),
        // 5  Hardware
        prisma.material.create({ data: { name: 'Door Hinges 4 inch SS', code: 'MAT-006', itemGroupId: hardware.id, unitId: uNos.id, description: 'SS door hinges - heavy duty', isSystemData: true } }),
        // 6  Hardware
        prisma.material.create({ data: { name: 'Tower Bolts 8 inch', code: 'MAT-007', itemGroupId: hardware.id, unitId: uNos.id, description: 'Brass tower bolts', isSystemData: true } }),
        // 7  Hardware
        prisma.material.create({ data: { name: 'Door Handle Set', code: 'MAT-008', itemGroupId: hardware.id, unitId: uSet.id, description: 'Mortise lock with handle', isSystemData: true } }),
        // 8  Electrical
        prisma.material.create({ data: { name: 'Electrical Wire 2.5mm FRLS', code: 'MAT-009', itemGroupId: electrical.id, unitId: uMtr.id, description: 'Havells FRLS copper wire', isSystemData: true } }),
        // 9  Electrical
        prisma.material.create({ data: { name: 'MCB 16A Single Pole', code: 'MAT-010', itemGroupId: electrical.id, unitId: uNos.id, description: 'Schneider MCB', isSystemData: true } }),
        // 10 Electrical
        prisma.material.create({ data: { name: 'PVC Conduit Pipe 25mm', code: 'MAT-011', itemGroupId: electrical.id, unitId: uMtr.id, description: 'ISI marked conduit', isSystemData: true } }),
        // 11 Plumbing
        prisma.material.create({ data: { name: 'CPVC Pipe 1 inch', code: 'MAT-012', itemGroupId: plumbing.id, unitId: uMtr.id, description: 'Astral CPVC pipes', isSystemData: true } }),
        // 12 Plumbing
        prisma.material.create({ data: { name: 'PVC Pipe 4 inch SWR', code: 'MAT-013', itemGroupId: plumbing.id, unitId: uMtr.id, description: 'Prince SWR pipes', isSystemData: true } }),
        // 13 Plumbing
        prisma.material.create({ data: { name: 'Ball Valve 1 inch', code: 'MAT-014', itemGroupId: plumbing.id, unitId: uNos.id, description: 'Brass ball valve', isSystemData: true } }),
        // 14 Painting
        prisma.material.create({ data: { name: 'Interior Emulsion Paint White', code: 'MAT-015', itemGroupId: painting.id, unitId: uLtr.id, description: 'Asian Paints Royale Matt', isSystemData: true } }),
        // 15 Painting
        prisma.material.create({ data: { name: 'Exterior Emulsion Weather Coat', code: 'MAT-016', itemGroupId: painting.id, unitId: uLtr.id, description: 'Berger Weather Coat', isSystemData: true } }),
        // 16 Tiles
        prisma.material.create({ data: { name: 'Vitrified Tiles 2x2 ft', code: 'MAT-017', itemGroupId: tiles.id, unitId: uSft.id, description: 'Kajaria vitrified tiles', isSystemData: true } }),
        // 17 Tiles
        prisma.material.create({ data: { name: 'Bathroom Wall Tiles 1x1 ft', code: 'MAT-018', itemGroupId: tiles.id, unitId: uSft.id, description: 'Johnson ceramic tiles', isSystemData: true } }),
        // 18 Safety
        prisma.material.create({ data: { name: 'Safety Helmet Yellow', code: 'MAT-019', itemGroupId: safety.id, unitId: uNos.id, description: 'ISI construction helmet', isSystemData: true } }),
        // 19 Safety
        prisma.material.create({ data: { name: 'Safety Shoes Size 8-10', code: 'MAT-020', itemGroupId: safety.id, unitId: uNos.id, description: 'Steel toe shoes', isSystemData: true } }),
    ]);
    console.log(`✅ Created ${mat.length} materials\n`);

    // ═══════════════════════════════════════════════════════════════════════════
    // INDENTS — every status exercised
    // ═══════════════════════════════════════════════════════════════════════════
    console.log('📝 Creating indents...\n');

    // ── 1. SUBMITTED (Mumbai) ─────────────────────────────────────────────────
    const indent1 = await prisma.indent.create({
        data: {
            indentNumber: 'IND-MUM01-202601-0001',
            name: 'Foundation Phase Materials',
            status: IndentStatus.SUBMITTED,
            priority: 'URGENT',
            notes: 'Urgent: foundation work starting next week',
            createdById: engineer1.id,
            siteId: siteMUM.id,
            createdAt: daysAgo(3),
            items: {
                create: [
                    { materialId: mat[0].id, requestedQty: 100, pendingQty: 100 },
                    { materialId: mat[2].id, requestedQty: 2000, pendingQty: 2000 },
                    { materialId: mat[4].id, requestedQty: 50, pendingQty: 50 },
                ],
            },
        },
        include: { items: true },
    });
    console.log('   ✅ #1  SUBMITTED: Foundation Phase Materials (Mumbai)');

    // ── 2. PURCHASE_APPROVED (Mumbai) ─────────────────────────────────────────
    const indent2 = await prisma.indent.create({
        data: {
            indentNumber: 'IND-MUM01-202601-0002',
            name: 'Electrical Phase 1 - Conduit Work',
            status: IndentStatus.PURCHASE_APPROVED,
            priority: 'NORMAL',
            createdById: engineer1.id,
            siteId: siteMUM.id,
            createdAt: daysAgo(7),
            purchaseApprovedById: purchaseTeam.id,
            purchaseApprovedAt: daysAgo(5),
            purchaseRemarks: 'Quantities verified. Proceed to Director.',
            items: {
                create: [
                    { materialId: mat[8].id, requestedQty: 1500, pendingQty: 1500 },
                    { materialId: mat[10].id, requestedQty: 500, pendingQty: 500 },
                ],
            },
        },
        include: { items: true },
    });
    console.log('   ✅ #2  PURCHASE_APPROVED: Electrical Phase 1 (Mumbai)');

    // ── 3. DIRECTOR_APPROVED (Mumbai) — ready for ordering ────────────────────
    const indent3 = await prisma.indent.create({
        data: {
            indentNumber: 'IND-MUM01-202601-0003',
            name: 'Plumbing - Ground Floor',
            status: IndentStatus.DIRECTOR_APPROVED,
            priority: 'HIGH',
            createdById: engineer1.id,
            siteId: siteMUM.id,
            createdAt: daysAgo(10),
            purchaseApprovedById: purchaseTeam.id,
            purchaseApprovedAt: daysAgo(8),
            directorApprovedById: director.id,
            directorApprovedAt: daysAgo(6),
            directorRemarks: 'Approved. Get 3 vendor quotes before ordering.',
            items: {
                create: [
                    { materialId: mat[11].id, requestedQty: 200, pendingQty: 200 },
                    { materialId: mat[12].id, requestedQty: 100, pendingQty: 100 },
                    { materialId: mat[13].id, requestedQty: 50, pendingQty: 50 },
                ],
            },
        },
        include: { items: true },
    });
    console.log('   ✅ #3  DIRECTOR_APPROVED: Plumbing Ground Floor (Mumbai)');

    // ── 4. ORDER_PLACED (Mumbai) — fresh order, no deliveries ─────────────────
    const indent4 = await prisma.indent.create({
        data: {
            indentNumber: 'IND-MUM01-202601-0004',
            name: 'Door Hardware - Building A',
            status: IndentStatus.ORDER_PLACED,
            priority: 'NORMAL',
            createdById: engineer1.id,
            siteId: siteMUM.id,
            createdAt: daysAgo(18),
            purchaseApprovedById: purchaseTeam.id,
            purchaseApprovedAt: daysAgo(16),
            directorApprovedById: director.id,
            directorApprovedAt: daysAgo(14),
            items: {
                create: [
                    { materialId: mat[5].id, requestedQty: 200, pendingQty: 200 },
                    { materialId: mat[6].id, requestedQty: 100, pendingQty: 100 },
                    { materialId: mat[7].id, requestedQty: 50, pendingQty: 50 },
                ],
            },
        },
        include: { items: true },
    });

    // Create the order with items linked to indent items
    await prisma.order.create({
        data: {
            orderNumber: 'ORD-202601-0001',
            indentId: indent4.id,
            vendorName: 'Godrej Hardware Solutions',
            vendorContact: '+91 98201 44444',
            vendorEmail: 'sales@godrejhardware.com',
            vendorAddress: 'Vikhroli Industrial Estate, Mumbai',
            vendorGstNo: '27AABCG1234M1ZP',
            vendorContactPerson: 'Suresh Mehta',
            vendorContactPhone: '+91 98201 55555',
            vendorNatureOfBusiness: 'Hardware Manufacturer',
            expectedDeliveryDate: daysFromNow(3),
            totalAmount: 125000,
            taxAmount: 22500,
            shippingAmount: 2500,
            grandTotal: 150000,
            remarks: 'Premium SS hardware as specified',
            createdById: purchaseTeam.id,
            isPurchased: true,
            purchasedAt: daysAgo(10),
            orderItems: {
                create: [
                    {
                        indentItemId: indent4.items[0].id,
                        materialName: mat[5].name,
                        materialCode: mat[5].code,
                        quantity: 200,
                        unitPrice: 250,
                        totalPrice: 50000,
                        vendorName: 'Godrej Hardware Solutions',
                    },
                    {
                        indentItemId: indent4.items[1].id,
                        materialName: mat[6].name,
                        materialCode: mat[6].code,
                        quantity: 100,
                        unitPrice: 350,
                        totalPrice: 35000,
                        vendorName: 'Godrej Hardware Solutions',
                    },
                    {
                        indentItemId: indent4.items[2].id,
                        materialName: mat[7].name,
                        materialCode: mat[7].code,
                        quantity: 50,
                        unitPrice: 800,
                        totalPrice: 40000,
                        vendorName: 'Godrej Hardware Solutions',
                    },
                ],
            },
        },
    });
    console.log('   ✅ #4  ORDER_PLACED: Door Hardware Building A (Mumbai)');

    // ── 5. PARTIALLY_RECEIVED (Mumbai) — mixed arrival, ON HOLD ───────────────
    const indent5 = await prisma.indent.create({
        data: {
            indentNumber: 'IND-MUM01-202601-0005',
            name: 'Steel for Columns - Phase 1',
            status: IndentStatus.PARTIALLY_RECEIVED,
            priority: 'HIGH',
            createdById: engineer1.id,
            siteId: siteMUM.id,
            createdAt: daysAgo(25),
            purchaseApprovedById: purchaseTeam.id,
            purchaseApprovedAt: daysAgo(23),
            directorApprovedById: director.id,
            directorApprovedAt: daysAgo(21),
            // ON HOLD
            isOnHold: true,
            onHoldAt: daysAgo(2),
            onHoldById: director.id,
            onHoldReason: 'Waiting for structural consultant report before accepting remaining steel',
            items: {
                create: [
                    {
                        materialId: mat[2].id,
                        requestedQty: 5000,
                        receivedQty: 3500,
                        pendingQty: 1500,
                        arrivalStatus: 'PARTIAL',
                        arrivalNotes: '3500kg delivered, remaining 1500kg ETA next week',
                    },
                    {
                        materialId: mat[3].id,
                        requestedQty: 2000,
                        receivedQty: 2000,
                        pendingQty: 0,
                        arrivalStatus: 'ARRIVED',
                    },
                ],
            },
        },
        include: { items: true },
    });

    await prisma.order.create({
        data: {
            orderNumber: 'ORD-202601-0002',
            indentId: indent5.id,
            vendorName: 'Tata Steel Dealers',
            vendorContact: '+91 98765 11111',
            vendorEmail: 'orders@tatasteel.com',
            vendorAddress: 'Steel Market, Lower Parel, Mumbai',
            vendorGstNo: '27AABCT1234N1ZP',
            vendorContactPerson: 'Rajiv Gupta',
            vendorContactPhone: '+91 98765 22222',
            vendorNatureOfBusiness: 'Steel Trading',
            expectedDeliveryDate: daysFromNow(5),
            totalAmount: 420000,
            taxAmount: 75600,
            grandTotal: 495600,
            createdById: purchaseTeam.id,
            isPurchased: true,
            purchasedAt: daysAgo(18),
            orderItems: {
                create: [
                    {
                        indentItemId: indent5.items[0].id,
                        materialName: mat[2].name,
                        materialCode: mat[2].code,
                        quantity: 5000,
                        unitPrice: 60,
                        totalPrice: 300000,
                        vendorName: 'Tata Steel Dealers',
                    },
                    {
                        indentItemId: indent5.items[1].id,
                        materialName: mat[3].name,
                        materialCode: mat[3].code,
                        quantity: 2000,
                        unitPrice: 60,
                        totalPrice: 120000,
                        vendorName: 'Tata Steel Dealers',
                    },
                ],
            },
        },
    });

    // Receipt for the partial delivery
    await prisma.receipt.create({
        data: {
            receiptNumber: 'RCP-MUM01-202601-0001',
            name: 'Steel Partial Delivery',
            indentId: indent5.id,
            siteId: siteMUM.id,
            createdById: engineer1.id,
            createdAt: daysAgo(10),
            deliveryNote: 'DN-TS-44521',
            remarks: '16mm fully delivered, 12mm partial - 1500kg pending',
            items: {
                create: [
                    { indentItemId: indent5.items[0].id, receivedQty: 3500, remarks: 'Partial delivery' },
                    { indentItemId: indent5.items[1].id, receivedQty: 2000 },
                ],
            },
        },
    });
    console.log('   ✅ #5  PARTIALLY_RECEIVED + ON HOLD: Steel Columns (Mumbai)');

    // ── 6. FULLY_RECEIVED (Mumbai) — all arrived, ready to close ──────────────
    const indent6 = await prisma.indent.create({
        data: {
            indentNumber: 'IND-MUM01-202601-0006',
            name: 'Safety Equipment - Workers',
            status: IndentStatus.FULLY_RECEIVED,
            priority: 'HIGH',
            createdById: engineer1.id,
            siteId: siteMUM.id,
            createdAt: daysAgo(20),
            purchaseApprovedById: purchaseTeam.id,
            purchaseApprovedAt: daysAgo(18),
            directorApprovedById: director.id,
            directorApprovedAt: daysAgo(16),
            items: {
                create: [
                    {
                        materialId: mat[18].id,
                        requestedQty: 50,
                        receivedQty: 50,
                        pendingQty: 0,
                        arrivalStatus: 'ARRIVED',
                    },
                    {
                        materialId: mat[19].id,
                        requestedQty: 50,
                        receivedQty: 50,
                        pendingQty: 0,
                        arrivalStatus: 'ARRIVED',
                    },
                ],
            },
        },
        include: { items: true },
    });

    await prisma.order.create({
        data: {
            orderNumber: 'ORD-202601-0003',
            indentId: indent6.id,
            vendorName: 'Karam Safety Pvt Ltd',
            vendorContact: '+91 98765 77777',
            vendorAddress: 'MIDC, Andheri East, Mumbai',
            vendorGstNo: '27AABCK5678M1ZP',
            vendorContactPerson: 'Deepak Joshi',
            vendorContactPhone: '+91 98765 88888',
            vendorNatureOfBusiness: 'Safety Equipment Manufacturer',
            expectedDeliveryDate: daysAgo(5),
            totalAmount: 37500,
            taxAmount: 6750,
            grandTotal: 44250,
            createdById: purchaseTeam.id,
            isPurchased: true,
            purchasedAt: daysAgo(14),
            orderItems: {
                create: [
                    {
                        indentItemId: indent6.items[0].id,
                        materialName: mat[18].name,
                        materialCode: mat[18].code,
                        quantity: 50,
                        unitPrice: 350,
                        totalPrice: 17500,
                        vendorName: 'Karam Safety Pvt Ltd',
                    },
                    {
                        indentItemId: indent6.items[1].id,
                        materialName: mat[19].name,
                        materialCode: mat[19].code,
                        quantity: 50,
                        unitPrice: 400,
                        totalPrice: 20000,
                        vendorName: 'Karam Safety Pvt Ltd',
                    },
                ],
            },
        },
    });

    await prisma.receipt.create({
        data: {
            receiptNumber: 'RCP-MUM01-202601-0002',
            name: 'Safety Equipment Full Delivery',
            indentId: indent6.id,
            siteId: siteMUM.id,
            createdById: engineer1.id,
            createdAt: daysAgo(6),
            deliveryNote: 'DN-KS-7891',
            items: {
                create: [
                    { indentItemId: indent6.items[0].id, receivedQty: 50 },
                    { indentItemId: indent6.items[1].id, receivedQty: 50 },
                ],
            },
        },
    });
    console.log('   ✅ #6  FULLY_RECEIVED: Safety Equipment (Mumbai)');

    // ── 7. CLOSED (Mumbai) — complete lifecycle ───────────────────────────────
    const indent7 = await prisma.indent.create({
        data: {
            indentNumber: 'IND-MUM01-202601-0007',
            name: 'Cement for Foundation',
            status: IndentStatus.CLOSED,
            priority: 'HIGH',
            createdById: engineer1.id,
            siteId: siteMUM.id,
            createdAt: daysAgo(35),
            purchaseApprovedById: purchaseTeam.id,
            purchaseApprovedAt: daysAgo(33),
            directorApprovedById: director.id,
            directorApprovedAt: daysAgo(31),
            closedAt: daysAgo(5),
            items: {
                create: [
                    {
                        materialId: mat[0].id,
                        requestedQty: 200,
                        receivedQty: 200,
                        pendingQty: 0,
                        arrivalStatus: 'ARRIVED',
                    },
                ],
            },
        },
        include: { items: true },
    });

    await prisma.order.create({
        data: {
            orderNumber: 'ORD-202601-0004',
            indentId: indent7.id,
            vendorName: 'UltraTech Cement Dealers',
            vendorContact: '+91 98765 33333',
            vendorEmail: 'bulk@ultratech.com',
            vendorAddress: 'Cement Depot, Mulund, Mumbai',
            vendorGstNo: '27AABCU9012N1ZP',
            vendorContactPerson: 'Anil Kapoor',
            vendorContactPhone: '+91 98765 44444',
            vendorNatureOfBusiness: 'Cement Distribution',
            expectedDeliveryDate: daysAgo(15),
            totalAmount: 70000,
            taxAmount: 12600,
            grandTotal: 82600,
            createdById: purchaseTeam.id,
            isPurchased: true,
            purchasedAt: daysAgo(28),
            orderItems: {
                create: [
                    {
                        indentItemId: indent7.items[0].id,
                        materialName: mat[0].name,
                        materialCode: mat[0].code,
                        quantity: 200,
                        unitPrice: 350,
                        totalPrice: 70000,
                        vendorName: 'UltraTech Cement Dealers',
                    },
                ],
            },
        },
    });

    await prisma.receipt.create({
        data: {
            receiptNumber: 'RCP-MUM01-202601-0003',
            name: 'Cement Full Delivery',
            indentId: indent7.id,
            siteId: siteMUM.id,
            createdById: engineer1.id,
            createdAt: daysAgo(15),
            deliveryNote: 'DN-UT-22001',
            items: {
                create: [
                    { indentItemId: indent7.items[0].id, receivedQty: 200 },
                ],
            },
        },
    });
    console.log('   ✅ #7  CLOSED: Cement for Foundation (Mumbai)');

    // ── 8. ORDER_PLACED with DAMAGES (Mumbai) ─────────────────────────────────
    const indent8 = await prisma.indent.create({
        data: {
            indentNumber: 'IND-MUM01-202601-0008',
            name: 'Tiles for Lobby',
            status: IndentStatus.ORDER_PLACED,
            priority: 'NORMAL',
            createdById: engineer1.id,
            siteId: siteMUM.id,
            createdAt: daysAgo(22),
            purchaseApprovedById: purchaseTeam.id,
            purchaseApprovedAt: daysAgo(20),
            directorApprovedById: director.id,
            directorApprovedAt: daysAgo(18),
            items: {
                create: [
                    {
                        materialId: mat[16].id,
                        requestedQty: 500,
                        receivedQty: 480,
                        pendingQty: 20,
                        arrivalStatus: 'PARTIAL',
                    },
                    {
                        materialId: mat[17].id,
                        requestedQty: 200,
                        receivedQty: 200,
                        pendingQty: 0,
                        arrivalStatus: 'ARRIVED',
                    },
                ],
            },
        },
        include: { items: true },
    });

    await prisma.order.create({
        data: {
            orderNumber: 'ORD-202601-0005',
            indentId: indent8.id,
            vendorName: 'Kajaria Tiles Showroom',
            vendorContact: '+91 98765 55555',
            vendorEmail: 'orders@kajaria.com',
            vendorAddress: 'Tiles Market, Andheri, Mumbai',
            vendorGstNo: '27AABCK9999M1ZP',
            vendorContactPerson: 'Manoj Verma',
            vendorContactPhone: '+91 98765 66666',
            vendorNatureOfBusiness: 'Tiles Manufacturing',
            expectedDeliveryDate: daysAgo(3),
            totalAmount: 105000,
            taxAmount: 18900,
            grandTotal: 123900,
            createdById: purchaseTeam.id,
            isPurchased: true,
            purchasedAt: daysAgo(15),
            orderItems: {
                create: [
                    {
                        indentItemId: indent8.items[0].id,
                        materialName: mat[16].name,
                        materialCode: mat[16].code,
                        quantity: 500,
                        unitPrice: 150,
                        totalPrice: 75000,
                        vendorName: 'Kajaria Tiles Showroom',
                    },
                    {
                        indentItemId: indent8.items[1].id,
                        materialName: mat[17].name,
                        materialCode: mat[17].code,
                        quantity: 200,
                        unitPrice: 150,
                        totalPrice: 30000,
                        vendorName: 'Kajaria Tiles Showroom',
                    },
                ],
            },
        },
    });

    // Damage report: REPORTED
    await prisma.damageReport.create({
        data: {
            name: 'Broken tiles in delivery',
            description: '15 vitrified tiles arrived with cracks and chips. Multiple boxes had poor packaging.',
            severity: 'MODERATE',
            damagedQty: 15,
            status: DamageStatus.REPORTED,
            indentId: indent8.id,
            indentItemId: indent8.items[0].id,
            reportedById: engineer1.id,
            siteId: siteMUM.id,
            submittedAt: daysAgo(4),
            createdAt: daysAgo(4),
        },
    });

    // Damage report: DRAFT
    await prisma.damageReport.create({
        data: {
            name: 'Shade variation in wall tiles',
            description: 'Some bathroom tiles have different shade - quality issue to investigate',
            severity: 'MINOR',
            damagedQty: 8,
            status: DamageStatus.DRAFT,
            indentId: indent8.id,
            indentItemId: indent8.items[1].id,
            reportedById: engineer1.id,
            siteId: siteMUM.id,
            createdAt: daysAgo(2),
        },
    });
    console.log('   ✅ #8  ORDER_PLACED + DAMAGES: Tiles for Lobby (Mumbai)');

    // ── 9. REJECTED (Mumbai) ──────────────────────────────────────────────────
    await prisma.indent.create({
        data: {
            indentNumber: 'IND-MUM01-202601-0009',
            name: 'Luxury Marble Flooring - Director Cabin',
            status: IndentStatus.REJECTED,
            priority: 'LOW',
            createdById: engineer1.id,
            siteId: siteMUM.id,
            createdAt: daysAgo(15),
            purchaseApprovedById: purchaseTeam.id,
            purchaseApprovedAt: daysAgo(13),
            rejectedById: director.id,
            rejectedAt: daysAgo(11),
            rejectionReason: 'Not in the approved budget. Use regular vitrified tiles instead.',
            items: {
                create: [
                    { materialId: mat[16].id, requestedQty: 100, pendingQty: 100 },
                ],
            },
        },
    });
    console.log('   ✅ #9  REJECTED: Luxury Marble Flooring (Mumbai)');

    // ── 10. SUBMITTED (Delhi) — SE isolation test ─────────────────────────────
    await prisma.indent.create({
        data: {
            indentNumber: 'IND-DEL01-202601-0001',
            name: 'Painting Materials - Floor 5',
            status: IndentStatus.SUBMITTED,
            priority: 'LOW',
            createdById: engineer2.id,
            siteId: siteDEL.id,
            createdAt: daysAgo(4),
            items: {
                create: [
                    { materialId: mat[14].id, requestedQty: 100, pendingQty: 100 },
                    { materialId: mat[15].id, requestedQty: 50, pendingQty: 50 },
                ],
            },
        },
    });
    console.log('   ✅ #10 SUBMITTED: Painting Materials (Delhi)');

    // ── 11. CLOSED (Delhi) — with receipt + items ─────────────────────────────
    const indent11 = await prisma.indent.create({
        data: {
            indentNumber: 'IND-DEL01-202601-0002',
            name: 'Bathroom Tiles - Block B',
            status: IndentStatus.CLOSED,
            priority: 'NORMAL',
            createdById: engineer2.id,
            siteId: siteDEL.id,
            createdAt: daysAgo(40),
            purchaseApprovedById: purchaseTeam.id,
            purchaseApprovedAt: daysAgo(38),
            directorApprovedById: director.id,
            directorApprovedAt: daysAgo(36),
            closedAt: daysAgo(10),
            items: {
                create: [
                    {
                        materialId: mat[17].id,
                        requestedQty: 300,
                        receivedQty: 300,
                        pendingQty: 0,
                        arrivalStatus: 'ARRIVED',
                    },
                ],
            },
        },
        include: { items: true },
    });

    await prisma.order.create({
        data: {
            orderNumber: 'ORD-202601-0006',
            indentId: indent11.id,
            vendorName: 'Johnson Tiles Delhi',
            vendorContact: '+91 98765 99999',
            vendorAddress: 'Tiles Hub, Noida',
            vendorGstNo: '09AABCJ3456N1ZP',
            vendorContactPerson: 'Rohit Mehra',
            vendorContactPhone: '+91 98765 00000',
            vendorNatureOfBusiness: 'Tiles Distribution',
            expectedDeliveryDate: daysAgo(20),
            totalAmount: 45000,
            taxAmount: 8100,
            grandTotal: 53100,
            createdById: purchaseTeam.id,
            isPurchased: true,
            purchasedAt: daysAgo(33),
            orderItems: {
                create: [
                    {
                        indentItemId: indent11.items[0].id,
                        materialName: mat[17].name,
                        materialCode: mat[17].code,
                        quantity: 300,
                        unitPrice: 150,
                        totalPrice: 45000,
                        vendorName: 'Johnson Tiles Delhi',
                    },
                ],
            },
        },
    });

    await prisma.receipt.create({
        data: {
            receiptNumber: 'RCP-DEL01-202601-0001',
            name: 'Bathroom Tiles Full Delivery',
            indentId: indent11.id,
            siteId: siteDEL.id,
            createdById: engineer2.id,
            createdAt: daysAgo(20),
            deliveryNote: 'DN-JT-8801',
            items: {
                create: [
                    { indentItemId: indent11.items[0].id, receivedQty: 300 },
                ],
            },
        },
    });
    console.log('   ✅ #11 CLOSED: Bathroom Tiles Block B (Delhi)');

    // ── 12. DIRECTOR_APPROVED (Bangalore) ─────────────────────────────────────
    await prisma.indent.create({
        data: {
            indentNumber: 'IND-BLR01-202601-0001',
            name: 'Electrical MCB and Switches',
            status: IndentStatus.DIRECTOR_APPROVED,
            priority: 'HIGH',
            createdById: engineer3.id,
            siteId: siteBLR.id,
            createdAt: daysAgo(8),
            purchaseApprovedById: purchaseTeam.id,
            purchaseApprovedAt: daysAgo(6),
            directorApprovedById: director.id,
            directorApprovedAt: daysAgo(4),
            items: {
                create: [
                    { materialId: mat[9].id, requestedQty: 100, pendingQty: 100 },
                ],
            },
        },
    });
    console.log('   ✅ #12 DIRECTOR_APPROVED: Electrical MCB (Bangalore)');

    // ── 13. ORDER_PLACED (Bangalore) — REORDERED damage + RETURN ──────────────
    const indent13 = await prisma.indent.create({
        data: {
            indentNumber: 'IND-BLR01-202601-0002',
            name: 'PPC Cement for Plastering',
            status: IndentStatus.ORDER_PLACED,
            priority: 'NORMAL',
            createdById: engineer3.id,
            siteId: siteBLR.id,
            createdAt: daysAgo(15),
            purchaseApprovedById: purchaseTeam.id,
            purchaseApprovedAt: daysAgo(13),
            directorApprovedById: director.id,
            directorApprovedAt: daysAgo(11),
            items: {
                create: [
                    {
                        materialId: mat[1].id,
                        requestedQty: 150,
                        receivedQty: 150,
                        pendingQty: 0,
                        arrivalStatus: 'ARRIVED',
                    },
                ],
            },
        },
        include: { items: true },
    });

    await prisma.order.create({
        data: {
            orderNumber: 'ORD-202601-0007',
            indentId: indent13.id,
            vendorName: 'ACC Cement Bangalore',
            vendorContact: '+91 98765 12345',
            vendorAddress: 'Cement Depot, Peenya, Bangalore',
            vendorGstNo: '29AABCA1234M1ZP',
            vendorContactPerson: 'Naveen Rao',
            vendorContactPhone: '+91 98765 67890',
            vendorNatureOfBusiness: 'Cement Distribution',
            expectedDeliveryDate: daysAgo(5),
            totalAmount: 52500,
            taxAmount: 9450,
            grandTotal: 61950,
            createdById: purchaseTeam.id,
            isPurchased: true,
            purchasedAt: daysAgo(8),
            orderItems: {
                create: [
                    {
                        indentItemId: indent13.items[0].id,
                        materialName: mat[1].name,
                        materialCode: mat[1].code,
                        quantity: 150,
                        unitPrice: 350,
                        totalPrice: 52500,
                        vendorName: 'ACC Cement Bangalore',
                    },
                ],
            },
        },
    });

    // Damage report: RESOLVED
    await prisma.damageReport.create({
        data: {
            name: 'Water-damaged cement bags',
            description: '5 bags arrived with wet packaging, cement hardened inside. Vendor notified and credit issued.',
            severity: 'HIGH',
            damagedQty: 5,
            status: DamageStatus.RESOLVED,
            indentId: indent13.id,
            indentItemId: indent13.items[0].id,
            reportedById: engineer3.id,
            siteId: siteBLR.id,
            submittedAt: daysAgo(4),
            createdAt: daysAgo(4),
            isResolved: true,
            resolvedAt: daysAgo(1),
            resolution: 'Vendor issued credit note for 5 bags. Replacement bags delivered.',
        },
    });

    // Damage report: REORDERED (with associated return)
    const reorderedDamage = await prisma.damageReport.create({
        data: {
            name: 'Defective cement bags - wrong grade',
            description: '10 bags are OPC 43 Grade instead of PPC. Wrong product supplied.',
            severity: 'HIGH',
            damagedQty: 10,
            status: DamageStatus.REORDERED,
            indentId: indent13.id,
            indentItemId: indent13.items[0].id,
            reportedById: engineer3.id,
            siteId: siteBLR.id,
            submittedAt: daysAgo(3),
            createdAt: daysAgo(3),
            isReordered: true,
            reorderedAt: daysAgo(1),
            reorderExpectedDate: daysFromNow(5),
            reorderedById: purchaseTeam.id,
        },
    });

    // Return: PENDING
    await prisma.return.create({
        data: {
            returnNumber: 'RET-BLR01-202601-0001',
            damageReportId: reorderedDamage.id,
            siteId: siteBLR.id,
            createdById: engineer3.id,
            quantity: 10,
            reason: 'Wrong grade supplied - returning OPC 43 bags for replacement with PPC',
            status: ReturnStatus.PENDING,
            createdAt: daysAgo(1),
        },
    });
    console.log('   ✅ #13 ORDER_PLACED + REORDERED DAMAGE + RETURN: PPC Cement (Bangalore)');

    console.log('\n✅ Created 13 indents across 3 sites\n');

    // ═══════════════════════════════════════════════════════════════════════════
    // NOTIFICATIONS — populate the notifications screen
    // ═══════════════════════════════════════════════════════════════════════════
    console.log('🔔 Creating notifications...');
    await Promise.all([
        // For PT
        prisma.notification.create({
            data: {
                type: NotificationType.INDENT_SUBMITTED,
                userId: purchaseTeam.id,
                title: 'New Indent Submitted',
                message: `Indent IND-MUM01-202601-0001 submitted and awaiting review.`,
                indentId: indent1.id,
                createdAt: daysAgo(3),
            },
        }),
        prisma.notification.create({
            data: {
                type: NotificationType.INDENT_URGENT,
                userId: purchaseTeam.id,
                title: 'Urgent Indent',
                message: `Urgent indent IND-MUM01-202601-0001 requires immediate attention.`,
                indentId: indent1.id,
                createdAt: daysAgo(3),
            },
        }),
        prisma.notification.create({
            data: {
                type: NotificationType.INDENT_DIRECTOR_APPROVED,
                userId: purchaseTeam.id,
                title: 'Director Approved',
                message: `Indent IND-MUM01-202601-0003 approved by Director. Proceed to ordering.`,
                indentId: indent3.id,
                isRead: true,
                readAt: daysAgo(5),
                createdAt: daysAgo(6),
            },
        }),
        prisma.notification.create({
            data: {
                type: NotificationType.DAMAGE_REPORTED,
                userId: purchaseTeam.id,
                title: 'Damage Reported',
                message: `Damage "Broken tiles in delivery" reported for indent IND-MUM01-202601-0008.`,
                indentId: indent8.id,
                createdAt: daysAgo(4),
            },
        }),
        // For Director
        prisma.notification.create({
            data: {
                type: NotificationType.INDENT_SUBMITTED,
                userId: director.id,
                title: 'New Indent Submitted',
                message: `Indent IND-MUM01-202601-0001 submitted and awaiting approval.`,
                indentId: indent1.id,
                createdAt: daysAgo(3),
            },
        }),
        prisma.notification.create({
            data: {
                type: NotificationType.ORDER_PLACED,
                userId: director.id,
                title: 'Order Placed',
                message: `Order ORD-202601-0001 placed for indent IND-MUM01-202601-0004.`,
                indentId: indent4.id,
                isRead: true,
                readAt: daysAgo(9),
                createdAt: daysAgo(10),
            },
        }),
        prisma.notification.create({
            data: {
                type: NotificationType.MATERIAL_RECEIVED,
                userId: director.id,
                title: 'Material Partially Received',
                message: `Indent IND-MUM01-202601-0005 has materials with partial arrival.`,
                indentId: indent5.id,
                createdAt: daysAgo(10),
            },
        }),
        // For Site Engineer (Amit)
        prisma.notification.create({
            data: {
                type: NotificationType.INDENT_PURCHASE_APPROVED,
                userId: engineer1.id,
                title: 'Purchase Team Approved',
                message: `Indent IND-MUM01-202601-0002 approved by Purchase Team and awaiting Director approval.`,
                indentId: indent2.id,
                createdAt: daysAgo(5),
            },
        }),
        prisma.notification.create({
            data: {
                type: NotificationType.INDENT_REJECTED,
                userId: engineer1.id,
                title: 'Indent Rejected',
                message: `Indent IND-MUM01-202601-0009 rejected. Reason: Not in the approved budget.`,
                isRead: true,
                readAt: daysAgo(10),
                createdAt: daysAgo(11),
            },
        }),
        prisma.notification.create({
            data: {
                type: NotificationType.INDENT_ON_HOLD,
                userId: engineer1.id,
                title: 'Indent On Hold',
                message: `Your indent "Steel for Columns - Phase 1" is on hold. Reason: Waiting for structural consultant report.`,
                indentId: indent5.id,
                createdAt: daysAgo(2),
            },
        }),
    ]);
    console.log('✅ Created 10 notifications\n');

    // ═══════════════════════════════════════════════════════════════════════════
    // SUMMARY
    // ═══════════════════════════════════════════════════════════════════════════
    console.log('='.repeat(60));
    console.log('🎉 COMPREHENSIVE SEED COMPLETED!');
    console.log('='.repeat(60));
    console.log('\n📊 Database Summary:');
    console.log('   Sites:            3 (Mumbai, Delhi, Bangalore)');
    console.log('   Users:            6 (1 Director, 1 PT, 1 Multi-role, 3 Engineers)');
    console.log('   Item Groups:      8');
    console.log('   Units:            8');
    console.log('   Materials:        20');
    console.log('   Indents:          13 (all statuses covered)');
    console.log('   Orders:           7 (with full vendor details)');
    console.log('   Receipts:         4 (with ReceiptItem records)');
    console.log('   Damage Reports:   4 (DRAFT, REPORTED, REORDERED, RESOLVED)');
    console.log('   Returns:          1 (PENDING)');
    console.log('   Notifications:    10');
    console.log('\n📋 Indent Status Distribution:');
    console.log('   SUBMITTED:           2 (Mumbai #1, Delhi #10)');
    console.log('   PURCHASE_APPROVED:   1 (Mumbai #2)');
    console.log('   DIRECTOR_APPROVED:   2 (Mumbai #3, Bangalore #12)');
    console.log('   ORDER_PLACED:        3 (Mumbai #4, #8 w/damages, Bangalore #13 w/return)');
    console.log('   PARTIALLY_RECEIVED:  1 (Mumbai #5, ON HOLD)');
    console.log('   FULLY_RECEIVED:      1 (Mumbai #6)');
    console.log('   CLOSED:              2 (Mumbai #7, Delhi #11)');
    console.log('   REJECTED:            1 (Mumbai #9)');
    console.log('\n🔑 Test Credentials (password: password123, security: mumbai):');
    console.log('   Director:     director@indense.com  / 9876543210');
    console.log('   Purchase:     purchase@indense.com  / 9876543211');
    console.log('   Multi-role:   manager@indense.com   / 9876543212');
    console.log('   Engineer 1:   amit@indense.com      / 9876543213 (Mumbai)');
    console.log('   Engineer 2:   sneha@indense.com     / 9876543214 (Delhi)');
    console.log('   Engineer 3:   karthik@indense.com   / 9876543215 (Bangalore + Mumbai)');
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
