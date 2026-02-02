import { body } from 'express-validator';

export const createDamageReportValidation = [
    body('indentItemId').isUUID().withMessage('Indent item ID is required'),
    body('damagedQty').isFloat({ gt: 0 }).withMessage('Damaged quantity must be greater than 0'),
    body('description').isString().trim().notEmpty().withMessage('Description is required'),
    body('severity').optional().isIn(['MINOR', 'MODERATE', 'SEVERE']),
];

export const createReturnValidation = [
    body('damageReportId').isUUID().withMessage('Damage report ID is required'),
    body('quantity').isFloat({ gt: 0 }).withMessage('Quantity must be greater than 0'),
    body('reason').isString().trim().notEmpty().withMessage('Reason is required'),
];
