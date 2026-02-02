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

    async create(data: CreateMaterialDto): Promise<MaterialResponse> {
        const material = await prisma.material.create({
            data: {
                name: data.name,
                code: data.code,
                itemGroupId: data.itemGroupId,
                unitId: data.unitId,
                description: data.description,
                specifications: data.specifications as object || undefined,
                isSystemData: false,  // User-created materials are not system data
            },
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

