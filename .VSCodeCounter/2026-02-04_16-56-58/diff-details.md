# Diff Details

Date : 2026-02-04 16:56:58

Directory /Users/gajanan/Documents/Indense/scraps/mobile

Total : 202 files,  -2945 codes, -277 comments, 274 blanks, all -2948 lines

[Summary](results.md) / [Details](details.md) / [Diff Summary](diff.md) / Diff Details

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [backend/package-lock.json](/backend/package-lock.json) | JSON | -7,929 | 0 | -1 | -7,930 |
| [backend/package.json](/backend/package.json) | JSON | -55 | 0 | 0 | -55 |
| [backend/prisma/materialsData.ts](/backend/prisma/materialsData.ts) | TypeScript | -19,212 | -1 | -1 | -19,214 |
| [backend/prisma/migrations/20251221234553\_testing1/migration.sql](/backend/prisma/migrations/20251221234553_testing1/migration.sql) | MS SQL | -293 | -94 | -110 | -497 |
| [backend/prisma/migrations/20260116202254\_init\_with\_item\_groups/migration.sql](/backend/prisma/migrations/20260116202254_init_with_item_groups/migration.sql) | MS SQL | -33 | -23 | -16 | -72 |
| [backend/prisma/migrations/20260201113351\_auth\_multisite\_updates/migration.sql](/backend/prisma/migrations/20260201113351_auth_multisite_updates/migration.sql) | MS SQL | -43 | -32 | -23 | -98 |
| [backend/prisma/migrations/20260204091341\_pt\_vendor\_invoice\_updates/migration.sql](/backend/prisma/migrations/20260204091341_pt_vendor_invoice_updates/migration.sql) | MS SQL | -72 | -37 | -28 | -137 |
| [backend/prisma/migrations/20260204095828\_add\_reordered\_by\_relation/migration.sql](/backend/prisma/migrations/20260204095828_add_reordered_by_relation/migration.sql) | MS SQL | -1 | -1 | -1 | -3 |
| [backend/prisma/seed.ts](/backend/prisma/seed.ts) | TypeScript | -489 | -25 | -24 | -538 |
| [backend/prisma/seedMaterials.ts](/backend/prisma/seedMaterials.ts) | TypeScript | -233 | -55 | -50 | -338 |
| [backend/src/app.ts](/backend/src/app.ts) | TypeScript | -59 | -9 | -15 | -83 |
| [backend/src/config/auth.ts](/backend/src/config/auth.ts) | TypeScript | -15 | 0 | -5 | -20 |
| [backend/src/config/database.ts](/backend/src/config/database.ts) | TypeScript | -12 | -2 | -5 | -19 |
| [backend/src/config/index.ts](/backend/src/config/index.ts) | TypeScript | -22 | 0 | -8 | -30 |
| [backend/src/config/storage.ts](/backend/src/config/storage.ts) | TypeScript | -15 | 0 | -5 | -20 |
| [backend/src/index.ts](/backend/src/index.ts) | TypeScript | -37 | -5 | -10 | -52 |
| [backend/src/middleware/auditLog.ts](/backend/src/middleware/auditLog.ts) | TypeScript | -81 | -15 | -11 | -107 |
| [backend/src/middleware/authenticate.ts](/backend/src/middleware/authenticate.ts) | TypeScript | -72 | -12 | -15 | -99 |
| [backend/src/middleware/authorize.ts](/backend/src/middleware/authorize.ts) | TypeScript | -29 | -20 | -11 | -60 |
| [backend/src/middleware/errorHandler.ts](/backend/src/middleware/errorHandler.ts) | TypeScript | -85 | -15 | -14 | -114 |
| [backend/src/middleware/index.ts](/backend/src/middleware/index.ts) | TypeScript | -6 | 0 | -1 | -7 |
| [backend/src/middleware/siteFilter.ts](/backend/src/middleware/siteFilter.ts) | TypeScript | -64 | -24 | -16 | -104 |
| [backend/src/middleware/validateRequest.ts](/backend/src/middleware/validateRequest.ts) | TypeScript | -25 | -7 | -9 | -41 |
| [backend/src/modules/auth/auth.controller.ts](/backend/src/modules/auth/auth.controller.ts) | TypeScript | -170 | -48 | -37 | -255 |
| [backend/src/modules/auth/auth.routes.ts](/backend/src/modules/auth/auth.routes.ts) | TypeScript | -75 | -17 | -17 | -109 |
| [backend/src/modules/auth/auth.service.ts](/backend/src/modules/auth/auth.service.ts) | TypeScript | -402 | -67 | -71 | -540 |
| [backend/src/modules/auth/auth.validation.ts](/backend/src/modules/auth/auth.validation.ts) | TypeScript | -112 | -1 | -12 | -125 |
| [backend/src/modules/indents/indents.controller.ts](/backend/src/modules/indents/indents.controller.ts) | TypeScript | -174 | 0 | -21 | -195 |
| [backend/src/modules/indents/indents.routes.ts](/backend/src/modules/indents/indents.routes.ts) | TypeScript | -66 | -11 | -15 | -92 |
| [backend/src/modules/indents/indents.service.ts](/backend/src/modules/indents/indents.service.ts) | TypeScript | -495 | -67 | -87 | -649 |
| [backend/src/modules/indents/indents.stateMachine.ts](/backend/src/modules/indents/indents.stateMachine.ts) | TypeScript | -82 | -43 | -13 | -138 |
| [backend/src/modules/indents/indents.validation.ts](/backend/src/modules/indents/indents.validation.ts) | TypeScript | -53 | 0 | -6 | -59 |
| [backend/src/modules/itemGroups/itemGroups.controller.ts](/backend/src/modules/itemGroups/itemGroups.controller.ts) | TypeScript | -51 | 0 | -7 | -58 |
| [backend/src/modules/itemGroups/itemGroups.routes.ts](/backend/src/modules/itemGroups/itemGroups.routes.ts) | TypeScript | -12 | -2 | -6 | -20 |
| [backend/src/modules/itemGroups/itemGroups.service.ts](/backend/src/modules/itemGroups/itemGroups.service.ts) | TypeScript | -76 | -15 | -12 | -103 |
| [backend/src/modules/materials/materials.controller.ts](/backend/src/modules/materials/materials.controller.ts) | TypeScript | -66 | -4 | -9 | -79 |
| [backend/src/modules/materials/materials.routes.ts](/backend/src/modules/materials/materials.routes.ts) | TypeScript | -20 | -2 | -6 | -28 |
| [backend/src/modules/materials/materials.service.ts](/backend/src/modules/materials/materials.service.ts) | TypeScript | -130 | -15 | -17 | -162 |
| [backend/src/modules/materials/materials.validation.ts](/backend/src/modules/materials/materials.validation.ts) | TypeScript | -9 | 0 | -3 | -12 |
| [backend/src/modules/notifications/notifications.controller.ts](/backend/src/modules/notifications/notifications.controller.ts) | TypeScript | -64 | 0 | -9 | -73 |
| [backend/src/modules/notifications/notifications.routes.ts](/backend/src/modules/notifications/notifications.routes.ts) | TypeScript | -12 | 0 | -6 | -18 |
| [backend/src/modules/notifications/notifications.service.ts](/backend/src/modules/notifications/notifications.service.ts) | TypeScript | -139 | -34 | -23 | -196 |
| [backend/src/modules/notifications/notifications.types.ts](/backend/src/modules/notifications/notifications.types.ts) | TypeScript | -120 | -3 | -7 | -130 |
| [backend/src/modules/orders/orders.controller.ts](/backend/src/modules/orders/orders.controller.ts) | TypeScript | -149 | 0 | -13 | -162 |
| [backend/src/modules/orders/orders.routes.ts](/backend/src/modules/orders/orders.routes.ts) | TypeScript | -81 | -8 | -16 | -105 |
| [backend/src/modules/orders/orders.service.ts](/backend/src/modules/orders/orders.service.ts) | TypeScript | -405 | -26 | -61 | -492 |
| [backend/src/modules/orders/orders.validation.ts](/backend/src/modules/orders/orders.validation.ts) | TypeScript | -51 | 0 | -4 | -55 |
| [backend/src/modules/receipts/receipts.controller.ts](/backend/src/modules/receipts/receipts.controller.ts) | TypeScript | -103 | 0 | -9 | -112 |
| [backend/src/modules/receipts/receipts.routes.ts](/backend/src/modules/receipts/receipts.routes.ts) | TypeScript | -58 | -7 | -13 | -78 |
| [backend/src/modules/receipts/receipts.service.ts](/backend/src/modules/receipts/receipts.service.ts) | TypeScript | -253 | -12 | -51 | -316 |
| [backend/src/modules/receipts/receipts.validation.ts](/backend/src/modules/receipts/receipts.validation.ts) | TypeScript | -17 | 0 | -4 | -21 |
| [backend/src/modules/reports/reports.controller.ts](/backend/src/modules/reports/reports.controller.ts) | TypeScript | -160 | -5 | -27 | -192 |
| [backend/src/modules/reports/reports.routes.ts](/backend/src/modules/reports/reports.routes.ts) | TypeScript | -21 | -6 | -10 | -37 |
| [backend/src/modules/reports/reports.service.ts](/backend/src/modules/reports/reports.service.ts) | TypeScript | -554 | -32 | -85 | -671 |
| [backend/src/modules/returns/returns.controller.ts](/backend/src/modules/returns/returns.controller.ts) | TypeScript | -269 | 0 | -20 | -289 |
| [backend/src/modules/returns/returns.routes.ts](/backend/src/modules/returns/returns.routes.ts) | TypeScript | -101 | -7 | -22 | -130 |
| [backend/src/modules/returns/returns.service.ts](/backend/src/modules/returns/returns.service.ts) | TypeScript | -603 | -45 | -100 | -748 |
| [backend/src/modules/returns/returns.validation.ts](/backend/src/modules/returns/returns.validation.ts) | TypeScript | -25 | 0 | -5 | -30 |
| [backend/src/modules/sites/sites.controller.ts](/backend/src/modules/sites/sites.controller.ts) | TypeScript | -103 | -4 | -15 | -122 |
| [backend/src/modules/sites/sites.routes.ts](/backend/src/modules/sites/sites.routes.ts) | TypeScript | -39 | -6 | -9 | -54 |
| [backend/src/modules/sites/sites.service.ts](/backend/src/modules/sites/sites.service.ts) | TypeScript | -266 | -28 | -42 | -336 |
| [backend/src/modules/sites/sites.validation.ts](/backend/src/modules/sites/sites.validation.ts) | TypeScript | -44 | 0 | -4 | -48 |
| [backend/src/modules/uom/uom.controller.ts](/backend/src/modules/uom/uom.controller.ts) | TypeScript | -51 | 0 | -7 | -58 |
| [backend/src/modules/uom/uom.routes.ts](/backend/src/modules/uom/uom.routes.ts) | TypeScript | -12 | -2 | -6 | -20 |
| [backend/src/modules/uom/uom.service.ts](/backend/src/modules/uom/uom.service.ts) | TypeScript | -82 | -15 | -12 | -109 |
| [backend/src/modules/users/users.controller.ts](/backend/src/modules/users/users.controller.ts) | TypeScript | -135 | 0 | -16 | -151 |
| [backend/src/modules/users/users.routes.ts](/backend/src/modules/users/users.routes.ts) | TypeScript | -33 | -3 | -6 | -42 |
| [backend/src/modules/users/users.service.ts](/backend/src/modules/users/users.service.ts) | TypeScript | -397 | -47 | -48 | -492 |
| [backend/src/modules/users/users.validation.ts](/backend/src/modules/users/users.validation.ts) | TypeScript | -42 | 0 | -4 | -46 |
| [backend/src/types/enums.ts](/backend/src/types/enums.ts) | TypeScript | -50 | -11 | -10 | -71 |
| [backend/src/types/express.d.ts](/backend/src/types/express.d.ts) | TypeScript | -30 | -4 | -6 | -40 |
| [backend/src/types/index.ts](/backend/src/types/index.ts) | TypeScript | -2 | 0 | -1 | -3 |
| [backend/src/types/models.ts](/backend/src/types/models.ts) | TypeScript | -245 | -15 | -31 | -291 |
| [backend/src/utils/errors.ts](/backend/src/utils/errors.ts) | TypeScript | -67 | -9 | -14 | -90 |
| [backend/src/utils/index.ts](/backend/src/utils/index.ts) | TypeScript | -4 | 0 | -1 | -5 |
| [backend/src/utils/logger.ts](/backend/src/utils/logger.ts) | TypeScript | -48 | -4 | -10 | -62 |
| [backend/src/utils/pagination.ts](/backend/src/utils/pagination.ts) | TypeScript | -44 | -9 | -9 | -62 |
| [backend/src/utils/pushNotifications.ts](/backend/src/utils/pushNotifications.ts) | TypeScript | -116 | -21 | -20 | -157 |
| [backend/src/utils/visibility.ts](/backend/src/utils/visibility.ts) | TypeScript | -52 | -19 | -15 | -86 |
| [backend/tsconfig.json](/backend/tsconfig.json) | JSON with Comments | -51 | 0 | 0 | -51 |
| [mobile/android/app/build.gradle](/mobile/android/app/build.gradle) | Gradle | 92 | 68 | 23 | 183 |
| [mobile/android/app/src/debug/AndroidManifest.xml](/mobile/android/app/src/debug/AndroidManifest.xml) | XML | 5 | 0 | 3 | 8 |
| [mobile/android/app/src/debugOptimized/AndroidManifest.xml](/mobile/android/app/src/debugOptimized/AndroidManifest.xml) | XML | 5 | 0 | 3 | 8 |
| [mobile/android/app/src/main/AndroidManifest.xml](/mobile/android/app/src/main/AndroidManifest.xml) | XML | 32 | 0 | 0 | 32 |
| [mobile/android/app/src/main/res/drawable/ic\_launcher\_background.xml](/mobile/android/app/src/main/res/drawable/ic_launcher_background.xml) | XML | 6 | 0 | 0 | 6 |
| [mobile/android/app/src/main/res/drawable/rn\_edit\_text\_material.xml](/mobile/android/app/src/main/res/drawable/rn_edit_text_material.xml) | XML | 12 | 23 | 3 | 38 |
| [mobile/android/app/src/main/res/mipmap-anydpi-v26/ic\_launcher.xml](/mobile/android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml) | XML | 5 | 0 | 0 | 5 |
| [mobile/android/app/src/main/res/mipmap-anydpi-v26/ic\_launcher\_round.xml](/mobile/android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml) | XML | 5 | 0 | 0 | 5 |
| [mobile/android/app/src/main/res/values-night/colors.xml](/mobile/android/app/src/main/res/values-night/colors.xml) | XML | 1 | 0 | 0 | 1 |
| [mobile/android/app/src/main/res/values/colors.xml](/mobile/android/app/src/main/res/values/colors.xml) | XML | 6 | 0 | 0 | 6 |
| [mobile/android/app/src/main/res/values/strings.xml](/mobile/android/app/src/main/res/values/strings.xml) | XML | 5 | 0 | 0 | 5 |
| [mobile/android/app/src/main/res/values/styles.xml](/mobile/android/app/src/main/res/values/styles.xml) | XML | 14 | 0 | 0 | 14 |
| [mobile/android/build.gradle](/mobile/android/build.gradle) | Gradle | 20 | 1 | 4 | 25 |
| [mobile/android/gradle.properties](/mobile/android/gradle.properties) | Java Properties | 14 | 37 | 15 | 66 |
| [mobile/android/gradle/wrapper/gradle-wrapper.properties](/mobile/android/gradle/wrapper/gradle-wrapper.properties) | Java Properties | 7 | 0 | 1 | 8 |
| [mobile/android/gradlew.bat](/mobile/android/gradlew.bat) | Batch | 41 | 32 | 22 | 95 |
| [mobile/android/settings.gradle](/mobile/android/settings.gradle) | Gradle | 33 | 0 | 7 | 40 |
| [mobile/app.json](/mobile/app.json) | JSON | 50 | 0 | 0 | 50 |
| [mobile/app/(auth)/\_layout.tsx](/mobile/app/(auth)/_layout.tsx) | TypeScript JSX | 9 | 0 | 2 | 11 |
| [mobile/app/(auth)/forgot-password.tsx](/mobile/app/(auth)/forgot-password.tsx) | TypeScript JSX | 519 | 8 | 43 | 570 |
| [mobile/app/(auth)/login.tsx](/mobile/app/(auth)/login.tsx) | TypeScript JSX | 348 | 4 | 28 | 380 |
| [mobile/app/(auth)/register.tsx](/mobile/app/(auth)/register.tsx) | TypeScript JSX | 678 | 5 | 58 | 741 |
| [mobile/app/(director)/\_layout.tsx](/mobile/app/(director)/_layout.tsx) | TypeScript JSX | 42 | 0 | 2 | 44 |
| [mobile/app/(director)/account.tsx](/mobile/app/(director)/account.tsx) | TypeScript JSX | 367 | 9 | 15 | 391 |
| [mobile/app/(director)/analytics/damage-report.tsx](/mobile/app/(director)/analytics/damage-report.tsx) | TypeScript JSX | 192 | 3 | 16 | 211 |
| [mobile/app/(director)/analytics/financial.tsx](/mobile/app/(director)/analytics/financial.tsx) | TypeScript JSX | 207 | 5 | 16 | 228 |
| [mobile/app/(director)/analytics/index.tsx](/mobile/app/(director)/analytics/index.tsx) | TypeScript JSX | 318 | 6 | 18 | 342 |
| [mobile/app/(director)/analytics/materials.tsx](/mobile/app/(director)/analytics/materials.tsx) | TypeScript JSX | 145 | 1 | 10 | 156 |
| [mobile/app/(director)/analytics/vendors.tsx](/mobile/app/(director)/analytics/vendors.tsx) | TypeScript JSX | 167 | 1 | 13 | 181 |
| [mobile/app/(director)/dashboard.tsx](/mobile/app/(director)/dashboard.tsx) | TypeScript JSX | 159 | 4 | 14 | 177 |
| [mobile/app/(director)/indents/\[id\].tsx](/mobile/app/(director)/indents/%5Bid%5D.tsx) | TypeScript JSX | 322 | 0 | 19 | 341 |
| [mobile/app/(director)/indents/all/\[id\].tsx](/mobile/app/(director)/indents/all/%5Bid%5D.tsx) | TypeScript JSX | 344 | 6 | 22 | 372 |
| [mobile/app/(director)/indents/all/index.tsx](/mobile/app/(director)/indents/all/index.tsx) | TypeScript JSX | 236 | 3 | 17 | 256 |
| [mobile/app/(director)/indents/damaged/\[id\].tsx](/mobile/app/(director)/indents/damaged/%5Bid%5D.tsx) | TypeScript JSX | 277 | 5 | 20 | 302 |
| [mobile/app/(director)/indents/damaged/index.tsx](/mobile/app/(director)/indents/damaged/index.tsx) | TypeScript JSX | 177 | 2 | 13 | 192 |
| [mobile/app/(director)/indents/index.tsx](/mobile/app/(director)/indents/index.tsx) | TypeScript JSX | 191 | 0 | 11 | 202 |
| [mobile/app/(director)/indents/partial/\[id\].tsx](/mobile/app/(director)/indents/partial/%5Bid%5D.tsx) | TypeScript JSX | 296 | 6 | 25 | 327 |
| [mobile/app/(director)/indents/partial/index.tsx](/mobile/app/(director)/indents/partial/index.tsx) | TypeScript JSX | 175 | 2 | 13 | 190 |
| [mobile/app/(director)/indents/pending/\[id\].tsx](/mobile/app/(director)/indents/pending/%5Bid%5D.tsx) | TypeScript JSX | 405 | 9 | 28 | 442 |
| [mobile/app/(director)/indents/pending/index.tsx](/mobile/app/(director)/indents/pending/index.tsx) | TypeScript JSX | 267 | 4 | 19 | 290 |
| [mobile/app/(director)/reports.tsx](/mobile/app/(director)/reports.tsx) | TypeScript JSX | 46 | 0 | 4 | 50 |
| [mobile/app/(director)/space/index.tsx](/mobile/app/(director)/space/index.tsx) | TypeScript JSX | 101 | 0 | 11 | 112 |
| [mobile/app/(director)/space/materials/\[id\].tsx](/mobile/app/(director)/space/materials/%5Bid%5D.tsx) | TypeScript JSX | 312 | 12 | 20 | 344 |
| [mobile/app/(director)/space/materials/add.tsx](/mobile/app/(director)/space/materials/add.tsx) | TypeScript JSX | 238 | 9 | 18 | 265 |
| [mobile/app/(director)/space/materials/index.tsx](/mobile/app/(director)/space/materials/index.tsx) | TypeScript JSX | 278 | 6 | 19 | 303 |
| [mobile/app/(director)/space/roles/directors/\[id\].tsx](/mobile/app/(director)/space/roles/directors/%5Bid%5D.tsx) | TypeScript JSX | 398 | 4 | 20 | 422 |
| [mobile/app/(director)/space/roles/directors/index.tsx](/mobile/app/(director)/space/roles/directors/index.tsx) | TypeScript JSX | 148 | 0 | 10 | 158 |
| [mobile/app/(director)/space/roles/engineers/\[id\].tsx](/mobile/app/(director)/space/roles/engineers/%5Bid%5D.tsx) | TypeScript JSX | 421 | 5 | 21 | 447 |
| [mobile/app/(director)/space/roles/engineers/index.tsx](/mobile/app/(director)/space/roles/engineers/index.tsx) | TypeScript JSX | 154 | 0 | 11 | 165 |
| [mobile/app/(director)/space/roles/index.tsx](/mobile/app/(director)/space/roles/index.tsx) | TypeScript JSX | 149 | 0 | 14 | 163 |
| [mobile/app/(director)/space/roles/purchase-team/\[id\].tsx](/mobile/app/(director)/space/roles/purchase-team/%5Bid%5D.tsx) | TypeScript JSX | 548 | 5 | 26 | 579 |
| [mobile/app/(director)/space/roles/purchase-team/index.tsx](/mobile/app/(director)/space/roles/purchase-team/index.tsx) | TypeScript JSX | 148 | 0 | 10 | 158 |
| [mobile/app/(director)/space/sites/\[id\].tsx](/mobile/app/(director)/space/sites/%5Bid%5D.tsx) | TypeScript JSX | 528 | 10 | 32 | 570 |
| [mobile/app/(director)/space/sites/add.tsx](/mobile/app/(director)/space/sites/add.tsx) | TypeScript JSX | 408 | 17 | 29 | 454 |
| [mobile/app/(director)/space/sites/index.tsx](/mobile/app/(director)/space/sites/index.tsx) | TypeScript JSX | 162 | 2 | 11 | 175 |
| [mobile/app/(purchase-team)/\_layout.tsx](/mobile/app/(purchase-team)/_layout.tsx) | TypeScript JSX | 32 | 0 | 2 | 34 |
| [mobile/app/(purchase-team)/account.tsx](/mobile/app/(purchase-team)/account.tsx) | TypeScript JSX | 378 | 9 | 17 | 404 |
| [mobile/app/(purchase-team)/analytics/damage-report.tsx](/mobile/app/(purchase-team)/analytics/damage-report.tsx) | TypeScript JSX | 167 | 4 | 14 | 185 |
| [mobile/app/(purchase-team)/analytics/financial.tsx](/mobile/app/(purchase-team)/analytics/financial.tsx) | TypeScript JSX | 176 | 6 | 12 | 194 |
| [mobile/app/(purchase-team)/analytics/index.tsx](/mobile/app/(purchase-team)/analytics/index.tsx) | TypeScript JSX | 363 | 6 | 23 | 392 |
| [mobile/app/(purchase-team)/analytics/materials.tsx](/mobile/app/(purchase-team)/analytics/materials.tsx) | TypeScript JSX | 147 | 4 | 10 | 161 |
| [mobile/app/(purchase-team)/analytics/vendors.tsx](/mobile/app/(purchase-team)/analytics/vendors.tsx) | TypeScript JSX | 188 | 4 | 13 | 205 |
| [mobile/app/(purchase-team)/damages/\[id\].tsx](/mobile/app/(purchase-team)/damages/%5Bid%5D.tsx) | TypeScript JSX | 391 | 10 | 23 | 424 |
| [mobile/app/(purchase-team)/damages/index.tsx](/mobile/app/(purchase-team)/damages/index.tsx) | TypeScript JSX | 326 | 3 | 16 | 345 |
| [mobile/app/(purchase-team)/dashboard.tsx](/mobile/app/(purchase-team)/dashboard.tsx) | TypeScript JSX | 338 | 8 | 19 | 365 |
| [mobile/app/(purchase-team)/indents/\[id\].tsx](/mobile/app/(purchase-team)/indents/%5Bid%5D.tsx) | TypeScript JSX | 300 | 8 | 30 | 338 |
| [mobile/app/(purchase-team)/indents/index.tsx](/mobile/app/(purchase-team)/indents/index.tsx) | TypeScript JSX | 273 | 2 | 20 | 295 |
| [mobile/app/(purchase-team)/orders/\[id\].tsx](/mobile/app/(purchase-team)/orders/%5Bid%5D.tsx) | TypeScript JSX | 625 | 12 | 40 | 677 |
| [mobile/app/(purchase-team)/orders/index.tsx](/mobile/app/(purchase-team)/orders/index.tsx) | TypeScript JSX | 271 | 2 | 22 | 295 |
| [mobile/app/(purchase-team)/orders/select.tsx](/mobile/app/(purchase-team)/orders/select.tsx) | TypeScript JSX | 256 | 2 | 16 | 274 |
| [mobile/app/(purchase-team)/partial/\[id\].tsx](/mobile/app/(purchase-team)/partial/%5Bid%5D.tsx) | TypeScript JSX | 373 | 11 | 31 | 415 |
| [mobile/app/(purchase-team)/partial/index.tsx](/mobile/app/(purchase-team)/partial/index.tsx) | TypeScript JSX | 274 | 2 | 19 | 295 |
| [mobile/app/(purchase-team)/pending/\[id\].tsx](/mobile/app/(purchase-team)/pending/%5Bid%5D.tsx) | TypeScript JSX | 405 | 5 | 27 | 437 |
| [mobile/app/(purchase-team)/pending/index.tsx](/mobile/app/(purchase-team)/pending/index.tsx) | TypeScript JSX | 302 | 6 | 21 | 329 |
| [mobile/app/(purchase-team)/reports.tsx](/mobile/app/(purchase-team)/reports.tsx) | TypeScript JSX | 46 | 0 | 4 | 50 |
| [mobile/app/(site-engineer)/\_layout.tsx](/mobile/app/(site-engineer)/_layout.tsx) | TypeScript JSX | 38 | 0 | 2 | 40 |
| [mobile/app/(site-engineer)/account.tsx](/mobile/app/(site-engineer)/account.tsx) | TypeScript JSX | 437 | 9 | 15 | 461 |
| [mobile/app/(site-engineer)/damages/\[id\].tsx](/mobile/app/(site-engineer)/damages/%5Bid%5D.tsx) | TypeScript JSX | 578 | 11 | 38 | 627 |
| [mobile/app/(site-engineer)/damages/index.tsx](/mobile/app/(site-engineer)/damages/index.tsx) | TypeScript JSX | 400 | 6 | 16 | 422 |
| [mobile/app/(site-engineer)/dashboard.tsx](/mobile/app/(site-engineer)/dashboard.tsx) | TypeScript JSX | 192 | 0 | 8 | 200 |
| [mobile/app/(site-engineer)/indents/\[id\].tsx](/mobile/app/(site-engineer)/indents/%5Bid%5D.tsx) | TypeScript JSX | 754 | 13 | 38 | 805 |
| [mobile/app/(site-engineer)/indents/create.tsx](/mobile/app/(site-engineer)/indents/create.tsx) | TypeScript JSX | 624 | 17 | 37 | 678 |
| [mobile/app/(site-engineer)/indents/index.tsx](/mobile/app/(site-engineer)/indents/index.tsx) | TypeScript JSX | 348 | 2 | 22 | 372 |
| [mobile/app/(site-engineer)/receipts/\[id\].tsx](/mobile/app/(site-engineer)/receipts/%5Bid%5D.tsx) | TypeScript JSX | 520 | 8 | 33 | 561 |
| [mobile/app/(site-engineer)/receipts/index.tsx](/mobile/app/(site-engineer)/receipts/index.tsx) | TypeScript JSX | 279 | 3 | 17 | 299 |
| [mobile/app/\_layout.tsx](/mobile/app/_layout.tsx) | TypeScript JSX | 64 | 4 | 10 | 78 |
| [mobile/app/index.tsx](/mobile/app/index.tsx) | TypeScript JSX | 38 | 1 | 8 | 47 |
| [mobile/assets/images/icon.svg](/mobile/assets/images/icon.svg) | XML | 4 | 0 | 1 | 5 |
| [mobile/babel.config.js](/mobile/babel.config.js) | JavaScript | 6 | 0 | 1 | 7 |
| [mobile/eas.json](/mobile/eas.json) | JSON | 25 | 0 | 0 | 25 |
| [mobile/package-lock.json](/mobile/package-lock.json) | JSON | 9,778 | 0 | 1 | 9,779 |
| [mobile/package.json](/mobile/package.json) | JSON | 43 | 0 | 1 | 44 |
| [mobile/src/api/auth.api.ts](/mobile/src/api/auth.api.ts) | TypeScript | 23 | 0 | 7 | 30 |
| [mobile/src/api/client.ts](/mobile/src/api/client.ts) | TypeScript | 82 | 7 | 16 | 105 |
| [mobile/src/api/indents.api.ts](/mobile/src/api/indents.api.ts) | TypeScript | 572 | 53 | 87 | 712 |
| [mobile/src/api/index.ts](/mobile/src/api/index.ts) | TypeScript | 10 | 0 | 2 | 12 |
| [mobile/src/api/materials.api.ts](/mobile/src/api/materials.api.ts) | TypeScript | 93 | 24 | 15 | 132 |
| [mobile/src/api/notifications.api.ts](/mobile/src/api/notifications.api.ts) | TypeScript | 53 | 21 | 12 | 86 |
| [mobile/src/api/sites.api.ts](/mobile/src/api/sites.api.ts) | TypeScript | 110 | 40 | 22 | 172 |
| [mobile/src/api/users.api.ts](/mobile/src/api/users.api.ts) | TypeScript | 76 | 33 | 17 | 126 |
| [mobile/src/components/AddMaterialModal.tsx](/mobile/src/components/AddMaterialModal.tsx) | TypeScript JSX | 365 | 8 | 25 | 398 |
| [mobile/src/components/ErrorBoundary.tsx](/mobile/src/components/ErrorBoundary.tsx) | TypeScript JSX | 89 | 0 | 10 | 99 |
| [mobile/src/components/FilterModal.tsx](/mobile/src/components/FilterModal.tsx) | TypeScript JSX | 289 | 4 | 15 | 308 |
| [mobile/src/components/NotificationCenter.tsx](/mobile/src/components/NotificationCenter.tsx) | TypeScript JSX | 293 | 5 | 20 | 318 |
| [mobile/src/components/common/Badge.tsx](/mobile/src/components/common/Badge.tsx) | TypeScript JSX | 30 | 0 | 6 | 36 |
| [mobile/src/components/common/Button.tsx](/mobile/src/components/common/Button.tsx) | TypeScript JSX | 131 | 4 | 7 | 142 |
| [mobile/src/components/common/Card.tsx](/mobile/src/components/common/Card.tsx) | TypeScript JSX | 31 | 0 | 5 | 36 |
| [mobile/src/components/common/Input.tsx](/mobile/src/components/common/Input.tsx) | TypeScript JSX | 55 | 0 | 5 | 60 |
| [mobile/src/components/common/Loading.tsx](/mobile/src/components/common/Loading.tsx) | TypeScript JSX | 23 | 0 | 5 | 28 |
| [mobile/src/components/common/index.ts](/mobile/src/components/common/index.ts) | TypeScript | 5 | 0 | 1 | 6 |
| [mobile/src/constants/indentStatus.ts](/mobile/src/constants/indentStatus.ts) | TypeScript | 42 | 4 | 5 | 51 |
| [mobile/src/constants/index.ts](/mobile/src/constants/index.ts) | TypeScript | 3 | 0 | 1 | 4 |
| [mobile/src/constants/roles.ts](/mobile/src/constants/roles.ts) | TypeScript | 19 | 5 | 5 | 29 |
| [mobile/src/constants/theme.ts](/mobile/src/constants/theme.ts) | TypeScript | 89 | 6 | 8 | 103 |
| [mobile/src/context/AuthContext.tsx](/mobile/src/context/AuthContext.tsx) | TypeScript JSX | 116 | 10 | 20 | 146 |
| [mobile/src/context/index.ts](/mobile/src/context/index.ts) | TypeScript | 1 | 0 | 1 | 2 |
| [mobile/src/services/notifications.ts](/mobile/src/services/notifications.ts) | TypeScript | 79 | 30 | 18 | 127 |
| [mobile/src/types/auth.types.ts](/mobile/src/types/auth.types.ts) | TypeScript | 21 | 1 | 4 | 26 |
| [mobile/src/types/indent.types.ts](/mobile/src/types/indent.types.ts) | TypeScript | 261 | 27 | 26 | 314 |
| [mobile/src/types/index.ts](/mobile/src/types/index.ts) | TypeScript | 3 | 0 | 1 | 4 |
| [mobile/src/utils/storage.ts](/mobile/src/utils/storage.ts) | TypeScript | 30 | 0 | 10 | 40 |
| [mobile/tsconfig.json](/mobile/tsconfig.json) | JSON with Comments | 42 | 0 | 1 | 43 |

[Summary](results.md) / [Details](details.md) / [Diff Summary](diff.md) / Diff Details