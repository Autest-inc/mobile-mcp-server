#!/bin/bash
# Cloud Runへのデプロイスクリプト

set -e

PROJECT_ID=${GOOGLE_CLOUD_PROJECT:-$(gcloud config get-value project)}
REGION=${REGION:-asia-northeast1}
SERVICE_NAME=${SERVICE_NAME:-mobile-mcp-server}
IMAGE_NAME=gcr.io/${PROJECT_ID}/${SERVICE_NAME}

echo "Configuring Docker authentication for Container Registry..."
gcloud auth configure-docker gcr.io --quiet

echo "Building Docker image for linux/amd64 platform (required for Cloud Run)..."
docker build --platform linux/amd64 -t ${IMAGE_NAME}:latest .

echo "Pushing image to Container Registry..."
docker push ${IMAGE_NAME}:latest

echo "Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME}:latest \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --port 8080 \
  --memory 384Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300

echo "Deployment complete!"
echo "Service URL: $(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)')"

