# RADicalixe

## Development

### Pre-requisites

#### ASDF

The ASDF package manager is used to install nodejs of the correct version. Install it via details at https://asdf-vm.com/guide/getting-started.html

Once this is done, in the root directory of this project run `asdf install`.

#### Direnv

Direnv is used to load environment variables. It's likely already installed on your system. To approve this direnv config, run `direnv allow` from the root of this project.

If it's not installed, it can be installed on ubuntu/debian systems with `sudo apt install direnv`, followed by enabling it in your shell. If you're using oh-my-zsh, you can do this by adding `direnv` to the list of plugins in your `~/.zshrc` file.

### Frontend

The frontend is a React app using Vite and react-router. From the frontend dir, packages are installed using `npm install`, and the the code is run in development mode using `npm run dev`.

For more details see [frontend/README.md](./frontend/README.md).

### Backend

The backend is a rust app using Axum. From the backend dir, the code is run in development mode using `cargo run`. Packages are automatically fetched if needed.

#### Database

The app uses an SQLlite database, that will be auto-generated in the backend directory when the backend is run. It will be called `radicalise.sqlite`.

Each time the app is run, any migration files in the `backend/migrations` directory will be run.

Database migrations are performed by a tool called sqlx, available through cargo. For documentation, see https://lib.rs/crates/sqlx-cli

To create a migration, run `cargo sqlx migrate add some_migration_name` where `some_migration_name` is replaced with a short name describing the migration. This should create a fresh file in the migrations directory.

The SQLlite changes to the database can then be added to the migration file.
These changes should be automatically run when you re-start the app, but if not, run `cargo sqlx migrate run`.
