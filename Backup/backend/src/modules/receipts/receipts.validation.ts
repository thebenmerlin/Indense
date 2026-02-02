import { body } from 'express-validator';

export const createReceiptValidation = [
    body('indentId').isUUID().withMessage('Indent ID is required'),
    body('deliveryNote').optional().isString(),
    body('remarks').optional().isString(),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.indentItemId').isUUID().withMessage('Indent item ID is required'),
    body('items.*.receivedQty').isFloat({ gt: 0 }).withMessage('Received quantity must be greater than 0'),
    body('items.*.remarks').optional().isString(),
];
