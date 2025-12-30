# Step 05: Create Backend Auth Router

**Action:** Create `backend/routers/auth.py` to define authentication API endpoints for user registration and login.

**Reasoning:** Separating authentication routes into a dedicated router follows FastAPI best practices and keeps the codebase organized. These endpoints are the entry point for user authentication flow.

**Implementation Details:**
- `POST /auth/register`: Create new user with duplicate username/email validation
- `POST /auth/token`: OAuth2-compatible login endpoint returning JWT tokens
- Password hashing on registration
- User credential validation on login
