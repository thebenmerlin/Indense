import { Request, Response, NextFunction } from 'express';
import { reportsService } from './reports.service';

class ReportsController {
    private parseFilters(req: Request) {
        const { fromDate, toDate, siteId } = req.query;
        return {
            fromDate: fromDate ? new Date(fromDate as string) : undefined,
            toDate: toDate ? new Date(toDate as string) : undefined,
            siteId: siteId as string | undefined,
        };
    }

    async getMonthlyReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { year, month, siteId } = req.query;
            const now = new Date();

            const report = await reportsService.getMonthlyReport({
                year: year ? parseInt(year as string, 10) : now.getFullYear(),
                month: month ? parseInt(month as string, 10) : now.getMonth() + 1,
                siteId: siteId as string | undefined,
            });

            res.json({ success: true, data: report });
        } catch (error) {
            next(error);
        }
    }

    async downloadMonthlyReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { year, month, siteId } = req.query;
            const now = new Date();

            const y = year ? parseInt(year as string, 10) : now.getFullYear();
            const m = month ? parseInt(month as string, 10) : now.getMonth() + 1;

            const buffer = await reportsService.generateExcel({
                year: y,
                month: m,
                siteId: siteId as string | undefined,
            });

            const filename = `material-report-${y}-${String(m).padStart(2, '0')}.xlsx`;

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(buffer);
        } catch (error) {
            next(error);
        }
    }

    async getSiteStats(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { siteId } = req.query;
            const stats = await reportsService.getSiteStats(siteId as string | undefined);
            res.json({ success: true, data: stats });
        } catch (error) {
            next(error);
        }
    }

    // Dashboard Summary
    async getDashboardSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const filters = this.parseFilters(req);
            const summary = await reportsService.getDashboardSummary(filters);
            res.json({ success: true, data: summary });
        } catch (error) {
            next(error);
        }
    }

    // Financial Report
    async getFinancialReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const filters = this.parseFilters(req);
            const data = await reportsService.getFinancialReport(filters);
            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    async downloadFinancialReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const filters = this.parseFilters(req);
            const buffer = await reportsService.generateFinancialReportExcel(filters);
            
            const filename = `financial-report-${Date.now()}.xlsx`;
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(buffer);
        } catch (error) {
            next(error);
        }
    }

    // Material Report
    async getMaterialReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const filters = this.parseFilters(req);
            const data = await reportsService.getMaterialReport(filters);
            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    async downloadMaterialReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const filters = this.parseFilters(req);
            const buffer = await reportsService.generateMaterialReportExcel(filters);
            
            const filename = `material-report-${Date.now()}.xlsx`;
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(buffer);
        } catch (error) {
            next(error);
        }
    }

    async downloadAllMaterials(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const buffer = await reportsService.generateAllMaterialsExcel();
            
            const filename = `all-materials-${Date.now()}.xlsx`;
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(buffer);
        } catch (error) {
            next(error);
        }
    }

    // Vendor Report
    async getVendorReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const filters = this.parseFilters(req);
            const data = await reportsService.getVendorReport(filters);
            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    async downloadVendorReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const filters = this.parseFilters(req);
            const buffer = await reportsService.generateVendorReportExcel(filters);
            
            const filename = `vendor-report-${Date.now()}.xlsx`;
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(buffer);
        } catch (error) {
            next(error);
        }
    }

    // Damage Report
    async getDamageReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const filters = this.parseFilters(req);
            const data = await reportsService.getDamageReport(filters);
            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    async downloadDamageReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const filters = this.parseFilters(req);
            const buffer = await reportsService.generateDamageReportExcel(filters);
            
            const filename = `damage-report-${Date.now()}.xlsx`;
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(buffer);
        } catch (error) {
            next(error);
        }
    }
}

export const reportsController = new ReportsController();
export default reportsController;
