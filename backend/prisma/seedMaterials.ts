/**
 * Materials Master Data Seed Script
 * 
 * Imports materials, item groups, and units of measure from embedded data
 * (originally extracted from sir list.xlsx) into the database.
 * 
 * Run with: npx ts-node prisma/seedMaterials.ts
 */

import { PrismaClient } from '@prisma/client';
import { SEED_MATERIALS } from './materialsData';

const prisma = new PrismaClient();

// =============================================================================
// UOM NORMALIZATION MAP
// Maps Excel values to standardized codes and display names
// =============================================================================
const UOM_NORMALIZATION: Record<string, { code: string; name: string }> = {
    // Weight
    'Kg': { code: 'KG', name: 'Kilogram' },
    'Gram': { code: 'GRAM', name: 'Gram' },
    'GRAMS': { code: 'GRAM', name: 'Gram' },

    // Length
    'MTR': { code: 'MTR', name: 'Meter' },
    'Meter': { code: 'MTR', name: 'Meter' },
    'RMT': { code: 'RMT', name: 'Running Meter' },
    'FT': { code: 'FT', name: 'Foot' },
    'Foot': { code: 'FT', name: 'Foot' },
    'RFT': { code: 'RFT', name: 'Running Foot' },

    // Area
    'SFT': { code: 'SFT', name: 'Square Foot' },
    'Square Foot': { code: 'SFT', name: 'Square Foot' },

    // Volume
    'LTR': { code: 'LTR', name: 'Litre' },
    'Litre': { code: 'LTR', name: 'Litre' },
    'Cubic Meter': { code: 'CBM', name: 'Cubic Meter' },

    // Count
    'Nos': { code: 'NOS', name: 'Numbers' },
    'PCS': { code: 'NOS', name: 'Numbers' },

    // Packaging
    'BAGS': { code: 'BAGS', name: 'Bags' },
    'Box': { code: 'BOX', name: 'Box' },
    'Set': { code: 'SET', name: 'Set' },
    'Pair': { code: 'PAIR', name: 'Pair' },
    'JODI': { code: 'PAIR', name: 'Pair' },
    'ROLL': { code: 'ROLL', name: 'Roll' },
    'SHEET': { code: 'SHEET', name: 'Sheet' },
    'BUNDLE': { code: 'BUNDLE', name: 'Bundle' },
    'PKT': { code: 'PKT', name: 'Packet' },
    'POCKET': { code: 'PKT', name: 'Packet' },
    'BOTTLE': { code: 'BOTTLE', name: 'Bottle' },
    'BUCKET': { code: 'BUCKET', name: 'Bucket' },
    'drum': { code: 'DRUM', name: 'Drum' },

    // Miscellaneous
    'PATTI': { code: 'PATTI', name: 'Patti' },
    'GONI': { code: 'GONI', name: 'Goni (Sack)' },
};

