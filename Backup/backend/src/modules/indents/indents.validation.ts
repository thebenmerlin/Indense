import { body } from 'express-validator';

export const createIndentValidation = [
    body('priority')
        .optional()
        .isIn(['LOW', 'NORMAL', 'HIGH', 'URGENT'])
        .withMessage('Priority must be LOW, NORMAL, HIGH, or URGENT'),
    body('notes').optional().isString(),
    body('requiredByDate').optional().isISO8601().toDate(),
    body('items')
        .isArray({ min: 1 })
        .withMessage('At least one item is required'),
    body('items.*.materialId')
        .isUUID()
        .withMessage('Material ID must be a valid UUID'),
    body('items.*.requestedQty')
        .isFloat({ gt: 0 })
        .withMessage('Requested quantity must be greater than 0'),
    body('items.*.specifications').optional().isObject(),
    body('items.*.notes').optional().isString(),
];

export const approveIndentValidation = [
    body('remarks').optional().isString().trim(),
];

export const rejectIndentValidation = [
    body('reason')
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Rejection reason is required'),
];
