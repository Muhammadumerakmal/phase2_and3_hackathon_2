# Step 08: Create Backend Main Application

**Action:** Create `backend/main.py` to configure the FastAPI application with routers, CORS, and startup events.

**Reasoning:** The main application file ties together all components, configures middleware for cross-origin requests, and ensures the database is initialized on startup.

**Implementation Details:**
- Initialize FastAPI application
- Configure CORS middleware for frontend access
- Include all routers (todos, users, auth)
- Add startup event to create database tables
- Root endpoint for health check
