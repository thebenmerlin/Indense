import { body } from 'express-validator';
import { Role } from '@prisma/client';

export const createUserValidation = [
    body('email')
        .isEmail()
        .withMessage('Valid email is required')
        .normalizeEmail(),
    body('password')
        .isString()
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters'),
    body('name')
        .isString()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be 2-100 characters'),
    body('role')
        .isIn(Object.values(Role))
        .withMessage(`Role must be one of: ${Object.values(Role).join(', ')}`),
    body('siteId')
        .optional()
        .isUUID()
        .withMessage('Site ID must be a valid UUID'),
];

export const updateUserValidation = [
    body('name')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be 2-100 characters'),
    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive must be a boolean'),
];

export const demoteUserValidation = [
    body('siteId')
        .optional()
        .isUUID()
        .withMessage('Site ID must be a valid UUID when demoting to Site Engineer'),
];
