# Step 07: Create Backend Todos Router

**Action:** Create `backend/routers/todos.py` to define CRUD API endpoints for todo management.

**Reasoning:** The todos router implements the core functionality of the application - creating, reading, updating, and deleting todo items. All endpoints are protected and filter todos by the authenticated user.

**Implementation Details:**
- `GET /todos`: Fetch all todos for the current user
- `POST /todos`: Create a new todo linked to the current user
- `PUT /todos/{todo_id}`: Update a todo (with ownership validation)
- `DELETE /todos/{todo_id}`: Delete a todo (with ownership validation)
- Uses proper schemas (TodoCreate, TodoRead, TodoUpdate) for validation
- All endpoints require authentication via `get_current_active_user`
