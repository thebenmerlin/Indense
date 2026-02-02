import { body } from 'express-validator';

export const createMaterialValidation = [
    body('name').isString().trim().notEmpty().withMessage('Name is required'),
    body('code').isString().trim().notEmpty().withMessage('Code is required'),
    body('itemGroupId').isUUID().withMessage('Valid Item Group ID is required'),
    body('unitId').isUUID().withMessage('Valid Unit of Measure ID is required'),
    body('description').optional().isString(),
    body('specifications').optional().isObject(),
];

