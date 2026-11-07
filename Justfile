setup:
    npm install && cd frontend && npm install
    cd backend && cargo sqlx migrate run

dev:
    mprocs

release:
    npm run release

db-schema table="":
    sqlite3 backend/data/dev/radicalise.sqlite ".schema {{table}}"

db-test-init:
    mkdir -p backend/data/test
    cd backend && DATABASE_URL="sqlite://data/test/test_radicalise.sqlite?mode=rwc" cargo sqlx database reset -y
    sqlite3 backend/data/test/test_radicalise.sqlite "DELETE FROM circles; DELETE FROM projects;"

db-dev-init:
    mkdir -p backend/data/dev
    cd backend && DATABASE_URL="sqlite://data/dev/radicalise.sqlite?mode=rwc" cargo sqlx database reset
    sqlite3 backend/data/dev/radicalise.sqlite "DELETE FROM circles; DELETE FROM projects;"

playwright: db-test-init
    mprocs -c mprocs.test.yaml

test:
    cd backend && cargo test

format:
    cd frontend && npm run format:write
    cd backend && cargo fmt

prepare-queries:
    cd backend && cargo sqlx prepare

prepare: format prepare-queries

gen-api:
    cd frontend && npm run swagger
    cd frontend && npm run format:write

docker-build:
    docker build -t radicalise .

docker-run: docker-build
    docker run --rm -p 8200:8200 radicalise