.PHONY: help docker-build docker-run docker-push docker-clean cloud-run-build cloud-run-deploy cloud-run-logs cloud-run-describe cloud-run-delete clean

# デフォルト値
PROJECT_ID ?= $(shell gcloud config get-value project 2>/dev/null)
REGION ?= asia-northeast1
SERVICE_NAME ?= mobile-mcp-server
IMAGE_NAME ?= gcr.io/$(PROJECT_ID)/$(SERVICE_NAME)
IMAGE_TAG ?= latest
PORT ?= 8080

# ヘルプメッセージ
help:
	@echo "Mobile MCP Server - Makefile Commands"
	@echo ""
	@echo "Docker Commands:"
	@echo "  make docker-build          - Build Docker image"
	@echo "  make docker-run             - Run Docker container locally"
	@echo "  make docker-push           - Push Docker image to Container Registry"
	@echo "  make docker-clean          - Remove local Docker images"
	@echo ""
	@echo "Cloud Run Commands:"
	@echo "  make cloud-run-build       - Build and push using Cloud Build"
	@echo "  make cloud-run-deploy      - Deploy to Cloud Run"
	@echo "  make cloud-run-logs         - View Cloud Run logs"
	@echo "  make cloud-run-describe    - Show Cloud Run service details"
	@echo "  make cloud-run-delete      - Delete Cloud Run service"
	@echo ""
	@echo "Utility Commands:"
	@echo "  make clean                 - Clean build artifacts"
	@echo ""
	@echo "Environment Variables:"
	@echo "  PROJECT_ID                 - GCP Project ID (default: current gcloud config)"
	@echo "  REGION                     - Cloud Run region (default: asia-northeast1)"
	@echo "  SERVICE_NAME               - Cloud Run service name (default: mobile-mcp-server)"
	@echo "  IMAGE_TAG                  - Docker image tag (default: latest)"
	@echo "  PORT                       - Server port (default: 8080)"

# Dockerイメージをビルド
docker-build:
	@if [ -z "$(PROJECT_ID)" ]; then \
		echo "Error: PROJECT_ID is not set. Set it as environment variable or run 'gcloud config set project YOUR_PROJECT_ID'"; \
		exit 1; \
	fi
	@echo "Building Docker image: $(IMAGE_NAME):$(IMAGE_TAG)"
	docker build -t $(IMAGE_NAME):$(IMAGE_TAG) .
	@echo "Build complete!"

# Dockerコンテナをローカルで実行
docker-run:
	@if [ -z "$(PROJECT_ID)" ]; then \
		echo "Error: PROJECT_ID is not set. Set it as environment variable or run 'gcloud config set project YOUR_PROJECT_ID'"; \
		exit 1; \
	fi
	@echo "Running Docker container locally on port $(PORT)..."
	docker run -it --rm \
		-p $(PORT):8080 \
		-e PORT=8080 \
		$(IMAGE_NAME):$(IMAGE_TAG)

# DockerイメージをContainer Registryにプッシュ
docker-push:
	@if [ -z "$(PROJECT_ID)" ]; then \
		echo "Error: PROJECT_ID is not set. Set it as environment variable or run 'gcloud config set project YOUR_PROJECT_ID'"; \
		exit 1; \
	fi
	@echo "Pushing Docker image: $(IMAGE_NAME):$(IMAGE_TAG)"
	docker push $(IMAGE_NAME):$(IMAGE_TAG)
	@echo "Push complete!"

# ローカルのDockerイメージを削除
docker-clean:
	@echo "Removing local Docker images..."
	@docker images $(IMAGE_NAME) -q | xargs -r docker rmi -f || true
	@echo "Clean complete!"

# Cloud Buildでビルドとプッシュ
cloud-run-build:
	@if [ -z "$(PROJECT_ID)" ]; then \
		echo "Error: PROJECT_ID is not set. Set it as environment variable or run 'gcloud config set project YOUR_PROJECT_ID'"; \
		exit 1; \
	fi
	@echo "Building and pushing with Cloud Build..."
	gcloud builds submit --config cloudbuild.yaml --substitutions=_SERVICE_NAME=$(SERVICE_NAME)
	@echo "Build complete!"

# Cloud Runにデプロイ
cloud-run-deploy:
	@if [ -z "$(PROJECT_ID)" ]; then \
		echo "Error: PROJECT_ID is not set. Set it as environment variable or run 'gcloud config set project YOUR_PROJECT_ID'"; \
		exit 1; \
	fi
	@echo "Deploying to Cloud Run..."
	@echo "  Project: $(PROJECT_ID)"
	@echo "  Region: $(REGION)"
	@echo "  Service: $(SERVICE_NAME)"
	@echo "  Image: $(IMAGE_NAME):$(IMAGE_TAG)"
	gcloud run deploy $(SERVICE_NAME) \
		--image $(IMAGE_NAME):$(IMAGE_TAG) \
		--platform managed \
		--region $(REGION) \
		--allow-unauthenticated \
		--port $(PORT) \
		--memory 512Mi \
		--cpu 1 \
		--min-instances 0 \
		--max-instances 10 \
		--timeout 300 \
		--set-env-vars PORT=$(PORT) \
		--project $(PROJECT_ID)
	@echo ""
	@echo "Deployment complete!"
	@echo "Service URL: $$(gcloud run services describe $(SERVICE_NAME) --region $(REGION) --format 'value(status.url)' --project $(PROJECT_ID))"

# Cloud Runのログを表示
cloud-run-logs:
	@if [ -z "$(PROJECT_ID)" ]; then \
		echo "Error: PROJECT_ID is not set. Set it as environment variable or run 'gcloud config set project YOUR_PROJECT_ID'"; \
		exit 1; \
	fi
	@echo "Fetching Cloud Run logs..."
	gcloud run services logs read $(SERVICE_NAME) \
		--region $(REGION) \
		--project $(PROJECT_ID) \
		--limit 50

# Cloud Runサービスの詳細を表示
cloud-run-describe:
	@if [ -z "$(PROJECT_ID)" ]; then \
		echo "Error: PROJECT_ID is not set. Set it as environment variable or run 'gcloud config set project YOUR_PROJECT_ID'"; \
		exit 1; \
	fi
	@echo "Cloud Run service details:"
	gcloud run services describe $(SERVICE_NAME) \
		--region $(REGION) \
		--project $(PROJECT_ID)

# Cloud Runサービスを削除
cloud-run-delete:
	@if [ -z "$(PROJECT_ID)" ]; then \
		echo "Error: PROJECT_ID is not set. Set it as environment variable or run 'gcloud config set project YOUR_PROJECT_ID'"; \
		exit 1; \
	fi
	@echo "WARNING: This will delete the Cloud Run service: $(SERVICE_NAME)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		gcloud run services delete $(SERVICE_NAME) \
			--region $(REGION) \
			--project $(PROJECT_ID) \
			--quiet; \
		echo "Service deleted."; \
	else \
		echo "Cancelled."; \
	fi

# ビルド成果物をクリーンアップ
clean:
	@echo "Cleaning build artifacts..."
	rm -rf lib
	@echo "Clean complete!"

