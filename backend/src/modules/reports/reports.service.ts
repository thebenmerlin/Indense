import ExcelJS from 'exceljs';
import { prisma } from '../../config/database';
import { MonthlyReportParams, MonthlyReportData } from '../../types';

class ReportsService {
    async getMonthlyReport(params: MonthlyReportParams): Promise<MonthlyReportData> {
        const { year, month, siteId } = params;
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const where: Record<string, unknown> = {
            createdAt: { gte: startDate, lte: endDate },
        };
        if (siteId) where.siteId = siteId;

        const indents = await prisma.indent.findMany({
            where,
            include: {
                site: true,
                items: true,
                order: true,
            },
        });

        const totalOrders = indents.filter((i) => i.order).length;
        const totalValue = indents.reduce((sum, i) => sum + (i.order?.grandTotal || 0), 0);
        const approved = indents.filter((i) => i.status !== 'REJECTED' && i.status !== 'SUBMITTED').length;
        const rejected = indents.filter((i) => i.status === 'REJECTED').length;

        let siteName: string | undefined;
        if (siteId) {
            const site = await prisma.site.findUnique({ where: { id: siteId } });
            siteName = site?.name;
        }

        return {
            period: `${year}-${String(month).padStart(2, '0')}`,
            siteId,
            siteName,
            summary: {
                totalIndents: indents.length,
                totalApproved: approved,
                totalRejected: rejected,
                totalOrders,
                totalValue,
            },
            indents: indents.map((indent) => ({
                indentNumber: indent.indentNumber,
                status: indent.status,
                createdAt: indent.createdAt,
                itemCount: indent.items.length,
                totalValue: indent.order?.grandTotal ?? undefined,
            })),
        };
    }

    async generateExcel(params: MonthlyReportParams): Promise<Buffer> {
        const data = await this.getMonthlyReport(params);

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Indense';
        workbook.created = new Date();

        // Summary Sheet
        const summarySheet = workbook.addWorksheet('Summary');
        summarySheet.columns = [
            { header: 'Metric', key: 'metric', width: 25 },
            { header: 'Value', key: 'value', width: 20 },
        ];
        summarySheet.addRow({ metric: 'Report Period', value: data.period });
        summarySheet.addRow({ metric: 'Site', value: data.siteName || 'All Sites' });
        summarySheet.addRow({ metric: 'Total Indents', value: data.summary.totalIndents });
        summarySheet.addRow({ metric: 'Approved Indents', value: data.summary.totalApproved });
        summarySheet.addRow({ metric: 'Rejected Indents', value: data.summary.totalRejected });
        summarySheet.addRow({ metric: 'Total Orders', value: data.summary.totalOrders });
        summarySheet.addRow({ metric: 'Total Value', value: data.summary.totalValue });

        // Indents Sheet
        const indentsSheet = workbook.addWorksheet('Indents');
        indentsSheet.columns = [
            { header: 'Indent Number', key: 'indentNumber', width: 25 },
            { header: 'Status', key: 'status', width: 20 },
            { header: 'Created At', key: 'createdAt', width: 20 },
            { header: 'Items', key: 'itemCount', width: 10 },
            { header: 'Total Value', key: 'totalValue', width: 15 },
        ];

        for (const indent of data.indents) {
            indentsSheet.addRow({
                indentNumber: indent.indentNumber,
                status: indent.status,
                createdAt: indent.createdAt.toISOString().split('T')[0],
                itemCount: indent.itemCount,
                totalValue: indent.totalValue || '-',
            });
        }

        // Style headers
        [summarySheet, indentsSheet].forEach((sheet) => {
            sheet.getRow(1).font = { bold: true };
            sheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4472C4' },
            };
            sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        });

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }

    async getSiteStats(siteId?: string) {
        const where = siteId ? { siteId } : {};

        const [
            totalIndents,
            pendingApproval,
            inProgress,
            completed,
        ] = await Promise.all([
            prisma.indent.count({ where }),
            prisma.indent.count({ where: { ...where, status: { in: ['SUBMITTED', 'PURCHASE_APPROVED'] } } }),
            prisma.indent.count({ where: { ...where, status: { in: ['DIRECTOR_APPROVED', 'ORDER_PLACED', 'PARTIALLY_RECEIVED'] } } }),
            prisma.indent.count({ where: { ...where, status: { in: ['FULLY_RECEIVED', 'CLOSED'] } } }),
        ]);

        return { totalIndents, pendingApproval, inProgress, completed };
    }
}

export const reportsService = new ReportsService();
export default reportsService;
