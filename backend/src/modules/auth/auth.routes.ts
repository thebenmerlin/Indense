import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '../../middleware/authenticate';
import { validateRequest } from '../../middleware/validateRequest';
import {
    loginValidation,
    refreshTokenValidation,
    changePasswordValidation
} from './auth.validation';

const router = Router();

// Public routes
router.post(
    '/login',
    validateRequest(loginValidation),
    authController.login.bind(authController)
);

router.post(
    '/refresh',
    validateRequest(refreshTokenValidation),
    authController.refreshToken.bind(authController)
);

// Protected routes
router.post(
    '/logout',
    authenticate,
    authController.logout.bind(authController)
);

router.post(
    '/change-password',
    authenticate,
    validateRequest(changePasswordValidation),
    authController.changePassword.bind(authController)
);

router.get(
    '/me',
    authenticate,
    authController.getProfile.bind(authController)
);

export default router;
