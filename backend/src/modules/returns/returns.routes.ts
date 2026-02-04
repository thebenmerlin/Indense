import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { returnsController } from './returns.controller';
import { authenticate } from '../../middleware/authenticate';
import { requireSiteEngineer, requireHeadOffice } from '../../middleware/authorize';
import { validateRequest } from '../../middleware/validateRequest';
import { createDamageReportValidation, createReturnValidation, updateDamageReportValidation, submitDamageReportValidation } from './returns.validation';
import { body } from 'express-validator';
import { storageConfig } from '../../config/storage';

// Storage config for damage images
const storage = multer.diskStorage({
    destination: path.join(storageConfig.uploadDir, storageConfig.directories.damages || 'damages'),
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

// Purchased indents for damage reporting (Site Engineer)
router.get('/purchased-indents', requireSiteEngineer, returnsController.getPurchasedIndentsForDamage.bind(returnsController));

// Damage reports
router.get('/damages', returnsController.findAllDamageReports.bind(returnsController));
router.get('/damages/indent/:indentId', returnsController.findDamageReportsByIndentId.bind(returnsController));
router.get('/damages/:id', returnsController.findDamageReportById.bind(returnsController));

router.post(
    '/damages',
    requireSiteEngineer,
    validateRequest(createDamageReportValidation),
    returnsController.createDamageReport.bind(returnsController)
);

router.patch(
    '/damages/:id',
    requireSiteEngineer,
    validateRequest(updateDamageReportValidation),
    returnsController.updateDamageReport.bind(returnsController)
);

router.post(
    '/damages/:id/submit',
    requireSiteEngineer,
    validateRequest(submitDamageReportValidation),
    returnsController.submitDamageReport.bind(returnsController)
);

router.post(
    '/damages/:id/images',
    requireSiteEngineer,
    upload.single('image'),
    returnsController.uploadDamageImage.bind(returnsController)
);

router.delete(
    '/damages/:id/images/:imageId',
    requireSiteEngineer,
    returnsController.deleteDamageImage.bind(returnsController)
);

router.delete(
    '/damages/:id',
    requireSiteEngineer,
    returnsController.deleteDamageReport.bind(returnsController)
);

router.post(
    '/damages/:id/resolve',
    requireHeadOffice,
    validateRequest([body('resolution').isString().notEmpty()]),
    returnsController.resolveDamage.bind(returnsController)
);

// Reorder damaged material (Purchase Team only)
router.post(
    '/damages/:id/reorder',
    requireHeadOffice,
    validateRequest([body('expectedDeliveryDate').isISO8601().withMessage('Valid expected delivery date is required')]),
    returnsController.reorderDamage.bind(returnsController)
);

// Reordered damage reports list
router.get('/damages-reordered', requireHeadOffice, returnsController.getReorderedDamageReports.bind(returnsController));

// Partially received indents
router.get('/partially-received', requireHeadOffice, returnsController.getPartiallyReceivedIndents.bind(returnsController));

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
