# Step 02: Create Backend Database Configuration

**Action:** Create `backend/database.py` to configure the database engine, session management, and table creation.

**Reasoning:** Centralizing database configuration ensures consistent connection handling across the application. Support for both SQLite (development) and PostgreSQL (production) provides flexibility across environments.

**Implementation Details:**
- Load DATABASE_URL from environment variables with SQLite fallback
- Configure SQLModel engine with appropriate connection args
- `create_db_and_tables()` function for schema initialization
- `get_session()` generator for dependency injection
