import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create Sites
    const sites = await Promise.all([
        prisma.site.upsert({
            where: { code: 'SITE-001' },
            update: {},
            create: {
                name: 'Mumbai Metro Phase 3',
                code: 'SITE-001',
                address: 'Andheri East',
                city: 'Mumbai',
                state: 'Maharashtra',
            },
        }),
        prisma.site.upsert({
            where: { code: 'SITE-002' },
            update: {},
            create: {
                name: 'Delhi Highway Extension',
                code: 'SITE-002',
                address: 'Dwarka Sector 21',
                city: 'Delhi',
                state: 'Delhi',
            },
        }),
        prisma.site.upsert({
            where: { code: 'SITE-003' },
            update: {},
            create: {
                name: 'Bangalore IT Park',
                code: 'SITE-003',
                address: 'Electronic City',
                city: 'Bangalore',
                state: 'Karnataka',
            },
        }),
    ]);

    console.log(`✅ Created ${sites.length} sites`);

    // Create Users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = await Promise.all([
        // Site Engineers (one per site)
        prisma.user.upsert({
            where: { email: 'engineer1@example.com' },
            update: {},
            create: {
                email: 'engineer1@example.com',
                password: hashedPassword,
                name: 'Rajesh Kumar',
                role: Role.SITE_ENGINEER,
                siteId: sites[0].id,
            },
        }),
        prisma.user.upsert({
            where: { email: 'engineer2@example.com' },
            update: {},
            create: {
                email: 'engineer2@example.com',
                password: hashedPassword,
                name: 'Priya Sharma',
                role: Role.SITE_ENGINEER,
                siteId: sites[1].id,
            },
        }),
        prisma.user.upsert({
            where: { email: 'engineer3@example.com' },
            update: {},
            create: {
                email: 'engineer3@example.com',
                password: hashedPassword,
                name: 'Amit Patel',
                role: Role.SITE_ENGINEER,
                siteId: sites[2].id,
            },
        }),
        // Purchase Team
        prisma.user.upsert({
            where: { email: 'purchase1@example.com' },
            update: {},
            create: {
                email: 'purchase1@example.com',
                password: hashedPassword,
                name: 'Sunita Reddy',
                role: Role.PURCHASE_TEAM,
                siteId: null,
            },
        }),
        prisma.user.upsert({
            where: { email: 'purchase2@example.com' },
            update: {},
            create: {
                email: 'purchase2@example.com',
                password: hashedPassword,
                name: 'Vikram Singh',
                role: Role.PURCHASE_TEAM,
                siteId: null,
            },
        }),
        // Director
        prisma.user.upsert({
            where: { email: 'director@example.com' },
            update: {},
            create: {
                email: 'director@example.com',
                password: hashedPassword,
                name: 'Arun Mehta',
                role: Role.DIRECTOR,
                siteId: null,
            },
        }),
    ]);

    console.log(`✅ Created ${users.length} users`);

    // Create Materials (Master Data)
    const materials = await Promise.all([
        // Cement & Concrete
        prisma.material.upsert({
            where: { code: 'MAT-CEM-001' },
            update: {},
            create: {
                name: 'Portland Cement',
                code: 'MAT-CEM-001',
                category: 'Cement',
                unit: 'bags',
                description: 'OPC 53 Grade Cement',
                specifications: {
                    grades: ['43 Grade', '53 Grade'],
                    brands: ['UltraTech', 'ACC', 'Ambuja', 'Dalmia'],
                },
            },
        }),
        prisma.material.upsert({
            where: { code: 'MAT-CEM-002' },
            update: {},
            create: {
                name: 'Ready Mix Concrete',
                code: 'MAT-CEM-002',
                category: 'Concrete',
                unit: 'cubic meters',
                description: 'Pre-mixed concrete',
                specifications: {
                    grades: ['M15', 'M20', 'M25', 'M30', 'M35', 'M40'],
                    slump: ['75mm', '100mm', '125mm', '150mm'],
                },
            },
        }),
        // Steel
        prisma.material.upsert({
            where: { code: 'MAT-STL-001' },
            update: {},
            create: {
                name: 'TMT Steel Bars',
                code: 'MAT-STL-001',
                category: 'Steel',
                unit: 'kg',
                description: 'Thermo Mechanically Treated Steel Bars',
                specifications: {
                    diameters: ['8mm', '10mm', '12mm', '16mm', '20mm', '25mm', '32mm'],
                    grades: ['Fe 415', 'Fe 500', 'Fe 550', 'Fe 600'],
                    brands: ['TATA Tiscon', 'JSW', 'SAIL', 'Jindal'],
                },
            },
        }),
        prisma.material.upsert({
            where: { code: 'MAT-STL-002' },
            update: {},
            create: {
                name: 'Structural Steel',
                code: 'MAT-STL-002',
                category: 'Steel',
                unit: 'kg',
                description: 'I-beams, channels, angles',
                specifications: {
                    types: ['I-Beam', 'Channel', 'Angle', 'Flat'],
                    sizes: ['ISMC 100', 'ISMC 150', 'ISMB 200', 'ISMB 300'],
                },
            },
        }),
        // Aggregates
        prisma.material.upsert({
            where: { code: 'MAT-AGG-001' },
            update: {},
            create: {
                name: 'Coarse Aggregate',
                code: 'MAT-AGG-001',
                category: 'Aggregates',
                unit: 'cubic meters',
                description: 'Crushed stone aggregate',
                specifications: {
                    sizes: ['10mm', '20mm', '40mm'],
                    types: ['Granite', 'Basalt', 'Limestone'],
                },
            },
        }),
        prisma.material.upsert({
            where: { code: 'MAT-AGG-002' },
            update: {},
            create: {
                name: 'Fine Aggregate (Sand)',
                code: 'MAT-AGG-002',
                category: 'Aggregates',
                unit: 'cubic meters',
                description: 'River sand / M-sand',
                specifications: {
                    types: ['River Sand', 'M-Sand', 'Crushed Sand'],
                    zones: ['Zone I', 'Zone II', 'Zone III'],
                },
            },
        }),
        // Bricks & Blocks
        prisma.material.upsert({
            where: { code: 'MAT-BRK-001' },
            update: {},
            create: {
                name: 'Red Clay Bricks',
                code: 'MAT-BRK-001',
                category: 'Bricks',
                unit: 'pieces',
                description: 'Standard clay bricks',
                specifications: {
                    sizes: ['Standard (9x4x3 inch)', 'Modular (8x4x4 inch)'],
                    classes: ['Class A', 'Class B', 'Class C'],
                },
            },
        }),
        prisma.material.upsert({
            where: { code: 'MAT-BRK-002' },
            update: {},
            create: {
                name: 'AAC Blocks',
                code: 'MAT-BRK-002',
                category: 'Blocks',
                unit: 'pieces',
                description: 'Autoclaved Aerated Concrete Blocks',
                specifications: {
                    sizes: ['600x200x100mm', '600x200x150mm', '600x200x200mm'],
                    densities: ['400 kg/m³', '500 kg/m³', '600 kg/m³'],
                },
            },
        }),
        // Pipes
        prisma.material.upsert({
            where: { code: 'MAT-PIP-001' },
            update: {},
            create: {
                name: 'PVC Pipes',
                code: 'MAT-PIP-001',
                category: 'Plumbing',
                unit: 'meters',
                description: 'UPVC pipes for plumbing',
                specifications: {
                    diameters: ['20mm', '25mm', '32mm', '40mm', '50mm', '75mm', '110mm'],
                    pressureClass: ['Class 1', 'Class 2', 'Class 3', 'Class 4'],
                    colors: ['White', 'Grey'],
                },
            },
        }),
        prisma.material.upsert({
            where: { code: 'MAT-PIP-002' },
            update: {},
            create: {
                name: 'GI Pipes',
                code: 'MAT-PIP-002',
                category: 'Plumbing',
                unit: 'meters',
                description: 'Galvanized Iron pipes',
                specifications: {
                    diameters: ['15mm', '20mm', '25mm', '32mm', '40mm', '50mm'],
                    types: ['Light', 'Medium', 'Heavy'],
                },
            },
        }),
        // Electrical
        prisma.material.upsert({
            where: { code: 'MAT-ELE-001' },
            update: {},
            create: {
                name: 'Electrical Cables',
                code: 'MAT-ELE-001',
                category: 'Electrical',
                unit: 'meters',
                description: 'Copper electrical cables',
                specifications: {
                    sizes: ['1 sq mm', '1.5 sq mm', '2.5 sq mm', '4 sq mm', '6 sq mm'],
                    cores: ['Single Core', 'Multi Core'],
                    types: ['FR', 'FRLS', 'Armoured'],
                    colors: ['Red', 'Blue', 'Green', 'Yellow', 'Black'],
                },
            },
        }),
        prisma.material.upsert({
            where: { code: 'MAT-ELE-002' },
            update: {},
            create: {
                name: 'Conduit Pipes',
                code: 'MAT-ELE-002',
                category: 'Electrical',
                unit: 'meters',
                description: 'PVC conduit for wiring',
                specifications: {
                    diameters: ['20mm', '25mm', '32mm'],
                    types: ['Light', 'Medium', 'Heavy'],
                    colors: ['White', 'Grey', 'Orange'],
                },
            },
        }),
        // Paint
        prisma.material.upsert({
            where: { code: 'MAT-PNT-001' },
            update: {},
            create: {
                name: 'Exterior Emulsion Paint',
                code: 'MAT-PNT-001',
                category: 'Paints',
                unit: 'liters',
                description: 'Weather-resistant exterior paint',
                specifications: {
                    finishes: ['Matt', 'Silk', 'Sheen'],
                    colors: ['White', 'Off-White', 'Cream', 'Custom'],
                    brands: ['Asian Paints', 'Berger', 'Nerolac', 'Dulux'],
                },
            },
        }),
        prisma.material.upsert({
            where: { code: 'MAT-PNT-002' },
            update: {},
            create: {
                name: 'Interior Emulsion Paint',
                code: 'MAT-PNT-002',
                category: 'Paints',
                unit: 'liters',
                description: 'Interior wall paint',
                specifications: {
                    finishes: ['Matt', 'Silk', 'Satin', 'Gloss'],
                    colors: ['White', 'Off-White', 'Cream', 'Custom'],
                    brands: ['Asian Paints', 'Berger', 'Nerolac', 'Dulux'],
                },
            },
        }),
        // Waterproofing
        prisma.material.upsert({
            where: { code: 'MAT-WPF-001' },
            update: {},
            create: {
                name: 'Waterproofing Membrane',
                code: 'MAT-WPF-001',
                category: 'Waterproofing',
                unit: 'sq meters',
                description: 'APP/SBS waterproofing membrane',
                specifications: {
                    types: ['APP', 'SBS'],
                    thickness: ['3mm', '4mm'],
                    surfaces: ['Mineral', 'Aluminum', 'Sand'],
                },
            },
        }),
    ]);

    console.log(`✅ Created ${materials.length} materials`);

    console.log('🌱 Seed completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('   Site Engineers:');
    console.log('     - engineer1@example.com / password123 (Mumbai Metro)');
    console.log('     - engineer2@example.com / password123 (Delhi Highway)');
    console.log('     - engineer3@example.com / password123 (Bangalore IT Park)');
    console.log('   Purchase Team:');
    console.log('     - purchase1@example.com / password123');
    console.log('     - purchase2@example.com / password123');
    console.log('   Director:');
    console.log('     - director@example.com / password123');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
