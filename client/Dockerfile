# ---- Stage 1: Build ----
# Use the official Bun image AS the base for our build stage.
FROM oven/bun:1 AS builder

# Set the working directory inside the container.
WORKDIR /app

# Copy root configuration files first to leverage Docker layer caching.
# If these files don't change, Docker won't need to reinstall dependencies.
COPY package.json bun.lock turbo.json tsconfig.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/
COPY shared/package.json ./shared/

# Install all monorepo dependencies using Bun.
RUN bun install --frozen-lockfile

# Copy the rest of the source code.
COPY . .

# Run the Turborepo build command, filtered for only the 'client' app.
# This creates the optimized production build in the 'client/dist' directory.
RUN bun run build --filter=client


# ---- Stage 2: Serve ----
# Use a lightweight Nginx image for the final production stage.
FROM nginx:1.27-alpine AS final

# Copy the custom Nginx configuration file from your local machine to the container.
# This file is necessary to make a Single-Page Application (SPA) work correctly with routing.
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built static files from the 'builder' stage to the Nginx public directory.
COPY --from=builder /app/client/dist /usr/share/nginx/html

# Expose port 80 to allow traffic to the Nginx server.
EXPOSE 80

# The default Nginx command will start the server. No need for an explicit CMD.
