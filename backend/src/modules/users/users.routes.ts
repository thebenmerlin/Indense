import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticate } from '../../middleware/authenticate';
import { requireHeadOffice, requireDirector } from '../../middleware/authorize';
import { validateRequest } from '../../middleware/validateRequest';
import { createUserValidation, updateUserValidation, demoteUserValidation } from './users.validation';

const router = Router();

// All routes require authentication and Purchase Team or Director role
router.use(authenticate);
router.use(requireHeadOffice);

// General user management
router.get('/', usersController.findAll.bind(usersController));
router.get('/role-counts', usersController.getRoleCounts.bind(usersController));
router.get('/role/:role', usersController.getUsersByRole.bind(usersController));
router.get('/:id', usersController.findById.bind(usersController));
router.post(
    '/',
    validateRequest(createUserValidation),
    usersController.create.bind(usersController)
);
router.patch(
    '/:id',
    validateRequest(updateUserValidation),
    usersController.update.bind(usersController)
);

// Role management - Director only
router.post('/:id/promote', requireDirector, usersController.promoteUser.bind(usersController));
router.post(
    '/:id/demote',
    requireDirector,
    validateRequest(demoteUserValidation),
    usersController.demoteUser.bind(usersController)
);
router.post('/:id/revoke', requireDirector, usersController.revokeUser.bind(usersController));
router.post('/:id/restore', requireDirector, usersController.restoreUser.bind(usersController));
router.post('/:id/toggle-site-engineer', requireDirector, usersController.toggleSiteEngineer.bind(usersController));

export default router;

