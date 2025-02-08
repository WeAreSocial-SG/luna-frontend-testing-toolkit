# Use a lightweight Python image
FROM python:3.9-alpine

# Set working directory inside the container
WORKDIR /app

# Copy all files from the current directory to the container
COPY . .

# Expose port 7000
EXPOSE 7000

# Run a simple Python HTTP server
CMD ["python3", "-m", "http.server", "7000"]
