# Step 03: Create Backend Schemas

**Action:** Create `backend/schemas.py` to define Pydantic/SQLModel schemas for API request/response validation.

**Reasoning:** Schemas provide clear contracts between frontend and backend, enable automatic validation, and separate database models from API data transfer objects (DTOs).

**Implementation Details:**
- `Token` and `TokenData` for JWT authentication responses
- `UserCreate` for registration input, `UserRead` for user output
- `TodoCreate` for new todo input, `TodoRead` for todo output
- `TodoUpdate` for todo modification requests
