# ---- Stage 1: Install Production Dependencies ----
# This stage is dedicated to installing only production dependencies.
FROM oven/bun:1 AS deps

# Set the working directory.
WORKDIR /app

# Copy root configuration files first for better caching.
COPY package.json bun.lock turbo.json tsconfig.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/
COPY shared/package.json ./shared/

# Install ONLY production dependencies for the entire monorepo.
# This reduces the size of our final image.
RUN bun install --frozen-lockfile --production


# ---- Stage 2: Build Application ----
# This stage builds the TypeScript source code into JavaScript.
FROM oven/bun:1 AS builder

# Set the working directory.
WORKDIR /app

# Copy all monorepo files.
COPY . .
# Install all dependencies (including devDependencies like TypeScript)
RUN bun install --frozen-lockfile

# Run the Turborepo build command, filtered for only the 'server' app.
# This compiles TypeScript to JavaScript in the 'server/dist' directory.
RUN bun run build --filter=server


# ---- Stage 3: Production ----
# This is the final, lightweight image that will run in production.
FROM oven/bun:1

# Set the working directory.
WORKDIR /app

# Set the environment to production.
ENV NODE_ENV=production

# Copy production dependencies from the 'deps' stage.
COPY --from=deps /app/node_modules ./node_modules
COPY server/package.json ./server/
COPY shared/package.json ./shared/

# Copy the compiled JavaScript code from the 'builder' stage.
COPY --from=builder /app/server/dist ./server/dist

# Copy the Drizzle migration files, which are needed for running migrations.
COPY --from=builder /app/server/drizzle ./server/drizzle

# <-- ADD THIS LINE -->
# Copy the Drizzle config file, which is required by the migrate command.
COPY --from=builder /app/server/drizzle.config.ts ./server/drizzle.config.ts

# Expose the port the server will listen on.
# The default is 3000.
EXPOSE 3000

# The command to start the server. It runs the compiled entrypoint.
CMD ["bun", "run", "server/dist/index.js"]
