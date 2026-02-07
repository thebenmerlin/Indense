import { body, oneOf } from 'express-validator';

// Security questions for dropdown
export const SECURITY_QUESTIONS = [
    'MOTHERS_MAIDEN_NAME',
    'FIRST_PET_NAME',
    'CHILDHOOD_NICKNAME',
    'FIRST_SCHOOL',
    'FAVORITE_BOOK',
    'BIRTHPLACE_CITY',
] as const;

export const registerValidation = [
    body('email')
        .isEmail()
        .withMessage('Valid company email is required')
        .normalizeEmail(),
    body('phone')
        .optional()
        .isMobilePhone('any')
        .withMessage('Valid phone number is required'),
    body('password')
        .isString()
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters'),
    body('name')
        .isString()
        .trim()
        .isLength({ min: 2 })
        .withMessage('Name must be at least 2 characters'),
    body('dob')
        .optional()
        .isISO8601()
        .withMessage('Date of birth must be a valid date'),
    body('role')
        .isIn(['SITE_ENGINEER', 'PURCHASE_TEAM', 'DIRECTOR'])
        .withMessage('Role must be Site Engineer, Purchase Team, or Director'),
    body('siteIds')
        .optional()
        .isArray()
        .withMessage('Site IDs must be an array'),
    body('siteIds.*')
        .optional()
        .isUUID()
        .withMessage('Each site ID must be a valid UUID'),
    body('securityQuestion')
        .isIn(SECURITY_QUESTIONS)
        .withMessage('Security question is required'),
    body('securityAnswer')
        .isString()
        .trim()
        .isLength({ min: 2 })
        .withMessage('Security answer must be at least 2 characters'),
];

export const loginValidation = [
    oneOf([
        body('email').isEmail().withMessage('Valid email is required'),
        body('phone').isMobilePhone('any').withMessage('Valid phone is required'),
    ], { message: 'Either email or phone is required' }),
    body('password')
        .isString()
        .notEmpty()
        .withMessage('Password is required'),
];

export const forgotPasswordValidation = [
    body('emailOrPhone')
        .isString()
        .notEmpty()
        .withMessage('Email or phone number is required'),
];

export const verifySecurityQuestionValidation = [
    body('userId')
        .isUUID()
        .withMessage('Valid user ID is required'),
    body('answer')
        .isString()
        .notEmpty()
        .withMessage('Security answer is required'),
];

export const resetPasswordValidation = [
    body('resetToken')
        .isString()
        .notEmpty()
        .withMessage('Reset token is required'),
    body('newPassword')
        .isString()
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters'),
];

export const refreshTokenValidation = [
    body('refreshToken')
        .isString()
        .notEmpty()
        .withMessage('Refresh token is required'),
];

export const changePasswordValidation = [
    body('currentPassword')
        .isString()
        .notEmpty()
        .withMessage('Current password is required'),
    body('newPassword')
        .isString()
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters'),
];

export const switchSiteValidation = [
    body('siteId')
        .isUUID()
        .withMessage('Valid site ID is required'),
];

export const updateThemeValidation = [
    body('theme')
        .isIn(['light', 'dark'])
        .withMessage('Theme must be light or dark'),
];

export const switchRoleValidation = [
    body('role')
        .isIn(['SITE_ENGINEER', 'PURCHASE_TEAM', 'DIRECTOR'])
        .withMessage('Role must be SITE_ENGINEER, PURCHASE_TEAM, or DIRECTOR'),
];
