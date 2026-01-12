import { Router } from 'express';
import { ordersController } from './orders.controller';
import { authenticate } from '../../middleware/authenticate';
import { requirePurchaseTeam, requireHeadOffice } from '../../middleware/authorize';
import { validateRequest } from '../../middleware/validateRequest';
import { createOrderValidation, updateOrderValidation } from './orders.validation';

const router = Router();

router.use(authenticate);

// All authenticated can view (with role-based field filtering in service)
router.get('/', ordersController.findAll.bind(ordersController));
router.get('/:id', ordersController.findById.bind(ordersController));

// Purchase Team creates and updates orders
router.post(
    '/',
    requirePurchaseTeam,
    validateRequest(createOrderValidation),
    ordersController.create.bind(ordersController)
);

router.patch(
    '/:id',
    requireHeadOffice,
    validateRequest(updateOrderValidation),
    ordersController.update.bind(ordersController)
);

export default router;
