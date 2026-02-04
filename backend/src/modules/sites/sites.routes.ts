import { Router } from 'express';
import { sitesController } from './sites.controller';
import { authenticate } from '../../middleware/authenticate';
import { requireHeadOffice, requireDirector } from '../../middleware/authorize';
import { validateRequest } from '../../middleware/validateRequest';
import { createSiteValidation, updateSiteValidation, assignEngineersValidation } from './sites.validation';

const router = Router();

// Public route for registration (list active sites) - NO AUTH REQUIRED
router.get('/public', sitesController.findAllPublic.bind(sitesController));

// All routes below require authentication
router.use(authenticate);

// GET is available to all authenticated users
router.get('/', sitesController.findAll.bind(sitesController));
router.get('/:id', sitesController.findById.bind(sitesController));
router.get('/:id/details', sitesController.findByIdWithEngineers.bind(sitesController));
router.get('/:id/available-engineers', requireDirector, sitesController.getAvailableEngineers.bind(sitesController));

// Create/Update/Delete only for head office (Director)
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

// Engineer management - Director only
router.post(
    '/:id/engineers',
    requireDirector,
    validateRequest(assignEngineersValidation),
    sitesController.assignEngineers.bind(sitesController)
);
router.delete(
    '/:id/engineers/:engineerId',
    requireDirector,
    sitesController.removeEngineer.bind(sitesController)
);

// Site close/delete - Director only
router.post('/:id/close', requireDirector, sitesController.closeSite.bind(sitesController));
router.delete('/:id', requireDirector, sitesController.deleteSite.bind(sitesController));

export default router;