// =============================================================================
// ITEM GROUP (CATEGORY) NORMALIZATION MAP
// Consolidates similar/duplicate categories into a cleaner set
// =============================================================================
const ITEM_GROUP_NORMALIZATION: Record<string, string> = {
    // Hardware consolidation
    'HARDWARE': 'HARDWARE',
    'HARDWARE MATERIAL': 'HARDWARE',
    'HINGS': 'HARDWARE',
    'Screw': 'HARDWARE',

    // Electrical consolidation
    'ELECTRICAL': 'ELECTRICAL',
    'ELECTRICAL MATERIAL': 'ELECTRICAL',
    'LIGHTS': 'ELECTRICAL',
    'SWITCH BOARD': 'ELECTRICAL',

    // Plumbing consolidation
    'PLUMBING': 'PLUMBING',
    'PLUMBING MATERIAL': 'PLUMBING',
    'TANK': 'PLUMBING',

    // Painting consolidation
    'PAINT MATERIAL': 'PAINTING',
    'PAINTING MATERIAL': 'PAINTING',
    'PAINTS': 'PAINTING',
    'PAINTING CONTRACTER': 'PAINTING',

    // Gypsum consolidation
    'GYPSUM MATERIAL': 'GYPSUM',
    'GYPSUM POP': 'GYPSUM',
    'Gypsum Borad': 'GYPSUM',

    // Furnishing consolidation
    'FURNISHING': 'FURNISHING',
    'FURNISHING MATERIAL': 'FURNISHING',

    // Safety consolidation
    'SAFETY PRODUCTS': 'SAFETY',
    'SAFETY PRODUCTS SUPPLY': 'SAFETY',

    // Adhesive consolidation
    'ADHESIVE': 'ADHESIVE',
    'ADHESIVE MATERIAL': 'ADHESIVE',
    'Marble Adhesive': 'ADHESIVE',
    'Tile Adhesive': 'ADHESIVE',

    // Glass consolidation
    'GLASS': 'GLASS',
    'GLASS SUPPLY': 'GLASS',

    // Aluminium consolidation
    'ALUMINIUM': 'ALUMINIUM',
    'ALUMINIUM LADDER': 'ALUMINIUM',
    'Alluminium Pipe': 'ALUMINIUM',
    'SS AND ALUMINIUM': 'ALUMINIUM',

    // Tiles consolidation
    'CERAMIC TILES': 'TILES',
    'VITRIFIED TILES': 'TILES',

    // Marble consolidation
    'INDIAN MARBLE': 'MARBLE',
    'ITALIAN MARBLE': 'MARBLE',
    'COMPOSITE MARBLE': 'MARBLE',

    // Wood consolidation
    'WOOD': 'WOOD',
    'WOODEN MOULDING': 'WOOD',

    // Plywood consolidation
    'PLYWOOD': 'PLYWOOD',
    'BWP': 'PLYWOOD',
    'BWR': 'PLYWOOD',

    // Other consolidations
    'RAW MATERAIL': 'RAW MATERIAL',
    'WALLPAPER SUPPLY': 'WALLPAPER',
    'cleaning': 'CLEANING',
    'Timex': 'OTHER',
    'Tarpin': 'OTHER',

    // Keep these as-is
    'METAL': 'METAL',
    'METAL MESH': 'METAL',
    'C-Channel': 'METAL',
    'CIVIL': 'CIVIL',
    'Cement': 'CEMENT',
    'CARPET': 'CARPET',
    'CEILING': 'CEILING',
    'FURNITURE': 'FURNITURE',
    'FABRICS': 'FABRICS',
    'FLOORING': 'FLOORING',
    'DOORS': 'DOORS',
    'ACRYLIC': 'ACRYLIC',
    'ACOUSTICS': 'ACOUSTICS',
    'CARPENTER': 'CARPENTER',
    'CHEMICAL': 'CHEMICAL',
    'GRANITE': 'GRANITE',
    'HILEX BOARD': 'HILEX BOARD',
    'INSULATION': 'INSULATION',
    'LAMINATE': 'LAMINATE',
    'MAGVEE PANELS': 'MAGVEE PANELS',
    'MIRROR': 'MIRROR',
    'PVC PATTI': 'PVC',
    'SKIRTING': 'SKIRTING',
    'STATIONARY': 'STATIONARY',
    'WATERPROOFING': 'WATERPROOFING',
    'HVAC': 'HVAC',
    'FREM': 'FREM',
    'SANITARY WARE': 'SANITARY',
    'OTHER': 'OTHER',
    'MISC ITEMS': 'OTHER',
};

interface SeedMaterial {
    name: string;
    group: string;
    uom: string;
}

/**
 * Get all unique normalized UOMs from the data
 */
function getUniqueUOMs(materials: SeedMaterial[]): Map<string, { code: string; name: string }> {
    const uomMap = new Map<string, { code: string; name: string }>();

    for (const mat of materials) {
        const normalized = UOM_NORMALIZATION[mat.uom];
        if (normalized) {
            uomMap.set(normalized.code, normalized);
        } else {
            const code = mat.uom.toUpperCase().replace(/[^A-Z0-9]/g, '_');
            uomMap.set(code, { code, name: mat.uom });
        }
    }

    return uomMap;
}

