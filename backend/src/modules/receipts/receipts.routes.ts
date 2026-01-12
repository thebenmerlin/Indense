import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { receiptsController } from './receipts.controller';
import { authenticate } from '../../middleware/authenticate';
import { requireSiteEngineer } from '../../middleware/authorize';
import { validateRequest } from '../../middleware/validateRequest';
import { createReceiptValidation } from './receipts.validation';
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

router.get('/', receiptsController.findAll.bind(receiptsController));

// Site Engineer creates receipts
router.post(
    '/',
    requireSiteEngineer,
    validateRequest(createReceiptValidation),
    receiptsController.create.bind(receiptsController)
);

router.post(
    '/:id/images',
    requireSiteEngineer,
    upload.single('image'),
    receiptsController.uploadImage.bind(receiptsController)
);

export default router;
