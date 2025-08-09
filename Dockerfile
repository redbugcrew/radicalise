# FRONTEND BUILDER
FROM --platform=$BUILDPLATFORM node:22 AS vitebuilder
WORKDIR /app
COPY ./frontend .
RUN npm install && npm run build

# BACKEND BUILDER
FROM --platform=$BUILDPLATFORM rust:1 AS rustbuilder
ARG TARGETARCH
WORKDIR /app

# should write /.platform and /.compiler
COPY --chmod=555 deployment/platform.sh .
RUN ./platform.sh

# setup rust compilation for the target platform
RUN rustup component add rustfmt
CMD /bin/bash
RUN rustup target add $(cat /app/.platform)
RUN apt-get update && apt-get install -y unzip $(cat /app/.compiler) pkg-config libssl-dev
COPY deployment/cargo-config.toml ./.cargo/config

# Compile the backend
COPY ./backend .
RUN RUSTFLAGS=-g SQLX_OFFLINE=true cargo build --release --target $(cat /app/.platform)
RUN cp /app/target/$(cat /app/.platform)/release/radicalise /app/radicalise

# RUNNER
FROM ubuntu AS runner
COPY --from=rustbuilder /app/radicalise /app/backend/radicalise
COPY --from=vitebuilder /app/dist /app/frontend
ENV FRONTEND_PATH=/app/frontend
ENV DATABASE_URL=sqlite:/app/radicalise.sqlite
EXPOSE 8200
WORKDIR /app/backend
CMD ["./radicalise"]
