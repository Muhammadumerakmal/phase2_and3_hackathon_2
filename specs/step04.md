# Step 04: Create Backend Authentication Utilities

**Action:** Create `backend/auth.py` to implement password hashing, JWT token creation/verification, and authentication dependencies.

**Reasoning:** Centralizing authentication logic improves security and maintainability. Using bcrypt for password hashing and JWT for stateless authentication follows industry best practices.

**Implementation Details:**
- Password hashing with bcrypt (not passlib for direct control)
- JWT token creation with configurable expiration (30 minutes default)
- SECRET_KEY loaded from environment variables
- `authenticate_user()` for credential verification
- `get_current_user()` and `get_current_active_user()` as FastAPI dependencies
- OAuth2PasswordBearer scheme for token extraction
