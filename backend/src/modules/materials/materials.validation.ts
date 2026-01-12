import { body } from 'express-validator';

export const createMaterialValidation = [
    body('name').isString().trim().notEmpty().withMessage('Name is required'),
    body('code').isString().trim().notEmpty().withMessage('Code is required'),
    body('category').isString().trim().notEmpty().withMessage('Category is required'),
    body('unit').isString().trim().notEmpty().withMessage('Unit is required'),
    body('description').optional().isString(),
    body('specifications').optional().isObject(),
];
