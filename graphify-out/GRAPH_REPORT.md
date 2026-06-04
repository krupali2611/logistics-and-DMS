# Graph Report - logistics-and-DMS  (2026-06-04)

## Corpus Check
- 52 files · ~6,624 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 131 nodes · 109 edges · 8 communities detected
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ab8c0c1f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 13 edges
2. `createTokenSet()` - 6 edges
3. `getUserWithRoles()` - 5 edges
4. `refresh()` - 3 edges
5. `ApiResponse` - 3 edges
6. `up()` - 2 edges
7. `signAccessToken()` - 2 edges
8. `signRefreshToken()` - 2 edges
9. `signResetToken()` - 2 edges
10. `verifyAccessToken()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `createTokenSet()` --calls--> `signAccessToken()`  [INFERRED]
  backend/src/services/authService.js → backend/src/config/jwt.js
- `createTokenSet()` --calls--> `signRefreshToken()`  [INFERRED]
  backend/src/services/authService.js → backend/src/config/jwt.js
- `PublicRoute()` --calls--> `useAuth()`  [INFERRED]
  frontend/src/App.jsx → frontend/src/context/AuthContext.jsx
- `Header()` --calls--> `useAuth()`  [INFERRED]
  frontend/src/components/Header/Header.jsx → frontend/src/context/AuthContext.jsx
- `Login()` --calls--> `useAuth()`  [INFERRED]
  frontend/src/pages/auth/Login.jsx → frontend/src/context/AuthContext.jsx

## Communities (41 total, 5 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.17
Nodes (13): signAccessToken(), signRefreshToken(), signResetToken(), verifyAccessToken(), verifyRefreshToken(), verifyResetToken(), authMiddleware(), buildAuthPayload() (+5 more)

### Community 1 - "Community 1"
Cohesion: 0.21
Nodes (7): Login(), useAuth(), Dashboard(), Header(), Profile(), ProtectedRoute(), PublicRoute()

### Community 2 - "Community 2"
Cohesion: 0.33
Nodes (5): createUser(), getProfile(), getUserWithRoles(), updateProfile(), updateUser()

## Knowledge Gaps
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAuth()` connect `Community 1` to `Community 4`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `useAuth()` (e.g. with `PublicRoute()` and `Header()`) actually correct?**
  _`useAuth()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `createTokenSet()` (e.g. with `signAccessToken()` and `signRefreshToken()`) actually correct?**
  _`createTokenSet()` has 2 INFERRED edges - model-reasoned connections that need verification._