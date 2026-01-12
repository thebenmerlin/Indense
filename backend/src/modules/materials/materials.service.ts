import { prisma } from '../../config/database';
import { NotFoundError } from '../../utils/errors';
import { MaterialResponse, PaginatedResult, CreateMaterialDto } from '../../types';
import { parsePaginationParams, buildPaginatedResult } from '../../utils/pagination';

class MaterialsService {
    async findAll(params: {
        page?: number;
        limit?: number;
        category?: string;
        search?: string;
        isActive?: boolean;
    }): Promise<PaginatedResult<MaterialResponse>> {
        const { page, limit, category, search, isActive } = params;
        const pagination = parsePaginationParams({ page, limit });

        const where: Record<string, unknown> = {};
        if (category) where.category = category;
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
            }),
            prisma.material.count({ where }),
        ]);

        return buildPaginatedResult(materials as MaterialResponse[], total, pagination);
    }

    async findById(id: string): Promise<MaterialResponse> {
        const material = await prisma.material.findUnique({ where: { id } });
        if (!material) throw new NotFoundError('Material not found');
        return material as MaterialResponse;
    }

    async getCategories(): Promise<string[]> {
        const categories = await prisma.material.findMany({
            distinct: ['category'],
            select: { category: true },
            orderBy: { category: 'asc' },
        });
        return categories.map((c) => c.category);
    }

    async create(data: CreateMaterialDto): Promise<MaterialResponse> {
        const material = await prisma.material.create({ data: data as never });
        return material as MaterialResponse;
    }
}

export const materialsService = new MaterialsService();
export default materialsService;
