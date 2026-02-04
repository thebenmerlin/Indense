import { body, param } from 'express-validator';

export const createDamageReportValidation = [
    body('indentId').isUUID().withMessage('Indent ID is required'),
    body('indentItemId').optional().isUUID().withMessage('Indent item ID must be a valid UUID'),
    body('name').isString().trim().notEmpty().withMessage('Damage name is required'),
    body('damagedQty').optional().isFloat({ gt: 0 }).withMessage('Damaged quantity must be greater than 0'),
    body('description').isString().trim().notEmpty().withMessage('Description is required'),
    body('severity').optional().isIn(['MINOR', 'MODERATE', 'SEVERE']),
    body('isDraft').optional().isBoolean(),
];

export const updateDamageReportValidation = [
    param('id').isUUID().withMessage('Damage report ID must be a valid UUID'),
    body('name').optional().isString().trim(),
    body('damagedQty').optional().isFloat({ gt: 0 }),
    body('description').optional().isString().trim(),
    body('severity').optional().isIn(['MINOR', 'MODERATE', 'SEVERE']),
];

export const submitDamageReportValidation = [
    param('id').isUUID().withMessage('Damage report ID must be a valid UUID'),
];

export const createReturnValidation = [
    body('damageReportId').isUUID().withMessage('Damage report ID is required'),
    body('quantity').isFloat({ gt: 0 }).withMessage('Quantity must be greater than 0'),
    body('reason').isString().trim().notEmpty().withMessage('Reason is required'),
];
