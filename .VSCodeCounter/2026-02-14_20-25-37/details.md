# Details

Date : 2026-02-14 20:25:37

Directory /Users/gajanan/Documents/Indense/scraps/backend

Total : 82 files,  37296 codes, 1181 comments, 1623 blanks, all 40100 lines

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [backend/package-lock.json](/backend/package-lock.json) | JSON | 7,929 | 0 | 1 | 7,930 |
| [backend/package.json](/backend/package.json) | JSON | 58 | 0 | 1 | 59 |
| [backend/prisma/materialsData.ts](/backend/prisma/materialsData.ts) | TypeScript | 19,212 | 1 | 1 | 19,214 |
| [backend/prisma/migrations/20251221234553\_testing1/migration.sql](/backend/prisma/migrations/20251221234553_testing1/migration.sql) | MS SQL | 293 | 94 | 110 | 497 |
| [backend/prisma/migrations/20260116202254\_init\_with\_item\_groups/migration.sql](/backend/prisma/migrations/20260116202254_init_with_item_groups/migration.sql) | MS SQL | 33 | 23 | 16 | 72 |
| [backend/prisma/migrations/20260201113351\_auth\_multisite\_updates/migration.sql](/backend/prisma/migrations/20260201113351_auth_multisite_updates/migration.sql) | MS SQL | 43 | 32 | 23 | 98 |
| [backend/prisma/migrations/20260204091341\_pt\_vendor\_invoice\_updates/migration.sql](/backend/prisma/migrations/20260204091341_pt_vendor_invoice_updates/migration.sql) | MS SQL | 72 | 37 | 28 | 137 |
| [backend/prisma/migrations/20260204095828\_add\_reordered\_by\_relation/migration.sql](/backend/prisma/migrations/20260204095828_add_reordered_by_relation/migration.sql) | MS SQL | 1 | 1 | 1 | 3 |
| [backend/prisma/migrations/20260207111446\_add\_allowed\_roles/migration.sql](/backend/prisma/migrations/20260207111446_add_allowed_roles/migration.sql) | MS SQL | 11 | 3 | 3 | 17 |
| [backend/prisma/migrations/20260207205830\_add\_reorder\_tracking\_to\_order\_item/migration.sql](/backend/prisma/migrations/20260207205830_add_reorder_tracking_to_order_item/migration.sql) | MS SQL | 4 | 3 | 3 | 10 |
| [backend/prisma/seed.ts](/backend/prisma/seed.ts) | TypeScript | 1,135 | 84 | 56 | 1,275 |
| [backend/prisma/seedMaterials.ts](/backend/prisma/seedMaterials.ts) | TypeScript | 233 | 55 | 50 | 338 |
| [backend/src/app.ts](/backend/src/app.ts) | TypeScript | 62 | 10 | 16 | 88 |
| [backend/src/config/auth.ts](/backend/src/config/auth.ts) | TypeScript | 15 | 0 | 5 | 20 |
| [backend/src/config/database.ts](/backend/src/config/database.ts) | TypeScript | 12 | 2 | 5 | 19 |
| [backend/src/config/index.ts](/backend/src/config/index.ts) | TypeScript | 22 | 0 | 8 | 30 |
| [backend/src/config/storage.ts](/backend/src/config/storage.ts) | TypeScript | 15 | 0 | 5 | 20 |
| [backend/src/index.ts](/backend/src/index.ts) | TypeScript | 37 | 5 | 10 | 52 |
| [backend/src/middleware/auditLog.ts](/backend/src/middleware/auditLog.ts) | TypeScript | 81 | 15 | 11 | 107 |
| [backend/src/middleware/authenticate.ts](/backend/src/middleware/authenticate.ts) | TypeScript | 72 | 12 | 15 | 99 |
| [backend/src/middleware/authorize.ts](/backend/src/middleware/authorize.ts) | TypeScript | 29 | 20 | 11 | 60 |
| [backend/src/middleware/errorHandler.ts](/backend/src/middleware/errorHandler.ts) | TypeScript | 85 | 15 | 14 | 114 |
| [backend/src/middleware/index.ts](/backend/src/middleware/index.ts) | TypeScript | 6 | 0 | 1 | 7 |
| [backend/src/middleware/siteFilter.ts](/backend/src/middleware/siteFilter.ts) | TypeScript | 64 | 24 | 16 | 104 |
| [backend/src/middleware/validateRequest.ts](/backend/src/middleware/validateRequest.ts) | TypeScript | 25 | 7 | 9 | 41 |
| [backend/src/modules/auth/auth.controller.ts](/backend/src/modules/auth/auth.controller.ts) | TypeScript | 183 | 52 | 40 | 275 |
| [backend/src/modules/auth/auth.routes.ts](/backend/src/modules/auth/auth.routes.ts) | TypeScript | 82 | 18 | 18 | 118 |
| [backend/src/modules/auth/auth.service.ts](/backend/src/modules/auth/auth.service.ts) | TypeScript | 457 | 73 | 76 | 606 |
| [backend/src/modules/auth/auth.validation.ts](/backend/src/modules/auth/auth.validation.ts) | TypeScript | 117 | 1 | 12 | 130 |
| [backend/src/modules/indents/indents.controller.ts](/backend/src/modules/indents/indents.controller.ts) | TypeScript | 174 | 0 | 21 | 195 |
| [backend/src/modules/indents/indents.routes.ts](/backend/src/modules/indents/indents.routes.ts) | TypeScript | 66 | 11 | 15 | 92 |
| [backend/src/modules/indents/indents.service.ts](/backend/src/modules/indents/indents.service.ts) | TypeScript | 708 | 79 | 120 | 907 |
| [backend/src/modules/indents/indents.stateMachine.ts](/backend/src/modules/indents/indents.stateMachine.ts) | TypeScript | 82 | 43 | 13 | 138 |
| [backend/src/modules/indents/indents.validation.ts](/backend/src/modules/indents/indents.validation.ts) | TypeScript | 71 | 3 | 6 | 80 |
| [backend/src/modules/itemGroups/itemGroups.controller.ts](/backend/src/modules/itemGroups/itemGroups.controller.ts) | TypeScript | 51 | 0 | 7 | 58 |
| [backend/src/modules/itemGroups/itemGroups.routes.ts](/backend/src/modules/itemGroups/itemGroups.routes.ts) | TypeScript | 12 | 2 | 6 | 20 |
| [backend/src/modules/itemGroups/itemGroups.service.ts](/backend/src/modules/itemGroups/itemGroups.service.ts) | TypeScript | 76 | 15 | 12 | 103 |
| [backend/src/modules/materials/materials.controller.ts](/backend/src/modules/materials/materials.controller.ts) | TypeScript | 74 | 4 | 10 | 88 |
| [backend/src/modules/materials/materials.routes.ts](/backend/src/modules/materials/materials.routes.ts) | TypeScript | 25 | 3 | 7 | 35 |
| [backend/src/modules/materials/materials.service.ts](/backend/src/modules/materials/materials.service.ts) | TypeScript | 221 | 36 | 33 | 290 |
| [backend/src/modules/materials/materials.validation.ts](/backend/src/modules/materials/materials.validation.ts) | TypeScript | 9 | 0 | 3 | 12 |
| [backend/src/modules/notifications/notifications.controller.ts](/backend/src/modules/notifications/notifications.controller.ts) | TypeScript | 64 | 0 | 9 | 73 |
| [backend/src/modules/notifications/notifications.routes.ts](/backend/src/modules/notifications/notifications.routes.ts) | TypeScript | 12 | 0 | 6 | 18 |
| [backend/src/modules/notifications/notifications.service.ts](/backend/src/modules/notifications/notifications.service.ts) | TypeScript | 150 | 34 | 24 | 208 |
| [backend/src/modules/notifications/notifications.types.ts](/backend/src/modules/notifications/notifications.types.ts) | TypeScript | 132 | 3 | 7 | 142 |
| [backend/src/modules/orders/orders.controller.ts](/backend/src/modules/orders/orders.controller.ts) | TypeScript | 149 | 0 | 13 | 162 |
| [backend/src/modules/orders/orders.routes.ts](/backend/src/modules/orders/orders.routes.ts) | TypeScript | 81 | 8 | 16 | 105 |
| [backend/src/modules/orders/orders.service.ts](/backend/src/modules/orders/orders.service.ts) | TypeScript | 421 | 26 | 63 | 510 |
| [backend/src/modules/orders/orders.validation.ts](/backend/src/modules/orders/orders.validation.ts) | TypeScript | 51 | 0 | 4 | 55 |
| [backend/src/modules/receipts/receipts.controller.ts](/backend/src/modules/receipts/receipts.controller.ts) | TypeScript | 103 | 0 | 9 | 112 |
| [backend/src/modules/receipts/receipts.routes.ts](/backend/src/modules/receipts/receipts.routes.ts) | TypeScript | 58 | 7 | 13 | 78 |
| [backend/src/modules/receipts/receipts.service.ts](/backend/src/modules/receipts/receipts.service.ts) | TypeScript | 283 | 12 | 55 | 350 |
| [backend/src/modules/receipts/receipts.validation.ts](/backend/src/modules/receipts/receipts.validation.ts) | TypeScript | 17 | 0 | 4 | 21 |
| [backend/src/modules/reports/reports.controller.ts](/backend/src/modules/reports/reports.controller.ts) | TypeScript | 160 | 5 | 27 | 192 |
| [backend/src/modules/reports/reports.routes.ts](/backend/src/modules/reports/reports.routes.ts) | TypeScript | 21 | 6 | 10 | 37 |
| [backend/src/modules/reports/reports.service.ts](/backend/src/modules/reports/reports.service.ts) | TypeScript | 554 | 32 | 85 | 671 |
| [backend/src/modules/returns/returns.controller.ts](/backend/src/modules/returns/returns.controller.ts) | TypeScript | 269 | 0 | 20 | 289 |
| [backend/src/modules/returns/returns.routes.ts](/backend/src/modules/returns/returns.routes.ts) | TypeScript | 101 | 7 | 22 | 130 |
| [backend/src/modules/returns/returns.service.ts](/backend/src/modules/returns/returns.service.ts) | TypeScript | 645 | 50 | 107 | 802 |
| [backend/src/modules/returns/returns.validation.ts](/backend/src/modules/returns/returns.validation.ts) | TypeScript | 25 | 0 | 5 | 30 |
| [backend/src/modules/sites/sites.controller.ts](/backend/src/modules/sites/sites.controller.ts) | TypeScript | 103 | 4 | 15 | 122 |
| [backend/src/modules/sites/sites.routes.ts](/backend/src/modules/sites/sites.routes.ts) | TypeScript | 39 | 6 | 9 | 54 |
| [backend/src/modules/sites/sites.service.ts](/backend/src/modules/sites/sites.service.ts) | TypeScript | 280 | 28 | 44 | 352 |
| [backend/src/modules/sites/sites.validation.ts](/backend/src/modules/sites/sites.validation.ts) | TypeScript | 44 | 0 | 4 | 48 |
| [backend/src/modules/uom/uom.controller.ts](/backend/src/modules/uom/uom.controller.ts) | TypeScript | 51 | 0 | 7 | 58 |
| [backend/src/modules/uom/uom.routes.ts](/backend/src/modules/uom/uom.routes.ts) | TypeScript | 12 | 2 | 6 | 20 |
| [backend/src/modules/uom/uom.service.ts](/backend/src/modules/uom/uom.service.ts) | TypeScript | 82 | 15 | 12 | 109 |
| [backend/src/modules/users/users.controller.ts](/backend/src/modules/users/users.controller.ts) | TypeScript | 151 | 0 | 17 | 168 |
| [backend/src/modules/users/users.routes.ts](/backend/src/modules/users/users.routes.ts) | TypeScript | 34 | 3 | 7 | 44 |
| [backend/src/modules/users/users.service.ts](/backend/src/modules/users/users.service.ts) | TypeScript | 476 | 57 | 62 | 595 |
| [backend/src/modules/users/users.validation.ts](/backend/src/modules/users/users.validation.ts) | TypeScript | 42 | 0 | 4 | 46 |
| [backend/src/types/enums.ts](/backend/src/types/enums.ts) | TypeScript | 50 | 11 | 10 | 71 |
| [backend/src/types/express.d.ts](/backend/src/types/express.d.ts) | TypeScript | 30 | 4 | 6 | 40 |
| [backend/src/types/index.ts](/backend/src/types/index.ts) | TypeScript | 2 | 0 | 1 | 3 |
| [backend/src/types/models.ts](/backend/src/types/models.ts) | TypeScript | 265 | 16 | 33 | 314 |
| [backend/src/utils/errors.ts](/backend/src/utils/errors.ts) | TypeScript | 67 | 9 | 14 | 90 |
| [backend/src/utils/index.ts](/backend/src/utils/index.ts) | TypeScript | 4 | 0 | 1 | 5 |
| [backend/src/utils/logger.ts](/backend/src/utils/logger.ts) | TypeScript | 48 | 4 | 10 | 62 |
| [backend/src/utils/pagination.ts](/backend/src/utils/pagination.ts) | TypeScript | 44 | 9 | 9 | 62 |
| [backend/src/utils/pushNotifications.ts](/backend/src/utils/pushNotifications.ts) | TypeScript | 116 | 21 | 20 | 157 |
| [backend/src/utils/visibility.ts](/backend/src/utils/visibility.ts) | TypeScript | 52 | 19 | 15 | 86 |
| [backend/tsconfig.json](/backend/tsconfig.json) | JSON with Comments | 51 | 0 | 0 | 51 |

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)