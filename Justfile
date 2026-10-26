setup:
    npm install && cd frontend && npm install

dev:
    mprocs

release:
    npm run release

db-schema table="":
    sqlite3 backend/data/dev/radicalise.sqlite ".schema {{table}}"

db-test-init:
    cd backend && DATABASE_URL="sqlite://data/test/test_radicalise.sqlite?mode=rwc" cargo sqlx database reset
    sqlite3 backend/data/test/test_radicalise.sqlite "DELETE FROM circles; DELETE FROM projects;"

playwright:
    mprocs -c mprocs.test.yaml

format:
    cd frontend && npm run format:write
    cd backend && cargo fmt

[working-directory: 'frontend']
gen-api:
    npm run swagger