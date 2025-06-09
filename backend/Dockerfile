FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Make the script executable
RUN chmod +x wait-for-db.sh

CMD ["./wait-for-db.sh", "db", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8002", "--reload"] 