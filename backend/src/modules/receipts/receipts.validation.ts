import { body, param } from 'express-validator';

export const createReceiptValidation = [
    body('indentId').isUUID().withMessage('Indent ID is required'),
    body('name').optional().isString().trim(),
    body('deliveryNote').optional().isString(),
    body('remarks').optional().isString(),
    body('items').optional().isArray(),
    body('items.*.indentItemId').optional().isUUID().withMessage('Indent item ID is required'),
    body('items.*.receivedQty').optional().isFloat({ gt: 0 }).withMessage('Received quantity must be greater than 0'),
    body('items.*.remarks').optional().isString(),
];

export const uploadReceiptImageValidation = [
    param('id').isUUID().withMessage('Receipt ID must be a valid UUID'),
];

export const deleteReceiptValidation = [
    param('id').isUUID().withMessage('Receipt ID must be a valid UUID'),
];
