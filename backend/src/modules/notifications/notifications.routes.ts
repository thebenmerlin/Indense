import { Router } from 'express';
import { notificationsController } from './notifications.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

router.use(authenticate);

router.get('/', notificationsController.findAll.bind(notificationsController));
router.get('/unread-count', notificationsController.getUnreadCount.bind(notificationsController));
router.post('/:id/read', notificationsController.markAsRead.bind(notificationsController));
router.post('/read-all', notificationsController.markAllAsRead.bind(notificationsController));

export default router;
