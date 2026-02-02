import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticate } from '../../middleware/authenticate';
import { requireHeadOffice } from '../../middleware/authorize';
import { validateRequest } from '../../middleware/validateRequest';
import { createUserValidation, updateUserValidation } from './users.validation';

const router = Router();

// All routes require authentication and Purchase Team or Director role
router.use(authenticate);
router.use(requireHeadOffice);

router.get('/', usersController.findAll.bind(usersController));
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

export default router;
