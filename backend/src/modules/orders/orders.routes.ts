import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { ordersController } from './orders.controller';
import { authenticate } from '../../middleware/authenticate';
import { requirePurchaseTeam, requireHeadOffice } from '../../middleware/authorize';
import { validateRequest } from '../../middleware/validateRequest';
import { createOrderValidation, updateOrderValidation, updateOrderItemValidation } from './orders.validation';

const router = Router();

// Configure multer for invoice uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../../uploads/invoices'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `invoice-${uniqueSuffix}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and PDF are allowed.'));
        }
    },
});

router.use(authenticate);

// Get director-approved indents ready for ordering (PT only)
router.get('/approved-indents', requirePurchaseTeam, ordersController.getApprovedIndents.bind(ordersController));

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

// Mark as purchased
router.post(
    '/:id/purchased',
    requirePurchaseTeam,
    ordersController.markAsPurchased.bind(ordersController)
);

// Update order item
router.patch(
    '/:id/items/:itemId',
    requirePurchaseTeam,
    validateRequest(updateOrderItemValidation),
    ordersController.updateOrderItem.bind(ordersController)
);

// Invoice management - Order level
router.post(
    '/:id/invoices',
    requirePurchaseTeam,
    upload.single('invoice'),
    ordersController.uploadOrderInvoice.bind(ordersController)
);

router.delete(
    '/:id/invoices/:invoiceId',
    requirePurchaseTeam,
    ordersController.deleteOrderInvoice.bind(ordersController)
);

// Invoice management - Order item level
router.post(
    '/:id/items/:itemId/invoices',
    requirePurchaseTeam,
    upload.single('invoice'),
    ordersController.uploadOrderItemInvoice.bind(ordersController)
);

router.delete(
    '/:id/items/:itemId/invoices/:invoiceId',
    requirePurchaseTeam,
    ordersController.deleteOrderItemInvoice.bind(ordersController)
);

export default router;
