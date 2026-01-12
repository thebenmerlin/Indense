import { Router } from 'express';
import { indentsController } from './indents.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize, requireSiteEngineer, requirePurchaseTeam, requireDirector, requireHeadOffice } from '../../middleware/authorize';
import { validateRequest } from '../../middleware/validateRequest';
import { createIndentValidation, approveIndentValidation, rejectIndentValidation } from './indents.validation';
import { applySiteFilter } from '../../middleware/siteFilter';

const router = Router();

router.use(authenticate);
router.use(applySiteFilter());

// List and view - all authenticated users (with site filtering)
router.get('/', indentsController.findAll.bind(indentsController));
router.get('/:id', indentsController.findById.bind(indentsController));

// Create - Site Engineer only
router.post(
    '/',
    requireSiteEngineer,
    validateRequest(createIndentValidation),
    indentsController.create.bind(indentsController)
);

// Purchase team approval
router.post(
    '/:id/purchase-approve',
    requirePurchaseTeam,
    validateRequest(approveIndentValidation),
    indentsController.purchaseApprove.bind(indentsController)
);

// Director approval
router.post(
    '/:id/director-approve',
    requireDirector,
    validateRequest(approveIndentValidation),
    indentsController.directorApprove.bind(indentsController)
);

// Reject - Purchase Team or Director
router.post(
    '/:id/reject',
    requireHeadOffice,
    validateRequest(rejectIndentValidation),
    indentsController.reject.bind(indentsController)
);

// Close - Head office only
router.post(
    '/:id/close',
    requireHeadOffice,
    indentsController.close.bind(indentsController)
);

export default router;
