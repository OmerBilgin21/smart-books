.PHONY: up down restart logs-backend logs-frontend

COMPOSE_FILE := dev.compose.yml
DC := docker compose -f $(COMPOSE_FILE)

up:
	@echo "Bringing services up…"
	$(DC) up -d

down:
	@echo "Tearing services down…"
	$(DC) down

restart: down up
	@echo "Restart complete."

logs-backend:
	@echo "Tailing backend logs…"
	$(DC) logs -f backend

logs-frontend:
	@echo "Tailing frontend logs…"
	$(DC) logs -f frontend
