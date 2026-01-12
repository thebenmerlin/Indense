import { prisma } from '../../config/database';
import { NotFoundError } from '../../utils/errors';
import { CreateSiteDto, UpdateSiteDto, SiteResponse, PaginatedResult } from '../../types';
import { parsePaginationParams, buildPaginatedResult } from '../../utils/pagination';

class SitesService {
    async findAll(params: {
        page?: number;
        limit?: number;
        isActive?: boolean;
        search?: string;
    }): Promise<PaginatedResult<SiteResponse>> {
        const { page, limit, isActive, search } = params;
        const pagination = parsePaginationParams({ page, limit });

        const where: Record<string, unknown> = {};
        if (typeof isActive === 'boolean') where.isActive = isActive;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
                { city: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [sites, total] = await Promise.all([
            prisma.site.findMany({
                where,
                skip: pagination.skip,
                take: pagination.take,
                orderBy: { name: 'asc' },
            }),
            prisma.site.count({ where }),
        ]);

        return buildPaginatedResult(sites as SiteResponse[], total, pagination);
    }

    async findById(id: string): Promise<SiteResponse> {
        const site = await prisma.site.findUnique({ where: { id } });
        if (!site) {
            throw new NotFoundError('Site not found');
        }
        return site as SiteResponse;
    }

    async create(data: CreateSiteDto): Promise<SiteResponse> {
        const site = await prisma.site.create({ data });
        return site as SiteResponse;
    }

    async update(id: string, data: UpdateSiteDto): Promise<SiteResponse> {
        const existing = await prisma.site.findUnique({ where: { id } });
        if (!existing) {
            throw new NotFoundError('Site not found');
        }

        const site = await prisma.site.update({ where: { id }, data });
        return site as SiteResponse;
    }
}

export const sitesService = new SitesService();
export default sitesService;
