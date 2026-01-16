import { Router } from 'express';
import { uomController } from './uom.controller';
import { authenticate } from '../../middleware/authenticate';
import { requireHeadOffice } from '../../middleware/authorize';

const router = Router();

router.use(authenticate);

// All authenticated users can read UOMs
router.get('/', uomController.findAll.bind(uomController));
router.get('/dropdown', uomController.getForDropdown.bind(uomController));
router.get('/:id', uomController.findById.bind(uomController));

// Only head office (Purchase Team / Director) can create/update
router.post('/', requireHeadOffice, uomController.create.bind(uomController));
router.patch('/:id', requireHeadOffice, uomController.update.bind(uomController));

export default router;
