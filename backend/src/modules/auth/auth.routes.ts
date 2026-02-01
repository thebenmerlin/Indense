import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '../../middleware/authenticate';
import { validateRequest } from '../../middleware/validateRequest';
import {
    registerValidation,
    loginValidation,
    forgotPasswordValidation,
    verifySecurityQuestionValidation,
    resetPasswordValidation,
    refreshTokenValidation,
    changePasswordValidation,
    switchSiteValidation,
    updateThemeValidation,
} from './auth.validation';

const router = Router();

// ============================================================================
// PUBLIC ROUTES (no authentication required)
// ============================================================================

// Register new user
router.post(
    '/register',
    validateRequest(registerValidation),
    authController.register.bind(authController)
);

// Login with email or phone
router.post(
    '/login',
    validateRequest(loginValidation),
    authController.login.bind(authController)
);

// Forgot password - get security question
router.post(
    '/forgot-password',
    validateRequest(forgotPasswordValidation),
    authController.forgotPassword.bind(authController)
);

// Verify security question answer
router.post(
    '/verify-security-question',
    validateRequest(verifySecurityQuestionValidation),
    authController.verifySecurityQuestion.bind(authController)
);

// Reset password with token
router.post(
    '/reset-password',
    validateRequest(resetPasswordValidation),
    authController.resetPassword.bind(authController)
);

// Refresh access token
router.post(
    '/refresh',
    validateRequest(refreshTokenValidation),
    authController.refreshToken.bind(authController)
);

// ============================================================================
// PROTECTED ROUTES (authentication required)
// ============================================================================

// Logout
router.post(
    '/logout',
    authenticate,
    authController.logout.bind(authController)
);

// Change password
router.post(
    '/change-password',
    authenticate,
    validateRequest(changePasswordValidation),
    authController.changePassword.bind(authController)
);

// Switch current site (for multi-site users)
router.post(
    '/switch-site',
    authenticate,
    validateRequest(switchSiteValidation),
    authController.switchSite.bind(authController)
);

// Update theme preference
router.patch(
    '/theme',
    authenticate,
    validateRequest(updateThemeValidation),
    authController.updateTheme.bind(authController)
);

// Get current user profile
router.get(
    '/me',
    authenticate,
    authController.getProfile.bind(authController)
);

export default router;

