import { Request, Response, NextFunction } from 'express';
import { reportsService } from './reports.service';

class ReportsController {
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
}

export const reportsController = new ReportsController();
export default reportsController;
