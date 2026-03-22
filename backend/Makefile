.PHONY: help run build clean test install dev

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	go mod download
	go mod tidy

run: ## Run the server
	go run main.go

dev: ## Run with hot reload (requires air)
	air

build: ## Build the binary
	go build -o bin/omega-backend main.go

build-linux: ## Build for Linux
	GOOS=linux GOARCH=amd64 go build -o bin/omega-backend-linux main.go

build-windows: ## Build for Windows
	GOOS=windows GOARCH=amd64 go build -o bin/omega-backend.exe main.go

clean: ## Clean build artifacts
	rm -rf bin/
	go clean

test: ## Run tests
	go test -v ./...

test-coverage: ## Run tests with coverage
	go test -v -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out

fmt: ## Format code
	go fmt ./...

lint: ## Run linter
	golangci-lint run

docker-build: ## Build Docker image
	docker build -t omega-backend:latest .

docker-run: ## Run Docker container
	docker run -p 3000:3000 --env-file .env omega-backend:latest
