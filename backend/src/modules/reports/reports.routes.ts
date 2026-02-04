import { Router } from 'express';
import { reportsController } from './reports.controller';
import { authenticate } from '../../middleware/authenticate';
import { requireHeadOffice } from '../../middleware/authorize';

const router = Router();

router.use(authenticate);
router.use(requireHeadOffice); // Reports only for Purchase Team and Director

// Legacy monthly reports
router.get('/monthly', reportsController.getMonthlyReport.bind(reportsController));
router.get('/monthly/download', reportsController.downloadMonthlyReport.bind(reportsController));
router.get('/stats', reportsController.getSiteStats.bind(reportsController));

// Dashboard Summary
router.get('/dashboard-summary', reportsController.getDashboardSummary.bind(reportsController));

// Financial Report
router.get('/financial', reportsController.getFinancialReport.bind(reportsController));
router.get('/financial/download', reportsController.downloadFinancialReport.bind(reportsController));

// Material Report
router.get('/material', reportsController.getMaterialReport.bind(reportsController));
router.get('/material/download', reportsController.downloadMaterialReport.bind(reportsController));
router.get('/material/all/download', reportsController.downloadAllMaterials.bind(reportsController));

// Vendor Report
router.get('/vendor', reportsController.getVendorReport.bind(reportsController));
router.get('/vendor/download', reportsController.downloadVendorReport.bind(reportsController));

// Damage Report
router.get('/damage', reportsController.getDamageReport.bind(reportsController));
router.get('/damage/download', reportsController.downloadDamageReport.bind(reportsController));

export default router;
