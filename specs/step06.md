# Step 06: Create Backend Users Router

**Action:** Create `backend/routers/users.py` to define user management API endpoints.

**Reasoning:** User management endpoints allow users to view their profile and administrators to manage users. This router provides protected endpoints that require authentication.

**Implementation Details:**
- `POST /users/`: Alternative user creation endpoint
- `GET /users/me`: Get current authenticated user's profile
- `GET /users/`: List all users (protected, for admin purposes)
- All endpoints require authentication via `get_current_active_user` dependency
