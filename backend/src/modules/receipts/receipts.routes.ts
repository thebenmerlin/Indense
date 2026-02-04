import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { receiptsController } from './receipts.controller';
import { authenticate } from '../../middleware/authenticate';
import { requireSiteEngineer } from '../../middleware/authorize';
import { validateRequest } from '../../middleware/validateRequest';
import { createReceiptValidation, uploadReceiptImageValidation, deleteReceiptValidation } from './receipts.validation';
import { storageConfig } from '../../config/storage';

const storage = multer.diskStorage({
    destination: path.join(storageConfig.uploadDir, storageConfig.directories.receipts),
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage,
    limits: { fileSize: storageConfig.maxFileSize },
    fileFilter: (_req, file, cb) => {
        const allowed = storageConfig.allowedMimeTypes.images;
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    },
});

const router = Router();

router.use(authenticate);

// List all receipts
router.get('/', receiptsController.findAll.bind(receiptsController));

// Get receipts for a specific indent
router.get('/indent/:indentId', receiptsController.findByIndentId.bind(receiptsController));

// Get single receipt by ID
router.get('/:id', receiptsController.findById.bind(receiptsController));

// Site Engineer creates receipts
router.post(
    '/',
    requireSiteEngineer,
    validateRequest(createReceiptValidation),
    receiptsController.create.bind(receiptsController)
);

// Upload image to receipt
router.post(
    '/:id/images',
    requireSiteEngineer,
    validateRequest(uploadReceiptImageValidation),
    upload.single('image'),
    receiptsController.uploadImage.bind(receiptsController)
);

// Delete receipt
router.delete(
    '/:id',
    requireSiteEngineer,
    validateRequest(deleteReceiptValidation),
    receiptsController.deleteReceipt.bind(receiptsController)
);

// Delete receipt image
router.delete(
    '/:id/images/:imageId',
    requireSiteEngineer,
    receiptsController.deleteImage.bind(receiptsController)
);

export default router;
