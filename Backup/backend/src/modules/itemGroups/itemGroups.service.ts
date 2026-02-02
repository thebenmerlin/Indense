import { prisma } from '../../config/database';
import { NotFoundError } from '../../utils/errors';

export interface ItemGroupResponse {
    id: string;
    name: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count?: {
        materials: number;
    };
}

class ItemGroupsService {
    /**
     * Get all item groups with optional filtering
     */
    async findAll(params: {
        search?: string;
        isActive?: boolean;
        includeCounts?: boolean;
    }): Promise<ItemGroupResponse[]> {
        const { search, isActive, includeCounts } = params;

        const where: Record<string, unknown> = {};
        if (typeof isActive === 'boolean') where.isActive = isActive;
        if (search) {
            where.name = { contains: search, mode: 'insensitive' };
        }

        const itemGroups = await prisma.itemGroup.findMany({
            where,
            orderBy: { name: 'asc' },
            include: includeCounts ? {
                _count: {
                    select: { materials: true },
                },
            } : undefined,
        });

        return itemGroups as ItemGroupResponse[];
    }

    /**
     * Get a single item group by ID
     */
    async findById(id: string): Promise<ItemGroupResponse> {
        const itemGroup = await prisma.itemGroup.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { materials: true },
                },
            },
        });
        if (!itemGroup) throw new NotFoundError('Item group not found');
        return itemGroup as ItemGroupResponse;
    }

    /**
     * Create a new item group
     */
    async create(data: { name: string }): Promise<ItemGroupResponse> {
        const itemGroup = await prisma.itemGroup.create({
            data: {
                name: data.name.toUpperCase().trim(),
            },
        });
        return itemGroup as ItemGroupResponse;
    }

    /**
     * Update an item group
     */
    async update(id: string, data: { name?: string; isActive?: boolean }): Promise<ItemGroupResponse> {
        const updateData: Record<string, unknown> = {};
        if (data.name) updateData.name = data.name.toUpperCase().trim();
        if (typeof data.isActive === 'boolean') updateData.isActive = data.isActive;

        const itemGroup = await prisma.itemGroup.update({
            where: { id },
            data: updateData,
        });
        return itemGroup as ItemGroupResponse;
    }

    /**
     * Get item group names as simple string array (for dropdowns)
     */
    async getNames(): Promise<string[]> {
        const itemGroups = await prisma.itemGroup.findMany({
            where: { isActive: true },
            select: { name: true },
            orderBy: { name: 'asc' },
        });
        return itemGroups.map((ig: { name: string }) => ig.name);
    }
}

export const itemGroupsService = new ItemGroupsService();
export default itemGroupsService;
