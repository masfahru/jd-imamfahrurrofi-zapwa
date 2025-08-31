# JD_010-IMAMFAHRURROFI-ZAPWA

## ZapWA - AI-Powered Customer Service Platform

ZapWA is a full-stack monorepo application designed to provide AI-powered customer service and order management. It features a user-facing dashboard for managing products, orders, and AI agents, alongside a powerful admin panel for user and license management.

## ✨ Features

### User Dashboard
* **Product Management:** Full CRUD (Create, Read, Update, Delete) functionality for your product catalog.
* **Order Management:** Create new orders manually, view order history, and update order statuses (e.g., pending, shipped, delivered).
* **AI Agent Configuration:** Create and manage multiple AI personalities ("agents"). Define their behavior and set one as "active" to handle customer chats.
* **Live Chat Simulation:** A chat interface to test and interact with your active AI agent in real-time.
* **Chat Log Viewer:** Review all conversations between customers and the AI, with filtering options by session, role, and content search.

### Admin Panel
* **User Management:** View all registered users, assign/remove software licenses, and migrate user data between licenses.
* **Admin Management:** (Super Admin only) Create, update, and delete other admin accounts.
* **Secure Authentication:** Role-based access control for users, admins, and super admins.

## 🚀 Tech Stack

This project is a monorepo built with [Turborepo](https://turbo.build/repo) and [Bun](https://bun.sh/) using [BHVR Stack](https://github.com/stevedylandev/bhvr).

| Area          | Technology                                                                                                  |
| ------------- | ----------------------------------------------------------------------------------------------------------- |
| **Backend** | [Hono](https://hono.dev/) on Bun, TypeScript, [Drizzle ORM](https://orm.drizzle.team/), PostgreSQL, [better-auth](https://better-auth.dev/) |
| **Frontend** | [React](https://react.dev/) with [Vite](https://vitejs.dev/), TypeScript, [Tailwind CSS](https://tailwindcss.com/), shadcn/ui            |
| **AI** | [LangChain.js](https://js.langchain.com/) with OpenAI                                                        |
| **State Mgt** | [Zustand](https://zustand-demo.pmnd.rs/)                                                                    |
| **Data Fetch**| [TanStack Query](https://tanstack.com/query/latest)                                                         |
| **API Docs** | OpenAPI (via `@hono/zod-openapi`) with [Scalar](https://github.com/scalar/scalar) UI                        |

## 📂 Project Structure

The repository is structured as a monorepo with three main packages:

* `client/`: The React frontend application.
* `server/`: The Hono backend API.
* `shared/`: Shared TypeScript types and utilities between the client and server.

## 🏁 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

* [Bun](https://bun.sh/docs/installation) (v1.2.4 or higher)
* [PostgreSQL](https://www.postgresql.org/download/)

### 1. Clone the Repository

```bash
git clone [https://github.com/masfahru/jd-imamfahrurrofi-zapwa.git](https://github.com/masfahru/jd-imamfahrurrofi-zapwa.git)
cd jd-imamfahrurrofi-zapwa
```

### 2. Install Dependencies

Install all dependencies for all workspaces using a single command from the root directory:

Bash

```
bun install

```

### 3. Environment Configuration

You need to set up environment variables for both the server and the client.

**For the Server:**

1.  Navigate to the `server` directory.

2.  Copy the example environment file: `cp .env.example .env`

3.  Edit the `.env` file with your credentials:

    Code snippet

    ```
    # Your PostgreSQL connection string
    DATABASE_URL='postgresql://root:root@localhost:5432/zapwa'

    # A strong secret for session encryption (generate with: openssl rand -base64 32)
    BETTER_AUTH_SECRET='YOUR_BETTER_AUTH_SECRET'

    # Your OpenAI API key
    OPENAI_API_KEY="sk-..."

    ```

**For the Client:**

1.  Navigate to the `client` directory.

2.  Copy the example environment file: `cp .env.example .env`

3.  The default value should work for local development, but you can edit it if your server runs on a different port.

    Code snippet

    ```
    VITE_SERVER_URL='http://localhost:3000'
    ```

### 4. Database Setup

From the **root** of the project, run the following commands to set up your PostgreSQL database schema and seed it with the initial super admin user.

1.  **Generate Migrations:** (Optional, only if you change the schema)

    Bash

    ```
    bun db:generate
    ```

2.  **Apply Migrations:** This will create all the necessary tables in your database.

    Bash

    ```
    bun db:migrate
    ```

3.  **Seed the Database:** This creates the default super admin user.

    Bash

    ```
    bun db:seed
    ```

### 5. Running the Application

Run both the client and server concurrently in development mode from the **root** directory:

Bash

```
bun dev
```

-   The backend server will start on `http://localhost:3000`.

-   The frontend development server will start on `http://localhost:5173`.

🔑 Default Credentials
----------------------

After seeding the database, you can log in to the admin panel with the following credentials:

-   **Email:** `super@admin.com`

-   **Password:** `superadmin`

📚 API Documentation
--------------------

Once the server is running, you can view the complete OpenAPI documentation for the backend API, generated by Scalar:

[http://localhost:3000/api/reference](http://localhost:3000/api/reference)

### 🛠️ Available Scripts

The following scripts are available in the root `package.json` and can be run with `bun run <script_name>` from the project's root directory:

| Script         | Description                                                        |
| -------------- | ------------------------------------------------------------------ |
| `dev`          | Starts both client and server in development mode using Turborepo.|
| `dev:client`   | Starts only the client development server.|
| `dev:server`   | Starts only the server development server.|
| `build`        | Builds both the client and server applications for production.|
| `lint`         | Lints the code in all workspaces to check for errors and style issues.|
| `type-check`   | Runs the TypeScript compiler to check for type errors across the monorepo.|
| `db:generate`  | Generates Drizzle ORM migration files based on schema changes.          |
| `db:migrate`   | Applies any pending database migrations to your PostgreSQL database.  |
| `db:seed`      | Seeds the database with initial data, such as creating the default super admin user. |
