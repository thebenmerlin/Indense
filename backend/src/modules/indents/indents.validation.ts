import { body, param } from 'express-validator';

export const createIndentValidation = [
    body('name')
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Indent name is required'),
    body('description').optional().isString(),
    body('priority')
        .optional()
        .isIn(['LOW', 'NORMAL', 'HIGH', 'URGENT'])
        .withMessage('Priority must be LOW, NORMAL, HIGH, or URGENT'),
    body('notes').optional().isString(),
    body('requiredByDate').optional().isISO8601().toDate(),
    body('expectedDeliveryDate').optional().isISO8601().toDate(),
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
    body('items.*.isUrgent').optional().isBoolean(),
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

export const updateArrivalStatusValidation = [
    param('id').isUUID().withMessage('Indent ID must be a valid UUID'),
    param('itemId').isUUID().withMessage('Item ID must be a valid UUID'),
    body('arrivalStatus')
        .isIn(['ARRIVED', 'PARTIAL', 'NOT_ARRIVED'])
        .withMessage('Arrival status must be ARRIVED, PARTIAL, or NOT_ARRIVED'),
    body('arrivalNotes').optional().isString().trim(),
];

export const onHoldValidation = [
    body('reason')
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Reason for putting on hold is required'),
];
