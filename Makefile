.PHONY: up down restart logs-backend logs-frontend backend-prod

COMPOSE_FILE := dev.compose.yml
DC := docker compose -f $(COMPOSE_FILE)

up:
	@echo "Bringing services up…"
	$(DC) up --build -d

down:
	@echo "Tearing services down…"
	$(DC) down

restart: down up
	@echo "Restart complete."

logs:
	@echo "Tailing backend logs…"
	$(DC) logs -f backend

backend-prod:
	@echo "Building and running the production server"
	docker build -t smart-books-backend-prod -f Dockerfile.prod . --no-cache
