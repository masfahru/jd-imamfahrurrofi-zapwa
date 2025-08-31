ZapWA API Server
================

This is the backend server for ZapWA, an AI-powered commerce platform. It provides a robust API for managing users, products, orders, and interacting with an intelligent chat assistant.

Features
--------

-   **Authentication & Authorization:** Secure user sign-up and sign-in with role-based access control (User, Admin, Super Admin) powered by `better-auth`.

-   **Admin Panel:** Endpoints for super admins to manage other admin users, and for all admins to manage regular users and their licenses.

-   **License Management:** Admins can create, assign, reassign, and remove licenses for users, controlling access to the platform's features.

-   **Product Management:** Logged-in users can perform full CRUD (Create, Read, Update, Delete) operations on their product catalog.

-   **Order Management:** Users can create new orders and manage the status of existing ones.

-   **AI Chat Assistant:** An intelligent agent powered by LangChain and OpenAI that can:

    -   Answer product questions based on the user's catalog.

    -   Check the status of existing orders.

    -   Create new orders through natural conversation.

-   **Chat Logging:** All conversations with the AI assistant are logged for review and analysis, including token usage.

-   **API Documentation:** Automatically generated OpenAPI 3.0 documentation with a beautiful Scalar UI.

Tech Stack
----------

-   **Runtime:** [Bun](https://bun.sh/)

-   **Framework:** [Hono](https://hono.dev/)

-   **Language:** TypeScript

-   **Database:** PostgreSQL

-   **ORM:** [Drizzle ORM](https://orm.drizzle.team/)

-   **Authentication:** [better-auth](https://www.google.com/search?q=https://better-auth.dev/)

-   **AI Integration:** [LangChain.js](https://js.langchain.com/), OpenAI

Project Structure
-----------------

The project is organized into a modular, feature-based architecture.

```
server/
├── drizzle/              # Drizzle ORM migration files and snapshots
└── src/
    ├── core/             # Core modules (db, auth middleware, configs, utils)
    └── features/         # Feature-based modules
        ├── admin/        # Admin user and license management
        ├── ai/           # AI chat, agent configuration, and tools
        ├── auth/         # Authentication routes
        ├── chat-log/     # Routes for viewing AI chat history
        ├── order/        # Order management
        ├── product/      # Product management
        └── user/         # User profile and sign-up
    └── index.ts          # Main application entry point
```

API Documentation
-----------------

Once the server is running, you can access the interactive API documentation:

-   **Scalar UI:** [http://localhost:3000/api/reference](https://www.google.com/search?q=http://localhost:3000/api/reference)

-   **OpenAPI Spec (JSON):** [http://localhost:3000/api/doc](https://www.google.com/search?q=http://localhost:3000/api/doc)

Getting Started
---------------

Follow these steps to get the server up and running on your local machine.

### Prerequisites

-   [Bun](https://bun.sh/) installed

-   [PostgreSQL](https://www.postgresql.org/) server running

### Installation & Setup

1.  **Clone the repository** (if you haven't already):

    Bash

    ```
    git clone <your-repository-url>
    cd server
    ```

2.  **Install dependencies:**

    Bash

    ```
    bun install
    ```

3.  **Set up environment variables:** Copy the example environment file and fill in your details.

    Bash

    ```
    cp .env.example .env
    ```

    You will need to provide your PostgreSQL database URL and your OpenAI API key in the `.env` file.

    Code snippet

    ```
    DATABASE_URL='postgresql://user:password@host:port/dbname'
    BETTER_AUTH_SECRET='your-long-random-secret-key' # Run `openssl rand -base64 32` to generate one
    OPENAI_API_KEY='sk-...'
    ```

4.  **Run database migrations:** This command creates all the necessary tables in your database based on the Drizzle schema.

    Bash

    ```
    bun run db:migrate
    ```

5.  **Seed the database:** This script creates the initial super admin user so you can log in and start using the API.

    -   **Email:** `super@admin.com`

    -   **Password:** `superadmin`

    Bash

    ```
    bun run db:seed
    ```

6.  **Start the development server:**

    Bash

    ```
    bun run dev
    ```

    The server will start on `http://localhost:3000`.

Available Scripts
-----------------

-   `bun run dev`: Starts the development server with hot-reloading.

-   `bun run build`: Compiles the TypeScript code to JavaScript in the `dist/` directory.

-   `bun run lint`: Lints and automatically fixes code style issues.

-   `bun run db:generate`: Generates a new database migration file based on changes in `src/core/db/schema.ts`.

-   `bun run db:migrate`: Applies all pending database migrations.

-   `bun run db:seed`: Seeds the database with initial data (e.g., the super admin user).
