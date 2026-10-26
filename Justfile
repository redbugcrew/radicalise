setup:
    npm install && cd frontend && npm install

dev:
    mprocs

release:
    npm run release

db-schema:
    sqlite3 backend/data/dev/radicalise.sqlite ".schema"

playwright:
    mprocs -c mprocs.test.yaml

[working-directory: 'frontend']
gen-api:
    npm run swagger