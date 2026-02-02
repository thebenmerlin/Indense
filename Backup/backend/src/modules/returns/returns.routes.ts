import { Router } from 'express';
import { returnsController } from './returns.controller';
import { authenticate } from '../../middleware/authenticate';
import { requireSiteEngineer, requireHeadOffice } from '../../middleware/authorize';
import { validateRequest } from '../../middleware/validateRequest';
import { createDamageReportValidation, createReturnValidation } from './returns.validation';
import { body } from 'express-validator';

const router = Router();

router.use(authenticate);

// Damage reports
router.get('/damages', returnsController.findAllDamageReports.bind(returnsController));

router.post(
    '/damages',
    requireSiteEngineer,
    validateRequest(createDamageReportValidation),
    returnsController.createDamageReport.bind(returnsController)
);

router.post(
    '/damages/:id/resolve',
    requireHeadOffice,
    validateRequest([body('resolution').isString().notEmpty()]),
    returnsController.resolveDamage.bind(returnsController)
);

// Returns
router.get('/', returnsController.findAllReturns.bind(returnsController));

router.post(
    '/',
    requireSiteEngineer,
    validateRequest(createReturnValidation),
    returnsController.createReturn.bind(returnsController)
);

router.post(
    '/:id/approve',
    requireHeadOffice,
    returnsController.approveReturn.bind(returnsController)
);

router.post(
    '/:id/process',
    requireHeadOffice,
    returnsController.processReturn.bind(returnsController)
);

export default router;
