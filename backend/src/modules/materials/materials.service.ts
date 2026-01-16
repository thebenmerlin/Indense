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

