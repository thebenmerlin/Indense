import { Router } from 'express';
import { materialsController } from './materials.controller';
import { authenticate } from '../../middleware/authenticate';
import { requireHeadOffice } from '../../middleware/authorize';
import { validateRequest } from '../../middleware/validateRequest';
import { createMaterialValidation } from './materials.validation';

const router = Router();

router.use(authenticate);

// All authenticated users can read materials
router.get('/', materialsController.findAll.bind(materialsController));
router.get('/categories', materialsController.getCategories.bind(materialsController));
router.get('/units', materialsController.getUnits.bind(materialsController));
router.get('/search', materialsController.searchAutocomplete.bind(materialsController));  // Fast autocomplete
router.get('/:id', materialsController.findById.bind(materialsController));

// Only head office can create materials
router.post(
    '/',
    requireHeadOffice,
    validateRequest(createMaterialValidation),
    materialsController.create.bind(materialsController)
);

export default router;
