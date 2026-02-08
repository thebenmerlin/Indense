import { prisma } from '../../config/database';
import { NotFoundError } from '../../utils/errors';
import { MaterialResponse, PaginatedResult, CreateMaterialDto } from '../../types';
import { parsePaginationParams, buildPaginatedResult } from '../../utils/pagination';

class MaterialsService {
    async findAll(params: {
        page?: number;
        limit?: number;
        itemGroupId?: string;  // Filter by item group (category)
        search?: string;
        isActive?: boolean;
    }): Promise<PaginatedResult<MaterialResponse>> {
        const { page, limit, itemGroupId, search, isActive } = params;
        const pagination = parsePaginationParams({ page, limit });

        const where: Record<string, unknown> = {};
        if (itemGroupId) where.itemGroupId = itemGroupId;
        if (typeof isActive === 'boolean') where.isActive = isActive;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [materials, total] = await Promise.all([
            prisma.material.findMany({
                where,
                skip: pagination.skip,
                take: pagination.take,
                orderBy: { name: 'asc' },
                include: {
                    itemGroup: true,
                    unit: true,
                },
            }),
            prisma.material.count({ where }),
        ]);

        return buildPaginatedResult(materials as unknown as MaterialResponse[], total, pagination);
    }

    async findById(id: string): Promise<MaterialResponse> {
        const material = await prisma.material.findUnique({
            where: { id },
            include: {
                itemGroup: true,
                unit: true,
            },
        });
        if (!material) throw new NotFoundError('Material not found');
        return material as unknown as MaterialResponse;
    }

    /**
     * Get all item groups (categories) - for dropdown
     */
    async getCategories(): Promise<Array<{ id: string; name: string }>> {
        const itemGroups = await prisma.itemGroup.findMany({
            where: { isActive: true },
            select: { id: true, name: true },
            orderBy: { name: 'asc' },
        });
        return itemGroups;
    }

    /**
     * Get all units of measure - for dropdown
     */
    async getUnits(): Promise<Array<{ id: string; code: string; name: string }>> {
        const units = await prisma.unitOfMeasure.findMany({
            where: { isActive: true },
            select: { id: true, code: true, name: true },
            orderBy: { name: 'asc' },
        });
        return units;
    }

    /**
     * Fast autocomplete search for material names
     * Returns minimal data for quick typeahead suggestions
     * @param query - Search query string (min 2 characters)
     * @param itemGroupId - Optional filter by category
     * @param limit - Max results to return (default 20)
     */
    async searchAutocomplete(params: {
        query: string;
        itemGroupId?: string;
        limit?: number;
    }): Promise<Array<{
        id: string;
        name: string;
        code: string;
        unitCode: string;
        unitName: string;
        categoryName: string;
    }>> {
        const { query, itemGroupId, limit = 20 } = params;

        // Require minimum 2 characters for search
        if (!query || query.length < 2) {
            return [];
        }

        const where: Record<string, unknown> = {
            isActive: true,
            name: { contains: query, mode: 'insensitive' },
        };

        if (itemGroupId) {
            where.itemGroupId = itemGroupId;
        }

        const materials = await prisma.material.findMany({
            where,
            select: {
                id: true,
                name: true,
                code: true,
                itemGroup: { select: { name: true } },
                unit: { select: { code: true, name: true } },
            },
            take: Math.min(limit, 50), // Cap at 50 for performance
            orderBy: { name: 'asc' },
        });

        // Transform to flat response for frontend efficiency
        return materials.map((m) => ({
            id: m.id,
            name: m.name,
            code: m.code,
            unitCode: (m as { unit?: { code: string } }).unit?.code || '',
            unitName: (m as { unit?: { name: string } }).unit?.name || '',
            categoryName: (m as { itemGroup?: { name: string } }).itemGroup?.name || '',
        }));
    }

