import { body } from 'express-validator';

export const createSiteValidation = [
    body('name')
        .isString()
        .trim()
        .isLength({ min: 2, max: 200 })
        .withMessage('Site name must be 2-200 characters'),
    body('code')
        .isString()
        .trim()
        .isLength({ min: 2, max: 20 })
        .withMessage('Site code must be 2-20 characters')
        .matches(/^[A-Z0-9-]+$/)
        .withMessage('Site code must contain only uppercase letters, numbers, and hyphens'),
    body('address').optional().isString().trim(),
    body('city').optional().isString().trim(),
    body('state').optional().isString().trim(),
    body('startDate').optional().isISO8601().toDate(),
    body('expectedHandoverDate').optional().isISO8601().toDate(),
    body('engineerIds').optional().isArray(),
    body('engineerIds.*').optional().isUUID(),
];

export const updateSiteValidation = [
    body('name')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 2, max: 200 })
        .withMessage('Site name must be 2-200 characters'),
    body('address').optional().isString().trim(),
    body('city').optional().isString().trim(),
    body('state').optional().isString().trim(),
    body('isActive').optional().isBoolean(),
    body('startDate').optional().isISO8601().toDate(),
    body('expectedHandoverDate').optional().isISO8601().toDate(),
];

export const assignEngineersValidation = [
    body('engineerIds')
        .isArray({ min: 1 })
        .withMessage('At least one engineer ID is required'),
    body('engineerIds.*')
        .isUUID()
        .withMessage('Invalid engineer ID format'),
];
