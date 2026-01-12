import { Router } from 'express';
import { sitesController } from './sites.controller';
import { authenticate } from '../../middleware/authenticate';
import { requireHeadOffice } from '../../middleware/authorize';
import { validateRequest } from '../../middleware/validateRequest';
import { createSiteValidation, updateSiteValidation } from './sites.validation';

const router = Router();

router.use(authenticate);

// GET is available to all authenticated users
router.get('/', sitesController.findAll.bind(sitesController));
router.get('/:id', sitesController.findById.bind(sitesController));

// Create/Update only for head office
router.post(
    '/',
    requireHeadOffice,
    validateRequest(createSiteValidation),
    sitesController.create.bind(sitesController)
);
router.patch(
    '/:id',
    requireHeadOffice,
    validateRequest(updateSiteValidation),
    sitesController.update.bind(sitesController)
);

export default router;
