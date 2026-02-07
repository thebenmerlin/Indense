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
    // Allow either UUID (existing material) or temp-* (new material)
    body('items.*.materialId')
        .isString()
        .custom((value) => {
            // Accept UUID format or temp-* format for new materials
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            const tempRegex = /^temp-\d+$/;
            if (!uuidRegex.test(value) && !tempRegex.test(value)) {
                throw new Error('Material ID must be a valid UUID or temp ID for new materials');
            }
            return true;
        }),
    body('items.*.requestedQty')
        .isFloat({ gt: 0 })
        .withMessage('Requested quantity must be greater than 0'),
    body('items.*.specifications').optional().isObject(),
    body('items.*.notes').optional().isString(),
    body('items.*.isUrgent').optional().isBoolean(),
    body('items.*.isNewMaterial').optional().isBoolean(),
    // New material fields (required when isNewMaterial is true)
    body('items.*.newMaterial').optional().isObject(),
    body('items.*.newMaterial.name').optional().isString().trim(),
    body('items.*.newMaterial.categoryId').optional().isString(),
    body('items.*.newMaterial.categoryName').optional().isString().trim(),
    body('items.*.newMaterial.unitId').optional().isString(),
    body('items.*.newMaterial.unitCode').optional().isString().trim(),
    body('items.*.newMaterial.unitName').optional().isString().trim(),
    body('items.*.newMaterial.specification').optional().isString().trim(),
    body('items.*.newMaterial.dimensions').optional().isString().trim(),
    body('items.*.newMaterial.colour').optional().isString().trim(),
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