    /**
     * Create a new material with automatic category/unit creation
     * - If itemGroupId/unitId are provided, use them directly
     * - If categoryName/unitName are provided, find existing or create new
     */
    async create(data: CreateMaterialDto): Promise<MaterialResponse> {
        let finalItemGroupId = data.itemGroupId;
        let finalUnitId = data.unitId;

        // Handle category - find or create by name if ID not provided
        if (!finalItemGroupId && data.categoryName) {
            const categoryName = data.categoryName.trim();

            // Try to find existing category (case-insensitive)
            let category = await prisma.itemGroup.findFirst({
                where: { name: { equals: categoryName, mode: 'insensitive' } },
            });

            // Create new category if not found
            if (!category) {
                category = await prisma.itemGroup.create({
                    data: {
                        name: categoryName,
                        isActive: true,
                    },
                });
            }
            finalItemGroupId = category.id;
        }

        // Handle unit - find or create by name if ID not provided
        if (!finalUnitId && data.unitName) {
            let unitName = data.unitName.trim();
            let unitCode = data.unitCode?.trim() || '';

            // Parse "Name (Code)" format if provided
            const match = unitName.match(/^(.+?)\s*\(([^)]+)\)$/);
            if (match) {
                unitName = match[1].trim();
                unitCode = match[2].trim();
            }

            // Try to find existing unit (case-insensitive by name or code)
            let unit = await prisma.unitOfMeasure.findFirst({
                where: {
                    OR: [
                        { name: { equals: unitName, mode: 'insensitive' } },
                        { code: { equals: unitCode || unitName, mode: 'insensitive' } },
                    ],
                },
            });

            // Create new unit if not found
            if (!unit) {
                const finalCode = unitCode || unitName.toUpperCase().replace(/\s+/g, '').substring(0, 10);
                unit = await prisma.unitOfMeasure.create({
                    data: {
                        name: unitName,
                        code: finalCode,
                        isActive: true,
                    },
                });
            }
            finalUnitId = unit.id;
        }

        // Validate we have required IDs
        if (!finalItemGroupId) {
            throw new Error('Category is required - provide itemGroupId or categoryName');
        }
        if (!finalUnitId) {
            throw new Error('Unit is required - provide unitId or unitName');
        }

        // Generate code if not provided
        const materialCode = data.code || `MAT-${Date.now().toString(36).toUpperCase()}`;

        // Build specifications object from individual fields
        const specifications: Record<string, string> = {};
        if (data.specification) specifications.specification = data.specification;
        if (data.dimensions) specifications.dimensions = data.dimensions;
        if (data.color) specifications.color = data.color;

        const material = await prisma.material.create({
            data: {
                name: data.name,
                code: materialCode,
                itemGroupId: finalItemGroupId,
                unitId: finalUnitId,
                description: data.description,
                specifications: Object.keys(specifications).length > 0
                    ? specifications
                    : (data.specifications as object || undefined),
                isSystemData: false,
            },
            include: {
                itemGroup: true,
                unit: true,
            },
        });
        return material as unknown as MaterialResponse;
    }

    /**
     * Update an existing material
     */
    async update(id: string, data: {
        name?: string;
        code?: string;
        specification?: string;
        dimensions?: string;
        color?: string;
        itemGroupId?: string;
        unitId?: string;
    }): Promise<MaterialResponse> {
        // Check if material exists
        const existing = await prisma.material.findUnique({ where: { id } });
        if (!existing) throw new NotFoundError('Material not found');

        // Build update data
        const updateData: Record<string, unknown> = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.code !== undefined) updateData.code = data.code;
        if (data.itemGroupId !== undefined) updateData.itemGroupId = data.itemGroupId;
        if (data.unitId !== undefined) updateData.unitId = data.unitId;

        // Handle specifications - store spec, dimensions, color in specifications field
        const specs: Record<string, string> = {};
        if (data.specification !== undefined) specs.specification = data.specification;
        if (data.dimensions !== undefined) specs.dimensions = data.dimensions;
        if (data.color !== undefined) specs.color = data.color;
        if (Object.keys(specs).length > 0) {
            updateData.specifications = specs;
        }

        const material = await prisma.material.update({
            where: { id },
            data: updateData,
            include: {
                itemGroup: true,
                unit: true,
            },
        });
        return material as unknown as MaterialResponse;
    }

}

export const materialsService = new MaterialsService();
export default materialsService;

