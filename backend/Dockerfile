FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_DEFAULT_TIMEOUT=1000

COPY requirements.txt .

RUN pip install \
    --no-cache-dir \
    --retries 10 \
    torch==2.13.0 \
    --index-url https://download.pytorch.org/whl/cpu

RUN pip install \
    --no-cache-dir \
    --retries 10 \
    -r requirements.txt

COPY app ./app

RUN mkdir -p uploads chroma_db

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]