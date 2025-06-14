# RADicalixe

## Development

### Pre-requisites

#### ASDF

The ASDF package manager is used to install nodejs of the correct version. Install it via details at https://asdf-vm.com/guide/getting-started.html

Once this is done, in the root directory of this project run `asdf install`.

#### Direnv

Direnv is used to load environment variables. It's likely already installed on your system. To approve this direnv config, run `direnv allow` from the root of this project.

### Frontend

The frontend is a React app using Vite and react-router. From the frontend dir, packages are installed using `npm install`, and the the code is run in development mode using `npm run dev`.

For more details see [frontend/README.md](./frontend/README.md).

### Backend

The backend is a rust app using Axum. From the backend dir, the code is run in development mode using `cargo run`. Packages are automatically fetched if needed.

#### Database

The app uses an SQLlite database, that will be auto-generated in the backend directory when the backend is run. It will be called `radicalise.sqlite`.

Each time the app is run, any migration files in the `backend/migrations` directory will be run.

To perform more detailed operations on the database, you'll need the sqlx command line tools. Install this with `cargo install sqlx-cli`.

To create a migration, run `sqlx migrate add some_migration_name` where `some_migration_name` is replace with a short name describing the migration. This should create a fresh file in the migrations directory.

These should be automatically run when you re-start the app, but if not, run `sqlx migrate run`.
