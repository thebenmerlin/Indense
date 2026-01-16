import { prisma } from '../../config/database';
import { NotFoundError } from '../../utils/errors';

export interface UnitOfMeasureResponse {
    id: string;
    code: string;
    name: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count?: {
        materials: number;
    };
}

class UOMService {
    /**
     * Get all units of measure with optional filtering
     */
    async findAll(params: {
        search?: string;
        isActive?: boolean;
        includeCounts?: boolean;
    }): Promise<UnitOfMeasureResponse[]> {
        const { search, isActive, includeCounts } = params;

        const where: Record<string, unknown> = {};
        if (typeof isActive === 'boolean') where.isActive = isActive;
        if (search) {
            where.OR = [
                { code: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } },
            ];
        }

        const units = await prisma.unitOfMeasure.findMany({
            where,
            orderBy: { name: 'asc' },
            include: includeCounts ? {
                _count: {
                    select: { materials: true },
                },
            } : undefined,
        });

        return units as UnitOfMeasureResponse[];
    }

    /**
     * Get a single unit of measure by ID
     */
    async findById(id: string): Promise<UnitOfMeasureResponse> {
        const unit = await prisma.unitOfMeasure.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { materials: true },
                },
            },
        });
        if (!unit) throw new NotFoundError('Unit of measure not found');
        return unit as UnitOfMeasureResponse;
    }

    /**
     * Create a new unit of measure
     */
    async create(data: { code: string; name: string }): Promise<UnitOfMeasureResponse> {
        const unit = await prisma.unitOfMeasure.create({
            data: {
                code: data.code.toUpperCase().trim(),
                name: data.name.trim(),
            },
        });
        return unit as UnitOfMeasureResponse;
    }

    /**
     * Update a unit of measure
     */
    async update(id: string, data: { code?: string; name?: string; isActive?: boolean }): Promise<UnitOfMeasureResponse> {
        const updateData: Record<string, unknown> = {};
        if (data.code) updateData.code = data.code.toUpperCase().trim();
        if (data.name) updateData.name = data.name.trim();
        if (typeof data.isActive === 'boolean') updateData.isActive = data.isActive;

        const unit = await prisma.unitOfMeasure.update({
            where: { id },
            data: updateData,
        });
        return unit as UnitOfMeasureResponse;
    }

    /**
     * Get UOMs as code-name pairs (for dropdowns)
     */
    async getForDropdown(): Promise<Array<{ code: string; name: string }>> {
        const units = await prisma.unitOfMeasure.findMany({
            where: { isActive: true },
            select: { code: true, name: true },
            orderBy: { name: 'asc' },
        });
        return units;
    }
}

export const uomService = new UOMService();
export default uomService;
