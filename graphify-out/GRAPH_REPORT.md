# Graph Report - D:\krupali\logistics and DMS  (2026-06-04)

## Corpus Check
- 120 files · ~31,263 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 449 nodes · 527 edges · 88 communities detected
- Extraction: 76% EXTRACTED · 24% INFERRED · 0% AMBIGUOUS · INFERRED: 128 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 85|Community 85]]
- [[_COMMUNITY_Community 86|Community 86]]
- [[_COMMUNITY_Community 87|Community 87]]

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 16 edges
2. `deleteFile()` - 14 edges
3. `getCustomerById()` - 10 edges
4. `uploadFile()` - 10 edges
5. `createTokenSet()` - 6 edges
6. `createCustomer()` - 6 edges
7. `getDriverById()` - 6 edges
8. `getVehicleById()` - 6 edges
9. `createDriver()` - 5 edges
10. `updateDriver()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `createTokenSet()` --calls--> `signAccessToken()`  [INFERRED]
  D:\krupali\logistics and DMS\backend\src\services\authService.js → D:\krupali\logistics and DMS\backend\src\config\jwt.js
- `createTokenSet()` --calls--> `signRefreshToken()`  [INFERRED]
  D:\krupali\logistics and DMS\backend\src\services\authService.js → D:\krupali\logistics and DMS\backend\src\config\jwt.js
- `getProfile()` --calls--> `buildAuthPayload()`  [INFERRED]
  D:\krupali\logistics and DMS\backend\src\controllers\userController.js → D:\krupali\logistics and DMS\backend\src\services\authService.js
- `createCustomerDocument()` --calls--> `uploadFile()`  [INFERRED]
  D:\krupali\logistics and DMS\backend\src\services\customerService.js → D:\krupali\logistics and DMS\backend\src\services\storage\storageService.js
- `createCustomerDocument()` --calls--> `deleteFile()`  [INFERRED]
  D:\krupali\logistics and DMS\backend\src\services\customerService.js → D:\krupali\logistics and DMS\backend\src\services\storage\storageService.js

## Communities

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (65): forgotPassword(), login(), logout(), refresh(), resetPassword(), createCustomer(), createCustomerAddress(), createCustomerDocument() (+57 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (12): cleanParams(), deleteCustomer(), deleteCustomerAddress(), deleteCustomerDocument(), deleteCustomerNote(), getCustomers(), deleteDriver(), deleteDriverDocument() (+4 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (15): PublicRoute(), useAuth(), CustomerAddresses(), CustomerDetails(), CustomerList(), CustomerNotes(), Dashboard(), DriverList() (+7 more)

### Community 3 - "Community 3"
Cohesion: 0.12
Nodes (21): assertCapacityWithinTypeRange(), assertUniqueVehicleFields(), assertUniqueVehicleTypeName(), assignVehicle(), buildPagination(), buildVehicleFilters(), createVehicle(), createVehicleDocument() (+13 more)

### Community 4 - "Community 4"
Cohesion: 0.1
Nodes (17): ApiResponse, authMiddleware(), buildAuthPayload(), createTokenSet(), forgotPassword(), login(), refresh(), resetPassword() (+9 more)

### Community 5 - "Community 5"
Cohesion: 0.14
Nodes (20): assertUniqueCustomerFields(), buildCustomerFilters(), buildPagination(), createCustomer(), createCustomerAddress(), createCustomerDocument(), createCustomerNote(), deleteCustomer() (+12 more)

### Community 6 - "Community 6"
Cohesion: 0.14
Nodes (20): deleteCustomerDocument(), updateCustomerDocument(), assertUniqueDriverFields(), buildDriverFilters(), buildPagination(), createDriver(), createDriverDocument(), deleteDriver() (+12 more)

### Community 7 - "Community 7"
Cohesion: 0.12
Nodes (4): cleanParams(), getVehicleAssignments(), getVehicles(), getVehicleTypes()

### Community 8 - "Community 8"
Cohesion: 0.17
Nodes (6): CustomerDocuments(), DriverDetails(), DriverDocuments(), getFileUrl(), isImageFile(), VehicleDocuments()

### Community 9 - "Community 9"
Cohesion: 0.33
Nodes (5): createUser(), getProfile(), getUserWithRoles(), updateProfile(), updateUser()

### Community 10 - "Community 10"
Cohesion: 0.25
Nodes (3): up(), up(), seedDefaultAccessControl()

### Community 11 - "Community 11"
Cohesion: 0.47
Nodes (2): LocalStorageProvider, sanitizeBaseName()

### Community 12 - "Community 12"
Cohesion: 0.5
Nodes (0): 

### Community 13 - "Community 13"
Cohesion: 0.67
Nodes (2): createInitialDocument(), DriverForm()

### Community 14 - "Community 14"
Cohesion: 0.67
Nodes (2): createInitialDocument(), VehicleForm()

### Community 15 - "Community 15"
Cohesion: 0.67
Nodes (0): 

### Community 16 - "Community 16"
Cohesion: 0.67
Nodes (0): 

### Community 17 - "Community 17"
Cohesion: 0.67
Nodes (0): 

### Community 18 - "Community 18"
Cohesion: 0.67
Nodes (0): 

### Community 19 - "Community 19"
Cohesion: 0.67
Nodes (0): 

### Community 20 - "Community 20"
Cohesion: 0.67
Nodes (0): 

### Community 21 - "Community 21"
Cohesion: 0.67
Nodes (0): 

### Community 22 - "Community 22"
Cohesion: 0.67
Nodes (0): 

### Community 23 - "Community 23"
Cohesion: 0.67
Nodes (0): 

### Community 24 - "Community 24"
Cohesion: 0.67
Nodes (0): 

### Community 25 - "Community 25"
Cohesion: 0.67
Nodes (0): 

### Community 26 - "Community 26"
Cohesion: 0.67
Nodes (0): 

### Community 27 - "Community 27"
Cohesion: 0.67
Nodes (0): 

### Community 28 - "Community 28"
Cohesion: 0.67
Nodes (0): 

### Community 29 - "Community 29"
Cohesion: 0.67
Nodes (0): 

### Community 30 - "Community 30"
Cohesion: 0.67
Nodes (0): 

### Community 31 - "Community 31"
Cohesion: 0.67
Nodes (0): 

### Community 32 - "Community 32"
Cohesion: 0.67
Nodes (0): 

### Community 33 - "Community 33"
Cohesion: 0.67
Nodes (0): 

### Community 34 - "Community 34"
Cohesion: 0.67
Nodes (1): AppError

### Community 35 - "Community 35"
Cohesion: 0.67
Nodes (0): 

### Community 36 - "Community 36"
Cohesion: 0.67
Nodes (0): 

### Community 37 - "Community 37"
Cohesion: 0.67
Nodes (0): 

### Community 38 - "Community 38"
Cohesion: 1.0
Nodes (2): AdminLayout(), getBreadcrumb()

### Community 39 - "Community 39"
Cohesion: 0.67
Nodes (0): 

### Community 40 - "Community 40"
Cohesion: 1.0
Nodes (0): 

### Community 41 - "Community 41"
Cohesion: 1.0
Nodes (0): 

### Community 42 - "Community 42"
Cohesion: 1.0
Nodes (0): 

### Community 43 - "Community 43"
Cohesion: 1.0
Nodes (0): 

### Community 44 - "Community 44"
Cohesion: 1.0
Nodes (0): 

### Community 45 - "Community 45"
Cohesion: 1.0
Nodes (0): 

### Community 46 - "Community 46"
Cohesion: 1.0
Nodes (0): 

### Community 47 - "Community 47"
Cohesion: 1.0
Nodes (0): 

### Community 48 - "Community 48"
Cohesion: 1.0
Nodes (0): 

### Community 49 - "Community 49"
Cohesion: 1.0
Nodes (0): 

### Community 50 - "Community 50"
Cohesion: 1.0
Nodes (0): 

### Community 51 - "Community 51"
Cohesion: 1.0
Nodes (0): 

### Community 52 - "Community 52"
Cohesion: 1.0
Nodes (0): 

### Community 53 - "Community 53"
Cohesion: 1.0
Nodes (0): 

### Community 54 - "Community 54"
Cohesion: 1.0
Nodes (0): 

### Community 55 - "Community 55"
Cohesion: 1.0
Nodes (0): 

### Community 56 - "Community 56"
Cohesion: 1.0
Nodes (0): 

### Community 57 - "Community 57"
Cohesion: 1.0
Nodes (0): 

### Community 58 - "Community 58"
Cohesion: 1.0
Nodes (0): 

### Community 59 - "Community 59"
Cohesion: 1.0
Nodes (0): 

### Community 60 - "Community 60"
Cohesion: 1.0
Nodes (0): 

### Community 61 - "Community 61"
Cohesion: 1.0
Nodes (0): 

### Community 62 - "Community 62"
Cohesion: 1.0
Nodes (0): 

### Community 63 - "Community 63"
Cohesion: 1.0
Nodes (0): 

### Community 64 - "Community 64"
Cohesion: 1.0
Nodes (0): 

### Community 65 - "Community 65"
Cohesion: 1.0
Nodes (0): 

### Community 66 - "Community 66"
Cohesion: 1.0
Nodes (0): 

### Community 67 - "Community 67"
Cohesion: 1.0
Nodes (0): 

### Community 68 - "Community 68"
Cohesion: 1.0
Nodes (0): 

### Community 69 - "Community 69"
Cohesion: 1.0
Nodes (0): 

### Community 70 - "Community 70"
Cohesion: 1.0
Nodes (0): 

### Community 71 - "Community 71"
Cohesion: 1.0
Nodes (0): 

### Community 72 - "Community 72"
Cohesion: 1.0
Nodes (0): 

### Community 73 - "Community 73"
Cohesion: 1.0
Nodes (0): 

### Community 74 - "Community 74"
Cohesion: 1.0
Nodes (0): 

### Community 75 - "Community 75"
Cohesion: 1.0
Nodes (0): 

### Community 76 - "Community 76"
Cohesion: 1.0
Nodes (0): 

### Community 77 - "Community 77"
Cohesion: 1.0
Nodes (0): 

### Community 78 - "Community 78"
Cohesion: 1.0
Nodes (0): 

### Community 79 - "Community 79"
Cohesion: 1.0
Nodes (0): 

### Community 80 - "Community 80"
Cohesion: 1.0
Nodes (0): 

### Community 81 - "Community 81"
Cohesion: 1.0
Nodes (0): 

### Community 82 - "Community 82"
Cohesion: 1.0
Nodes (0): 

### Community 83 - "Community 83"
Cohesion: 1.0
Nodes (0): 

### Community 84 - "Community 84"
Cohesion: 1.0
Nodes (0): 

### Community 85 - "Community 85"
Cohesion: 1.0
Nodes (0): 

### Community 86 - "Community 86"
Cohesion: 1.0
Nodes (0): 

### Community 87 - "Community 87"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Community 40`** (2 nodes): `sequelizeOptions.js`, `buildSequelizeOptions()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (2 nodes): `permissionMiddleware.js`, `permissionMiddleware()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (2 nodes): `rateLimiter.js`, `authLimiter()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (2 nodes): `asyncHandler()`, `asyncHandler.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (2 nodes): `userValidator.js`, `nameRule()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (2 nodes): `Button()`, `Button.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (2 nodes): `Input.jsx`, `Input()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (2 nodes): `Loader.jsx`, `Loader()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (2 nodes): `VehicleAssignments.jsx`, `VehicleAssignments()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (2 nodes): `VehicleDetails.jsx`, `VehicleDetails()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (1 nodes): `config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (1 nodes): `app.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 52`** (1 nodes): `database.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (1 nodes): `customerConstants.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 54`** (1 nodes): `driverConstants.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 55`** (1 nodes): `vehicleConstants.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 56`** (1 nodes): `Customer.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (1 nodes): `CustomerAddress.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 58`** (1 nodes): `CustomerDocument.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 59`** (1 nodes): `CustomerNote.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 60`** (1 nodes): `Driver.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 61`** (1 nodes): `DriverDocument.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 62`** (1 nodes): `DriverLocation.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 63`** (1 nodes): `DriverVehicleAssignment.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 64`** (1 nodes): `index.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 65`** (1 nodes): `Permission.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 66`** (1 nodes): `Role.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 67`** (1 nodes): `RolePermission.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 68`** (1 nodes): `User.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 69`** (1 nodes): `UserRole.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 70`** (1 nodes): `Vehicle.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 71`** (1 nodes): `VehicleDocument.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 72`** (1 nodes): `VehicleType.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 73`** (1 nodes): `authRoutes.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 74`** (1 nodes): `customerAddressRoutes.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 75`** (1 nodes): `customerDocumentRoutes.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 76`** (1 nodes): `customerNoteRoutes.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 77`** (1 nodes): `customerRoutes.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 78`** (1 nodes): `documentRoutes.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 79`** (1 nodes): `driverRoutes.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 80`** (1 nodes): `userRoutes.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 81`** (1 nodes): `vehicleAssignmentRoutes.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 82`** (1 nodes): `vehicleDocumentRoutes.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 83`** (1 nodes): `vehicleRoutes.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 84`** (1 nodes): `vehicleTypeRoutes.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 85`** (1 nodes): `authValidator.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 86`** (1 nodes): `vite.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 87`** (1 nodes): `main.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `deleteFile()` connect `Community 6` to `Community 1`, `Community 3`, `Community 5`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Why does `createCustomerDocument()` connect `Community 5` to `Community 6`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `createVehicleDocument()` connect `Community 3` to `Community 6`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Are the 15 inferred relationships involving `useAuth()` (e.g. with `PublicRoute()` and `Header()`) actually correct?**
  _`useAuth()` has 15 INFERRED edges - model-reasoned connections that need verification._
- **Are the 13 inferred relationships involving `deleteFile()` (e.g. with `createCustomerDocument()` and `updateCustomerDocument()`) actually correct?**
  _`deleteFile()` has 13 INFERRED edges - model-reasoned connections that need verification._
- **Are the 8 inferred relationships involving `uploadFile()` (e.g. with `createCustomerDocument()` and `updateCustomerDocument()`) actually correct?**
  _`uploadFile()` has 8 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `createTokenSet()` (e.g. with `signAccessToken()` and `signRefreshToken()`) actually correct?**
  _`createTokenSet()` has 2 INFERRED edges - model-reasoned connections that need verification._