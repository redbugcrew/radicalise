setup:
    npm install && cd frontend && npm install

dev:
    mprocs

release:
    npm run release

[working-directory: 'frontend']
gen-api:
    npm run swagger