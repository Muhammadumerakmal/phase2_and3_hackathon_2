FROM python:3.13-slim

# Set working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY pyproject.toml uv.lock* ./
RUN pip install uv && uv pip install --system -r pyproject.toml

# Copy application code
COPY . .

# Expose the port (HuggingFace uses 7860 by default)
EXPOSE 7860

# Run the application with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
