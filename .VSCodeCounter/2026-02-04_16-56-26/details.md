# Details

Date : 2026-02-04 16:56:26

Directory /Users/gajanan/Documents/Indense/scraps/backend

Total : 80 files,  35973 codes, 1051 comments, 1489 blanks, all 38513 lines

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [backend/package-lock.json](/backend/package-lock.json) | JSON | 7,929 | 0 | 1 | 7,930 |
| [backend/package.json](/backend/package.json) | JSON | 55 | 0 | 0 | 55 |
| [backend/prisma/materialsData.ts](/backend/prisma/materialsData.ts) | TypeScript | 19,212 | 1 | 1 | 19,214 |
| [backend/prisma/migrations/20251221234553\_testing1/migration.sql](/backend/prisma/migrations/20251221234553_testing1/migration.sql) | MS SQL | 293 | 94 | 110 | 497 |
| [backend/prisma/migrations/20260116202254\_init\_with\_item\_groups/migration.sql](/backend/prisma/migrations/20260116202254_init_with_item_groups/migration.sql) | MS SQL | 33 | 23 | 16 | 72 |
| [backend/prisma/migrations/20260201113351\_auth\_multisite\_updates/migration.sql](/backend/prisma/migrations/20260201113351_auth_multisite_updates/migration.sql) | MS SQL | 43 | 32 | 23 | 98 |
| [backend/prisma/migrations/20260204091341\_pt\_vendor\_invoice\_updates/migration.sql](/backend/prisma/migrations/20260204091341_pt_vendor_invoice_updates/migration.sql) | MS SQL | 72 | 37 | 28 | 137 |
| [backend/prisma/migrations/20260204095828\_add\_reordered\_by\_relation/migration.sql](/backend/prisma/migrations/20260204095828_add_reordered_by_relation/migration.sql) | MS SQL | 1 | 1 | 1 | 3 |
| [backend/prisma/seed.ts](/backend/prisma/seed.ts) | TypeScript | 489 | 25 | 24 | 538 |
| [backend/prisma/seedMaterials.ts](/backend/prisma/seedMaterials.ts) | TypeScript | 233 | 55 | 50 | 338 |
| [backend/src/app.ts](/backend/src/app.ts) | TypeScript | 59 | 9 | 15 | 83 |
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
| [backend/src/modules/auth/auth.controller.ts](/backend/src/modules/auth/auth.controller.ts) | TypeScript | 170 | 48 | 37 | 255 |
| [backend/src/modules/auth/auth.routes.ts](/backend/src/modules/auth/auth.routes.ts) | TypeScript | 75 | 17 | 17 | 109 |
| [backend/src/modules/auth/auth.service.ts](/backend/src/modules/auth/auth.service.ts) | TypeScript | 402 | 67 | 71 | 540 |
| [backend/src/modules/auth/auth.validation.ts](/backend/src/modules/auth/auth.validation.ts) | TypeScript | 112 | 1 | 12 | 125 |
| [backend/src/modules/indents/indents.controller.ts](/backend/src/modules/indents/indents.controller.ts) | TypeScript | 174 | 0 | 21 | 195 |
| [backend/src/modules/indents/indents.routes.ts](/backend/src/modules/indents/indents.routes.ts) | TypeScript | 66 | 11 | 15 | 92 |
| [backend/src/modules/indents/indents.service.ts](/backend/src/modules/indents/indents.service.ts) | TypeScript | 495 | 67 | 87 | 649 |
| [backend/src/modules/indents/indents.stateMachine.ts](/backend/src/modules/indents/indents.stateMachine.ts) | TypeScript | 82 | 43 | 13 | 138 |
| [backend/src/modules/indents/indents.validation.ts](/backend/src/modules/indents/indents.validation.ts) | TypeScript | 53 | 0 | 6 | 59 |
| [backend/src/modules/itemGroups/itemGroups.controller.ts](/backend/src/modules/itemGroups/itemGroups.controller.ts) | TypeScript | 51 | 0 | 7 | 58 |
| [backend/src/modules/itemGroups/itemGroups.routes.ts](/backend/src/modules/itemGroups/itemGroups.routes.ts) | TypeScript | 12 | 2 | 6 | 20 |
| [backend/src/modules/itemGroups/itemGroups.service.ts](/backend/src/modules/itemGroups/itemGroups.service.ts) | TypeScript | 76 | 15 | 12 | 103 |
| [backend/src/modules/materials/materials.controller.ts](/backend/src/modules/materials/materials.controller.ts) | TypeScript | 66 | 4 | 9 | 79 |
| [backend/src/modules/materials/materials.routes.ts](/backend/src/modules/materials/materials.routes.ts) | TypeScript | 20 | 2 | 6 | 28 |
| [backend/src/modules/materials/materials.service.ts](/backend/src/modules/materials/materials.service.ts) | TypeScript | 130 | 15 | 17 | 162 |
| [backend/src/modules/materials/materials.validation.ts](/backend/src/modules/materials/materials.validation.ts) | TypeScript | 9 | 0 | 3 | 12 |
| [backend/src/modules/notifications/notifications.controller.ts](/backend/src/modules/notifications/notifications.controller.ts) | TypeScript | 64 | 0 | 9 | 73 |
| [backend/src/modules/notifications/notifications.routes.ts](/backend/src/modules/notifications/notifications.routes.ts) | TypeScript | 12 | 0 | 6 | 18 |
| [backend/src/modules/notifications/notifications.service.ts](/backend/src/modules/notifications/notifications.service.ts) | TypeScript | 139 | 34 | 23 | 196 |
| [backend/src/modules/notifications/notifications.types.ts](/backend/src/modules/notifications/notifications.types.ts) | TypeScript | 120 | 3 | 7 | 130 |
| [backend/src/modules/orders/orders.controller.ts](/backend/src/modules/orders/orders.controller.ts) | TypeScript | 149 | 0 | 13 | 162 |
| [backend/src/modules/orders/orders.routes.ts](/backend/src/modules/orders/orders.routes.ts) | TypeScript | 81 | 8 | 16 | 105 |
| [backend/src/modules/orders/orders.service.ts](/backend/src/modules/orders/orders.service.ts) | TypeScript | 405 | 26 | 61 | 492 |
| [backend/src/modules/orders/orders.validation.ts](/backend/src/modules/orders/orders.validation.ts) | TypeScript | 51 | 0 | 4 | 55 |
| [backend/src/modules/receipts/receipts.controller.ts](/backend/src/modules/receipts/receipts.controller.ts) | TypeScript | 103 | 0 | 9 | 112 |
| [backend/src/modules/receipts/receipts.routes.ts](/backend/src/modules/receipts/receipts.routes.ts) | TypeScript | 58 | 7 | 13 | 78 |
| [backend/src/modules/receipts/receipts.service.ts](/backend/src/modules/receipts/receipts.service.ts) | TypeScript | 253 | 12 | 51 | 316 |
| [backend/src/modules/receipts/receipts.validation.ts](/backend/src/modules/receipts/receipts.validation.ts) | TypeScript | 17 | 0 | 4 | 21 |
| [backend/src/modules/reports/reports.controller.ts](/backend/src/modules/reports/reports.controller.ts) | TypeScript | 160 | 5 | 27 | 192 |
| [backend/src/modules/reports/reports.routes.ts](/backend/src/modules/reports/reports.routes.ts) | TypeScript | 21 | 6 | 10 | 37 |
| [backend/src/modules/reports/reports.service.ts](/backend/src/modules/reports/reports.service.ts) | TypeScript | 554 | 32 | 85 | 671 |
| [backend/src/modules/returns/returns.controller.ts](/backend/src/modules/returns/returns.controller.ts) | TypeScript | 269 | 0 | 20 | 289 |
| [backend/src/modules/returns/returns.routes.ts](/backend/src/modules/returns/returns.routes.ts) | TypeScript | 101 | 7 | 22 | 130 |
| [backend/src/modules/returns/returns.service.ts](/backend/src/modules/returns/returns.service.ts) | TypeScript | 603 | 45 | 100 | 748 |
| [backend/src/modules/returns/returns.validation.ts](/backend/src/modules/returns/returns.validation.ts) | TypeScript | 25 | 0 | 5 | 30 |
| [backend/src/modules/sites/sites.controller.ts](/backend/src/modules/sites/sites.controller.ts) | TypeScript | 103 | 4 | 15 | 122 |
| [backend/src/modules/sites/sites.routes.ts](/backend/src/modules/sites/sites.routes.ts) | TypeScript | 39 | 6 | 9 | 54 |
| [backend/src/modules/sites/sites.service.ts](/backend/src/modules/sites/sites.service.ts) | TypeScript | 266 | 28 | 42 | 336 |
| [backend/src/modules/sites/sites.validation.ts](/backend/src/modules/sites/sites.validation.ts) | TypeScript | 44 | 0 | 4 | 48 |
| [backend/src/modules/uom/uom.controller.ts](/backend/src/modules/uom/uom.controller.ts) | TypeScript | 51 | 0 | 7 | 58 |
| [backend/src/modules/uom/uom.routes.ts](/backend/src/modules/uom/uom.routes.ts) | TypeScript | 12 | 2 | 6 | 20 |
| [backend/src/modules/uom/uom.service.ts](/backend/src/modules/uom/uom.service.ts) | TypeScript | 82 | 15 | 12 | 109 |
| [backend/src/modules/users/users.controller.ts](/backend/src/modules/users/users.controller.ts) | TypeScript | 135 | 0 | 16 | 151 |
| [backend/src/modules/users/users.routes.ts](/backend/src/modules/users/users.routes.ts) | TypeScript | 33 | 3 | 6 | 42 |
| [backend/src/modules/users/users.service.ts](/backend/src/modules/users/users.service.ts) | TypeScript | 397 | 47 | 48 | 492 |
| [backend/src/modules/users/users.validation.ts](/backend/src/modules/users/users.validation.ts) | TypeScript | 42 | 0 | 4 | 46 |
| [backend/src/types/enums.ts](/backend/src/types/enums.ts) | TypeScript | 50 | 11 | 10 | 71 |
| [backend/src/types/express.d.ts](/backend/src/types/express.d.ts) | TypeScript | 30 | 4 | 6 | 40 |
| [backend/src/types/index.ts](/backend/src/types/index.ts) | TypeScript | 2 | 0 | 1 | 3 |
| [backend/src/types/models.ts](/backend/src/types/models.ts) | TypeScript | 245 | 15 | 31 | 291 |
| [backend/src/utils/errors.ts](/backend/src/utils/errors.ts) | TypeScript | 67 | 9 | 14 | 90 |
| [backend/src/utils/index.ts](/backend/src/utils/index.ts) | TypeScript | 4 | 0 | 1 | 5 |
| [backend/src/utils/logger.ts](/backend/src/utils/logger.ts) | TypeScript | 48 | 4 | 10 | 62 |
| [backend/src/utils/pagination.ts](/backend/src/utils/pagination.ts) | TypeScript | 44 | 9 | 9 | 62 |
| [backend/src/utils/pushNotifications.ts](/backend/src/utils/pushNotifications.ts) | TypeScript | 116 | 21 | 20 | 157 |
| [backend/src/utils/visibility.ts](/backend/src/utils/visibility.ts) | TypeScript | 52 | 19 | 15 | 86 |
| [backend/tsconfig.json](/backend/tsconfig.json) | JSON with Comments | 51 | 0 | 0 | 51 |

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)