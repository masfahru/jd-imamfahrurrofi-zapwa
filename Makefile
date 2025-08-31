# ====================================================================================
# Makefile for Building & Publishing ZapWA Docker Images
# ====================================================================================

# --- Configuration ---
# !!! IMPORTANT: Set your Docker Hub username here or on the command line.
# Example: `make publish DOCKER_HUB_USERNAME=myusername`
DOCKER_HUB_USERNAME ?= idemyid

# Automatically get the short Git commit SHA to use as a version tag.
GIT_COMMIT_SHA := $(shell git rev-parse --short HEAD)

# Define the image names with your Docker Hub username.
CLIENT_IMAGE_NAME = $(DOCKER_HUB_USERNAME)/zapwa-client
SERVER_IMAGE_NAME = $(DOCKER_HUB_USERNAME)/zapwa-server

# --- Primary Targets ---
.PHONY: all build publish clean help

all: build ## Build both client and server Docker images.

build: build-client build-server ## Build both client and server Docker images.

publish: build login publish-client publish-server ## Build, log in, and publish both images to Docker Hub.

clean: ## Remove the built Docker images from your local machine.
	@echo "Removing Docker images..."
	-docker rmi $(CLIENT_IMAGE_NAME):latest 2>/dev/null || true
	-docker rmi $(CLIENT_IMAGE_NAME):$(GIT_COMMIT_SHA) 2>/dev/null || true
	-docker rmi $(SERVER_IMAGE_NAME):latest 2>/dev/null || true
	-docker rmi $(SERVER_IMAGE_NAME):$(GIT_COMMIT_SHA) 2>/dev/null || true

# --- Individual Targets ---
.PHONY: build-client build-server publish-client publish-server login

login: ## Log in to Docker Hub.
	@echo "Please log in to Docker Hub..."
	@docker login

build-client: ## Build the client Docker image with 'latest' and git SHA tags.
	@echo "Building client image: $(CLIENT_IMAGE_NAME) with tags 'latest' and '$(GIT_COMMIT_SHA)'..."
	docker build \
		-t $(CLIENT_IMAGE_NAME):latest \
		-t $(CLIENT_IMAGE_NAME):$(GIT_COMMIT_SHA) \
		-f client/Dockerfile .

build-server: ## Build the server Docker image with 'latest' and git SHA tags.
	@echo "Building server image: $(SERVER_IMAGE_NAME) with tags 'latest' and '$(GIT_COMMIT_SHA)'..."
	docker build \
		-t $(SERVER_IMAGE_NAME):latest \
		-t $(SERVER_IMAGE_NAME):$(GIT_COMMIT_SHA) \
		-f server/Dockerfile .

publish-client: ## Publish all tags for the client image to Docker Hub.
	@echo "Publishing all tags for $(CLIENT_IMAGE_NAME)..."
	docker push --all-tags $(CLIENT_IMAGE_NAME)

publish-server: ## Publish all tags for the server image to Docker Hub.
	@echo "Publishing all tags for $(SERVER_IMAGE_NAME)..."
	docker push --all-tags $(SERVER_IMAGE_NAME)

# --- Help ---
help: ## Display this help screen.
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
