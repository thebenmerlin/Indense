import { Router } from 'express';
import { itemGroupsController } from './itemGroups.controller';
import { authenticate } from '../../middleware/authenticate';
import { requireHeadOffice } from '../../middleware/authorize';

const router = Router();

router.use(authenticate);

// All authenticated users can read item groups
router.get('/', itemGroupsController.findAll.bind(itemGroupsController));
router.get('/names', itemGroupsController.getNames.bind(itemGroupsController));
router.get('/:id', itemGroupsController.findById.bind(itemGroupsController));

// Only head office (Purchase Team / Director) can create/update
router.post('/', requireHeadOffice, itemGroupsController.create.bind(itemGroupsController));
router.patch('/:id', requireHeadOffice, itemGroupsController.update.bind(itemGroupsController));

export default router;
