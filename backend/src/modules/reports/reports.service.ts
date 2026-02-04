import ExcelJS from 'exceljs';
import { prisma } from '../../config/database';
import { MonthlyReportParams, MonthlyReportData } from '../../types';

interface DateRangeFilter {
    fromDate?: Date;
    toDate?: Date;
    siteId?: string;
}

interface FinancialReportRow {
    materialName: string;
    materialCode: string;
    specification: string | null;
    unit: string;
    rate: number;
    quantity: number;
    cost: number;
    indentNumber: string;
    siteName: string;
    vendorName: string;
    purchaseDate: Date;
}

interface MaterialReportRow {
    materialName: string;
    materialCode: string;
    specification: string | null;
    dimension: string | null;
    color: string | null;
    category: string;
    unit: string;
    totalRequested: number;
    totalOrdered: number;
}

interface VendorReportRow {
    vendorName: string;
    vendorAddress: string | null;
    vendorGstNo: string | null;
    vendorContactPerson: string | null;
    vendorContactPhone: string | null;
    vendorNatureOfBusiness: string | null;
    totalOrders: number;
    totalValue: number;
    materialsSupplied: string[];
}

interface DamageReportRow {
    damageId: string;
    materialName: string;
    indentNumber: string;
    siteName: string;
    reportedBy: string;
    reportedAt: Date;
    damagedQty: number | null;
    severity: string;
    status: string;
    isReordered: boolean;
    reorderExpectedDate: Date | null;
}

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

    /**
     * Get dashboard summary for PT/Director
     */
    async getDashboardSummary(filters: DateRangeFilter) {
        const dateWhere: Record<string, unknown> = {};
        if (filters.fromDate || filters.toDate) {
            dateWhere.createdAt = {};
            if (filters.fromDate) (dateWhere.createdAt as Record<string, Date>).gte = filters.fromDate;
            if (filters.toDate) (dateWhere.createdAt as Record<string, Date>).lte = filters.toDate;
        }

        const siteWhere = filters.siteId ? { siteId: filters.siteId } : {};
        const baseWhere = { ...dateWhere, ...siteWhere };

        const [
            totalIndents,
            pendingIndents,
            closedSites,
            totalExpenseResult,
        ] = await Promise.all([
            prisma.indent.count({ where: baseWhere }),
            prisma.indent.count({ where: { ...baseWhere, status: 'SUBMITTED' } }),
            prisma.site.count({ where: { isActive: false } }),
            prisma.order.aggregate({
                where: {
                    indent: baseWhere,
                    isPurchased: true,
                },
                _sum: { grandTotal: true },
            }),
        ]);

        return {
            totalIndents,
            pendingIndents,
            closedSites,
            totalExpense: totalExpenseResult._sum.grandTotal || 0,
        };
    }

    /**
     * Financial Report - Material purchases with cost breakdown
     */
    async getFinancialReport(filters: DateRangeFilter): Promise<FinancialReportRow[]> {
        const dateWhere: Record<string, unknown> = {};
        if (filters.fromDate || filters.toDate) {
            dateWhere.purchasedAt = {};
            if (filters.fromDate) (dateWhere.purchasedAt as Record<string, Date>).gte = filters.fromDate;
            if (filters.toDate) (dateWhere.purchasedAt as Record<string, Date>).lte = filters.toDate;
        }

        const siteWhere = filters.siteId ? { indent: { siteId: filters.siteId } } : {};

        const orders = await prisma.order.findMany({
            where: {
                isPurchased: true,
                ...dateWhere,
                ...siteWhere,
            },
            include: {
                indent: {
                    include: {
                        site: { select: { name: true } },
                    },
                },
                orderItems: true,
            },
            orderBy: { purchasedAt: 'desc' },
        });

        const rows: FinancialReportRow[] = [];
        for (const order of orders) {
            for (const item of order.orderItems) {
                rows.push({
                    materialName: item.materialName || 'Unknown',
                    materialCode: item.materialCode || '',
                    specification: item.specifications ? JSON.stringify(item.specifications) : null,
                    unit: '',  // Unit info not stored in OrderItem, use specs if available
                    rate: item.unitPrice || 0,
                    quantity: item.quantity,
                    cost: item.totalPrice || (item.unitPrice || 0) * item.quantity,
                    indentNumber: order.indent.indentNumber,
                    siteName: order.indent.site.name,
                    vendorName: item.vendorName || order.vendorName,
                    purchaseDate: order.purchasedAt || order.createdAt,
                });
            }
        }

        return rows;
    }

    async generateFinancialReportExcel(filters: DateRangeFilter): Promise<Buffer> {
        const data = await this.getFinancialReport(filters);

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Indense';
        workbook.created = new Date();

        const sheet = workbook.addWorksheet('Financial Report');
        sheet.columns = [
            { header: 'Material Name', key: 'materialName', width: 30 },
            { header: 'Material Code', key: 'materialCode', width: 15 },
            { header: 'Specification', key: 'specification', width: 25 },
            { header: 'Unit', key: 'unit', width: 10 },
            { header: 'Rate', key: 'rate', width: 12 },
            { header: 'Quantity', key: 'quantity', width: 12 },
            { header: 'Cost', key: 'cost', width: 15 },
            { header: 'Indent No.', key: 'indentNumber', width: 20 },
            { header: 'Site', key: 'siteName', width: 20 },
            { header: 'Vendor', key: 'vendorName', width: 25 },
            { header: 'Purchase Date', key: 'purchaseDate', width: 15 },
        ];

        // Calculate total
        let totalCost = 0;
        for (const row of data) {
            sheet.addRow({
                ...row,
                purchaseDate: row.purchaseDate.toISOString().split('T')[0],
            });
            totalCost += row.cost;
        }

        // Add total row
        sheet.addRow({});
        sheet.addRow({
            materialName: 'TOTAL',
            cost: totalCost,
        });

        this.styleWorksheet(sheet);

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }

    /**
     * Material Report - Material usage summary
     */
    async getMaterialReport(filters: DateRangeFilter): Promise<MaterialReportRow[]> {
        const dateWhere: Record<string, unknown> = {};
        if (filters.fromDate || filters.toDate) {
            dateWhere.createdAt = {};
            if (filters.fromDate) (dateWhere.createdAt as Record<string, Date>).gte = filters.fromDate;
            if (filters.toDate) (dateWhere.createdAt as Record<string, Date>).lte = filters.toDate;
        }

        const siteWhere = filters.siteId ? { indent: { siteId: filters.siteId } } : {};

        // Group indent items by material
        const indentItems = await prisma.indentItem.findMany({
            where: {
                indent: {
                    ...dateWhere,
                    ...(filters.siteId ? { siteId: filters.siteId } : {}),
                },
            },
            include: {
                material: {
                    include: {
                        itemGroup: { select: { name: true } },
                        unit: { select: { name: true, code: true } },
                    },
                },
            },
        });

        // Get ordered quantities
        const orderItems = await prisma.orderItem.findMany({
            where: {
                order: {
                    ...dateWhere,
                    ...siteWhere,
                },
            },
        });

        // Group by material
        const materialMap = new Map<string, MaterialReportRow>();
        
        for (const item of indentItems) {
            const mat = item.material;
            const key = mat.id;
            const existing = materialMap.get(key);
            const specs = mat.specifications as Record<string, unknown> || {};
            
            if (existing) {
                existing.totalRequested += item.requestedQty;
            } else {
                materialMap.set(key, {
                    materialName: mat.name,
                    materialCode: mat.code,
                    specification: specs ? JSON.stringify(specs) : null,
                    dimension: specs?.dimensions ? String(specs.dimensions) : null,
                    color: specs?.color ? String(specs.color) : null,
                    category: mat.itemGroup?.name || 'Uncategorized',
                    unit: mat.unit?.code || mat.unit?.name || '',
                    totalRequested: item.requestedQty,
                    totalOrdered: 0,
                });
            }
        }

        // For ordered quantities, we need to match by materialCode since OrderItem doesn't link to Material
        for (const item of orderItems) {
            // Find material in map by code
            for (const [, value] of materialMap) {
                if (value.materialCode === item.materialCode) {
                    value.totalOrdered += item.quantity;
                    break;
                }
            }
        }

        return Array.from(materialMap.values());
    }

    async generateMaterialReportExcel(filters: DateRangeFilter): Promise<Buffer> {
        const data = await this.getMaterialReport(filters);

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Indense';
        workbook.created = new Date();

        const sheet = workbook.addWorksheet('Material Report');
        sheet.columns = [
            { header: 'Material Name', key: 'materialName', width: 30 },
            { header: 'Material Code', key: 'materialCode', width: 15 },
            { header: 'Specification', key: 'specification', width: 25 },
            { header: 'Dimension', key: 'dimension', width: 15 },
            { header: 'Color', key: 'color', width: 15 },
            { header: 'Category', key: 'category', width: 20 },
            { header: 'Unit', key: 'unit', width: 10 },
            { header: 'Total Requested', key: 'totalRequested', width: 15 },
            { header: 'Total Ordered', key: 'totalOrdered', width: 15 },
        ];

        for (const row of data) {
            sheet.addRow(row);
        }

        this.styleWorksheet(sheet);

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }

    /**
     * Export ALL materials (master list)
     */
    async generateAllMaterialsExcel(): Promise<Buffer> {
        const materials = await prisma.material.findMany({
            where: { isActive: true },
            include: {
                itemGroup: { select: { name: true } },
                unit: { select: { name: true, code: true } },
            },
            orderBy: { name: 'asc' },
        });

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Indense';
        workbook.created = new Date();

        const sheet = workbook.addWorksheet('All Materials');
        sheet.columns = [
            { header: 'Material Name', key: 'name', width: 30 },
            { header: 'Material Code', key: 'code', width: 15 },
            { header: 'Specification', key: 'specifications', width: 25 },
            { header: 'Dimension', key: 'dimensions', width: 15 },
            { header: 'Color', key: 'color', width: 15 },
            { header: 'Category', key: 'category', width: 20 },
            { header: 'Unit', key: 'unit', width: 10 },
            { header: 'Description', key: 'description', width: 40 },
        ];

        for (const mat of materials) {
            const specs = mat.specifications as Record<string, unknown> || {};
            sheet.addRow({
                name: mat.name,
                code: mat.code,
                specifications: specs ? JSON.stringify(specs) : '-',
                dimensions: specs?.dimensions ? String(specs.dimensions) : '-',
                color: specs?.color ? String(specs.color) : '-',
                category: mat.itemGroup?.name || 'Uncategorized',
                unit: mat.unit?.code || mat.unit?.name || '-',
                description: mat.description || '-',
            });
        }

        this.styleWorksheet(sheet);

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }

    /**
     * Vendor Report - List of all vendors with purchase history
     */
    async getVendorReport(filters: DateRangeFilter): Promise<VendorReportRow[]> {
        const dateWhere: Record<string, unknown> = {};
        if (filters.fromDate || filters.toDate) {
            dateWhere.createdAt = {};
            if (filters.fromDate) (dateWhere.createdAt as Record<string, Date>).gte = filters.fromDate;
            if (filters.toDate) (dateWhere.createdAt as Record<string, Date>).lte = filters.toDate;
        }

        const siteWhere = filters.siteId ? { indent: { siteId: filters.siteId } } : {};

        const orders = await prisma.order.findMany({
            where: {
                ...dateWhere,
                ...siteWhere,
            },
            include: {
                orderItems: true,
            },
        });

        // Group by vendor name
        const vendorMap = new Map<string, VendorReportRow>();

        for (const order of orders) {
            const vendorKey = order.vendorName.toLowerCase().trim();
            const existing = vendorMap.get(vendorKey);

            const materials = order.orderItems
                .map((oi) => oi.materialName)
                .filter(Boolean) as string[];

            if (existing) {
                existing.totalOrders += 1;
                existing.totalValue += order.grandTotal || 0;
                existing.materialsSupplied = [...new Set([...existing.materialsSupplied, ...materials])];
            } else {
                vendorMap.set(vendorKey, {
                    vendorName: order.vendorName,
                    vendorAddress: order.vendorAddress,
                    vendorGstNo: order.vendorGstNo,
                    vendorContactPerson: order.vendorContactPerson,
                    vendorContactPhone: order.vendorContactPhone,
                    vendorNatureOfBusiness: order.vendorNatureOfBusiness,
                    totalOrders: 1,
                    totalValue: order.grandTotal || 0,
                    materialsSupplied: materials,
                });
            }
        }

        return Array.from(vendorMap.values());
    }

    async generateVendorReportExcel(filters: DateRangeFilter): Promise<Buffer> {
        const data = await this.getVendorReport(filters);

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Indense';
        workbook.created = new Date();

        const sheet = workbook.addWorksheet('Vendor Report');
        sheet.columns = [
            { header: 'Vendor Name', key: 'vendorName', width: 30 },
            { header: 'Address', key: 'vendorAddress', width: 35 },
            { header: 'GST No.', key: 'vendorGstNo', width: 18 },
            { header: 'Contact Person', key: 'vendorContactPerson', width: 20 },
            { header: 'Contact Phone', key: 'vendorContactPhone', width: 15 },
            { header: 'Nature of Business', key: 'vendorNatureOfBusiness', width: 20 },
            { header: 'Total Orders', key: 'totalOrders', width: 12 },
            { header: 'Total Value', key: 'totalValue', width: 15 },
            { header: 'Materials Supplied', key: 'materialsSupplied', width: 50 },
        ];

        for (const row of data) {
            sheet.addRow({
                ...row,
                materialsSupplied: row.materialsSupplied.join(', '),
            });
        }

        this.styleWorksheet(sheet);

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }

    /**
     * Damage Report - All damage reports with status
     */
    async getDamageReport(filters: DateRangeFilter): Promise<DamageReportRow[]> {
        const dateWhere: Record<string, unknown> = {};
        if (filters.fromDate || filters.toDate) {
            dateWhere.createdAt = {};
            if (filters.fromDate) (dateWhere.createdAt as Record<string, Date>).gte = filters.fromDate;
            if (filters.toDate) (dateWhere.createdAt as Record<string, Date>).lte = filters.toDate;
        }

        const siteWhere = filters.siteId ? { siteId: filters.siteId } : {};

        const reports = await prisma.damageReport.findMany({
            where: {
                ...dateWhere,
                ...siteWhere,
            },
            include: {
                indent: { select: { indentNumber: true } },
                site: { select: { name: true } },
                indentItem: {
                    include: { material: { select: { name: true } } },
                },
                reportedBy: { select: { name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        return reports.map((report) => ({
            damageId: report.id,
            materialName: report.indentItem?.material?.name || report.name,
            indentNumber: report.indent.indentNumber,
            siteName: report.site.name,
            reportedBy: report.reportedBy.name,
            reportedAt: report.createdAt,
            damagedQty: report.damagedQty,
            severity: report.severity,
            status: report.status,
            isReordered: report.isReordered,
            reorderExpectedDate: report.reorderExpectedDate,
        }));
    }

    async generateDamageReportExcel(filters: DateRangeFilter): Promise<Buffer> {
        const data = await this.getDamageReport(filters);

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Indense';
        workbook.created = new Date();

        const sheet = workbook.addWorksheet('Damage Report');
        sheet.columns = [
            { header: 'Material Name', key: 'materialName', width: 30 },
            { header: 'Indent No.', key: 'indentNumber', width: 20 },
            { header: 'Site', key: 'siteName', width: 20 },
            { header: 'Reported By', key: 'reportedBy', width: 20 },
            { header: 'Reported At', key: 'reportedAt', width: 15 },
            { header: 'Damaged Qty', key: 'damagedQty', width: 12 },
            { header: 'Severity', key: 'severity', width: 12 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Reordered', key: 'isReordered', width: 12 },
            { header: 'Expected Delivery', key: 'reorderExpectedDate', width: 18 },
        ];

        for (const row of data) {
            sheet.addRow({
                ...row,
                reportedAt: row.reportedAt.toISOString().split('T')[0],
                isReordered: row.isReordered ? 'Yes' : 'No',
                reorderExpectedDate: row.reorderExpectedDate?.toISOString().split('T')[0] || '-',
            });
        }

        this.styleWorksheet(sheet);

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }

    /**
     * Helper to style worksheet headers
     */
    private styleWorksheet(sheet: ExcelJS.Worksheet) {
        sheet.getRow(1).font = { bold: true };
        sheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' },
        };
        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    }
}

export const reportsService = new ReportsService();
export default reportsService;
