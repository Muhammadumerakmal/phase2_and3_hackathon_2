# Step 01: Create Backend Database Models

**Action:** Create `backend/models.py` to define SQLModel database models for `Todo` and `User` entities.

**Reasoning:** Database models are the foundation of the application's data layer. The `Todo` model stores task information with a foreign key relationship to `User`, enabling user-specific todo management. The `User` model stores authentication credentials and profile information.

**Implementation Details:**
- `Todo` model: id (primary key), content (str), completed (bool), user_id (foreign key to User)
- `User` model: id (primary key), username (unique, indexed), email (unique), full_name (optional), hashed_password, disabled (bool)
- Uses SQLModel for type safety and Pydantic integration
