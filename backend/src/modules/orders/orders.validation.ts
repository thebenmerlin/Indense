import { body, param } from 'express-validator';

export const createOrderValidation = [
    body('indentId').isUUID().withMessage('Indent ID must be a valid UUID'),
    body('vendorName').isString().trim().notEmpty().withMessage('Vendor name is required'),
    body('vendorContact').optional().isString(),
    body('vendorEmail').optional().isEmail(),
    body('vendorAddress').optional().isString(),
    body('vendorGstNo').optional().isString().trim(),
    body('vendorContactPerson').optional().isString().trim(),
    body('vendorContactPhone').optional().isString().trim(),
    body('vendorNatureOfBusiness').optional().isString().trim(),
    body('totalAmount').optional().isFloat({ min: 0 }),
    body('taxAmount').optional().isFloat({ min: 0 }),
    body('shippingAmount').optional().isFloat({ min: 0 }),
    body('expectedDeliveryDate').optional().isISO8601().toDate(),
    body('remarks').optional().isString(),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.materialName').isString().notEmpty(),
    body('items.*.materialCode').isString().notEmpty(),
    body('items.*.quantity').isFloat({ gt: 0 }),
    body('items.*.unitPrice').optional().isFloat({ min: 0 }),
];

export const updateOrderValidation = [
    body('vendorName').optional().isString().trim(),
    body('vendorContact').optional().isString(),
    body('vendorEmail').optional().isEmail(),
    body('vendorAddress').optional().isString(),
    body('vendorGstNo').optional().isString().trim(),
    body('vendorContactPerson').optional().isString().trim(),
    body('vendorContactPhone').optional().isString().trim(),
    body('vendorNatureOfBusiness').optional().isString().trim(),
    body('totalAmount').optional().isFloat({ min: 0 }),
    body('taxAmount').optional().isFloat({ min: 0 }),
    body('shippingAmount').optional().isFloat({ min: 0 }),
    body('expectedDeliveryDate').optional().isISO8601().toDate(),
    body('deliveryStatus').optional().isIn(['PENDING', 'IN_TRANSIT', 'DELIVERED']),
    body('remarks').optional().isString(),
];

export const updateOrderItemValidation = [
    param('id').isUUID().withMessage('Order ID must be a valid UUID'),
    param('itemId').isUUID().withMessage('Item ID must be a valid UUID'),
    body('vendorName').optional().isString().trim(),
    body('vendorAddress').optional().isString().trim(),
    body('vendorGstNo').optional().isString().trim(),
    body('vendorContactPerson').optional().isString().trim(),
    body('vendorContactPhone').optional().isString().trim(),
    body('vendorNatureOfBusiness').optional().isString().trim(),
    body('unitPrice').optional().isFloat({ min: 0 }),
    body('quantity').optional().isFloat({ gt: 0 }),
    body('totalPrice').optional().isFloat({ min: 0 }),
];
