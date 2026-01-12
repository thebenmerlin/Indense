import { Router } from 'express';
import { reportsController } from './reports.controller';
import { authenticate } from '../../middleware/authenticate';
import { requireHeadOffice } from '../../middleware/authorize';

const router = Router();

router.use(authenticate);
router.use(requireHeadOffice); // Reports only for Purchase Team and Director

router.get('/monthly', reportsController.getMonthlyReport.bind(reportsController));
router.get('/monthly/download', reportsController.downloadMonthlyReport.bind(reportsController));
router.get('/stats', reportsController.getSiteStats.bind(reportsController));

export default router;
