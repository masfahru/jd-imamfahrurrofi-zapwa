ZapWA - AI-Powered Commerce Platform
=============================================

Overview
--------

ZapWA is a powerful web application designed to help businesses sell products and manage customer interactions through an AI-driven WhatsApp interface. It features two distinct panels:

1.  **Admin Dashboard**: For system administrators to manage users, licenses, and other administrators.

2.  **User Dashboard**: For business owners to manage their products, track orders, and configure their personalized AI agents.

This project is built with a modern tech stack, focusing on performance, scalability, and a great developer experience.

Features
--------

### Admin Dashboard

-   **Secure Authentication**: Role-based login for "admin" and "super admin" roles.

-   **User Management**: View a paginated and searchable list of all application users.

-   **License Management**: Assign new licenses to users, remove licenses, and swap licenses between users.

-   **Data Migration**: Securely migrate all data (products, orders, customers) from one user's license to another before deleting the old license.

-   **Admin Management (Super Admin Only)**: Create, edit, update passwords for, and delete other admin accounts.

### User Dashboard

-   **Secure User Authentication**: Separate login and signup system for business users.

-   **Product Management**: Full CRUD (Create, Read, Update, Delete) functionality for products, including details like name, SKU, price, image URL, and description.

-   **Order Management**: A complete system to create, view, update the status of, and delete customer orders.

-   **AI Agent Configuration**: Create and manage multiple AI agents, each with a unique name and behavior (personality). The active agent is used to respond to customer chats.

-   **Live Chat Simulation**: An interactive chat interface to test the active AI agent's responses and capabilities in real-time.

-   **Chat Log Viewer**: A detailed and filterable log of all conversations, showing the session, role (user, assistant, tool), message content, and token usage.

Tech Stack
----------

-   **Frontend Framework**: [React](https://react.dev/) with [Vite](https://vitejs.dev/)

-   **Language**: [TypeScript](https://www.typescriptlang.org/)

-   **UI Components**: [Shadcn/UI](https://ui.shadcn.com/)

-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)

-   **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)

-   **Data Fetching & Caching**: [TanStack Query (React Query)](https://tanstack.com/query/latest)

-   **Form Handling**: [Mantine Form](https://mantine.dev/form/)

-   **Routing**: [React Router](https://reactrouter.com/)

-   **Icons**: [Lucide React](https://lucide.dev/)

-   **Notifications**: [Sonner](https://sonner.emilkowal.ski/)

Getting Started
---------------

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

-   Bun (https://bun.sh/) installed.

### Installation

1.  **Clone the repository:**

    Bash

    ```
    git clone <your-repository-url>
    cd client
    ```

2.  **Install dependencies:** :

    Bash

    ```
    bun install
    ```

### Running the Application

1.  **Set up environment variables:** Create a `.env` file in the `client/` directory by copying the example file.

    Bash

    ```
    cp .env.example .env
    ```

    Open the `.env` file and set the `VITE_SERVER_URL` to point to your backend server's address.

    Code snippet

    ```
    VITE_SERVER_URL='http://localhost:3000'
    ```

2.  **Start the development server:**

    Bash

    ```
    bun run dev
    ```

    The application will be available at `http://localhost:5173` (or the next available port).

Directory Structure
-------------------

Here is a high-level overview of the project's folder structure:

```
client/
├── public/               # Static assets like favicons and images
├── src/
│   ├── assets/           # Reusable SVG components
│   ├── components/       # Shared React components
│   │   ├── dialogs/      # Dialog/modal components for CRUD operations
│   │   ├── layout/       # Layout components (Sidebar, Header, etc.)
│   │   └── ui/           # UI primitives from Shadcn/UI
│   ├── lib/              # Core logic, utilities, and state management
│   │   ├── authStore.ts  # Zustand store for authentication
│   │   └── utils.ts      # Utility functions (e.g., cn for classnames)
│   ├── pages/            # Page components mapped to routes
│   │   ├── admin/        # Pages for the Admin Dashboard
│   │   └── user/         # Pages for the User Dashboard
│   ├── App.tsx           # Main application component with routing setup
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles and Tailwind CSS imports
├── .gitignore            # Files and directories to be ignored by Git
├── package.json          # Project dependencies and scripts
└── vite.config.ts        # Vite build and development configuration
```