/**
 * Get all unique normalized Item Groups from the data
 */
function getUniqueItemGroups(materials: SeedMaterial[]): Set<string> {
    const groupSet = new Set<string>();

    for (const mat of materials) {
        const normalized = ITEM_GROUP_NORMALIZATION[mat.group] || mat.group.toUpperCase();
        groupSet.add(normalized);
    }

    return groupSet;
}

/**
 * Seed the database with materials master data
 */
async function seedMaterials(): Promise<void> {
    console.log('\n🌱 Starting Materials Master Data Seed...\n');
    console.log(`📊 Loading ${SEED_MATERIALS.length} materials from embedded data`);

    // Step 1: Extract unique UOMs and Item Groups
    const uniqueUOMs = getUniqueUOMs(SEED_MATERIALS);
    const uniqueItemGroups = getUniqueItemGroups(SEED_MATERIALS);

    console.log(`\n📦 Found ${uniqueUOMs.size} unique UOMs`);
    console.log(`📁 Found ${uniqueItemGroups.size} unique Item Groups`);

    // Step 2: Create UnitOfMeasure records
    console.log('\n📐 Creating Units of Measure...');
    const uomIdMap = new Map<string, string>();

    for (const entry of Array.from(uniqueUOMs.entries())) {
        const [code, uom] = entry;
        const created = await prisma.unitOfMeasure.upsert({
            where: { code },
            update: { name: uom.name },
            create: { code, name: uom.name },
        });
        uomIdMap.set(code, created.id);
    }
    console.log(`✅ Created/updated ${uomIdMap.size} units of measure`);

    // Step 3: Create ItemGroup records
    console.log('\n📁 Creating Item Groups...');
    const groupIdMap = new Map<string, string>();

    for (const groupName of Array.from(uniqueItemGroups)) {
        const created = await prisma.itemGroup.upsert({
            where: { name: groupName },
            update: {},
            create: { name: groupName },
        });
        groupIdMap.set(groupName, created.id);
    }
    console.log(`✅ Created/updated ${groupIdMap.size} item groups`);

    // Step 4: Create Material records
    console.log('\n🏗️  Creating Materials...');
    let created = 0;
    let skipped = 0;

    for (let i = 0; i < SEED_MATERIALS.length; i++) {
        const mat = SEED_MATERIALS[i];
        const code = `MAT-${String(i + 1).padStart(5, '0')}`;

        // Get normalized group and UOM
        const normalizedGroup = ITEM_GROUP_NORMALIZATION[mat.group] || mat.group.toUpperCase();
        const normalizedUOM = UOM_NORMALIZATION[mat.uom];
        const uomCode = normalizedUOM ? normalizedUOM.code : mat.uom.toUpperCase().replace(/[^A-Z0-9]/g, '_');

        const itemGroupId = groupIdMap.get(normalizedGroup);
        const unitId = uomIdMap.get(uomCode);

        if (!itemGroupId || !unitId) {
            skipped++;
            continue;
        }

        try {
            await prisma.material.upsert({
                where: { code },
                update: {
                    name: mat.name,
                    itemGroupId,
                    unitId,
                    isSystemData: true,
                },
                create: {
                    name: mat.name,
                    code,
                    itemGroupId,
                    unitId,
                    isActive: true,
                    isSystemData: true,
                },
            });
            created++;

            if ((i + 1) % 500 === 0) {
                console.log(`   Progress: ${i + 1}/${SEED_MATERIALS.length} materials...`);
            }
        } catch {
            skipped++;
        }
    }

    console.log(`\n✅ Created/updated ${created} materials`);
    if (skipped > 0) {
        console.log(`⚠️  Skipped ${skipped} materials`);
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 SEED SUMMARY');
    console.log('='.repeat(60));
    console.log(`   Units of Measure: ${uomIdMap.size}`);
    console.log(`   Item Groups:      ${groupIdMap.size}`);
    console.log(`   Materials:        ${created}`);
    console.log('='.repeat(60));
    console.log('\n🎉 Materials Master Data Seed completed successfully!\n');
}

// Run the seed
seedMaterials()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
