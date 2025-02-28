![screely-1740699239185](https://github.com/user-attachments/assets/37b6a613-4777-4293-acab-81116265bd49)

# automail.

## Technology Stack

This project is built using the **T3 Stack**, enhanced with additional tools for AI capabilities and payment processing. The tech stack includes:

- ![Clerk](https://img.shields.io/badge/Clerk-Auth-blue) **Authentication**: Clerk
- ![Next.js](https://img.shields.io/badge/Next.js-Framework-black) **Frontend Framework**: Next.js (App Router)
- ![tRPC](https://img.shields.io/badge/tRPC-API-orange) **Backend Framework**: tRPC
- ![Prisma](https://img.shields.io/badge/Prisma-ORM-blue) **Database ORM**: Prisma
- ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue) **Database**: NeonDB (or locally containerized PostgreSQL)
- ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-UI-blue) **UI**: TailwindCSS + ShadCN
- ![Stripe](https://img.shields.io/badge/Stripe-Payments-purple) **Payments**: Stripe *(To be integrated)*
- ![Vercel](https://img.shields.io/badge/Vercel-Hosting-black) **Hosting**: Vercel (potential alternative: self-hosting on EC2 with NGINX as a reverse proxy)
- **AI Capabilities**:
  - ![Gemini API](https://img.shields.io/badge/Gemini-API-green) **Gemini API** for text generation
  - ![Cohere](https://img.shields.io/badge/Cohere-RAG-orange) **Cohere** for RAG-based chatbot
  - ![Orama](https://img.shields.io/badge/Orama-Search-red) **Orama** for full-text search

---
## Project's working and why I couldn't deploy it
📺 **Watch the video:** [YouTube Link](https://www.youtube.com/watch?v=OF3Gb9ic18s)

--- 
## Architectural Flow
![Pasted image 20250210233524](https://github.com/user-attachments/assets/5b08504c-55d8-431b-812e-8c792e43bc83)

---

## Project Structure
```
.
├── bun.lock
├── components.json
├── next.config.js
├── next-env.d.ts
├── package.json
├── package-lock.json
├── postcss.config.js
├── prettier.config.js
├── prisma
│   ├── migrations/
│   ├── migration_lock.toml
│   └── schema.prisma
├── public
│   └── favicon.ico
├── README.md
├── src
│   ├── app
│   │   ├── api/
│   │   ├── _components/
│   │   ├── mail/
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   └── layout.tsx
│   ├── components
│   │   ├── kbar/
│   │   ├── ui/
│   │   ├── link-account-button.tsx
│   │   ├── theme-provider.tsx
│   │   └── theme-toggle.tsx
│   ├── hooks/
│   ├── lib/
│   ├── server/
│   ├── styles/
│   ├── trpc/
│   ├── env.js
│   ├── middleware.ts
│   ├── playground.ts
│   └── page.tsx
├── start-database.sh
├── tailwind.config.ts
└── tsconfig.json

```

## Step Zero: Preliminary Research
Before starting development, the following must be explored:

- [x] **Clerk Authentication** *(Completed)*
- [x] **Aurinko** *(Completed)*
- [x] **Orama Search** *(Completed)*
- [x] **Gemini AI Text Generation** *(Completed)*
- [x] **RAG Chat** *(Completed)*
- [ ] **Stripe payment** *(Pending)*

---

## Development Flow

### 1. Email Client Setup
- Understand how **Aurinko** fetches and manages emails.
- Configure API access for seamless email synchronization.

### 2. Project Bootstrapping
- Set up a **Next.js project** with **Clerk authentication**.
- Integrate **ShadCN UI components**.
- Initialize **Prisma ORM** with a PostgreSQL database.

### 3. API Configuration
- Set up **Aurinko API** to receive and sync emails.
- Implement **database schema** and **webhook management** for real-time updates.

### 4. Search and AI Integration
- Implement **full-text search** using **Orama**.
- Build **UI components** to display emails and threads.
- Implement **search UI** with dynamic filtering.

### 5. AI-Driven Features
- **RAG-based chatbot** using Cohere.
- **AI-assisted replies and email composition** (Copilot-like functionality).

### 6. Payments and Deployment
- Integrate **Stripe for payment processing**.
- Deploy the application on **Vercel or EC2**.
- Create a **landing page** for the SaaS product.

---

## Project Initialization

This project follows the **T3 Stack** setup:

```sh
bun create t3-app@latest  # or use npm
docker run --name postgres-container -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=mysecretpassword -e POSTGRES_DB=postgres -p 5432:5432 -d postgres
```

### Why T3 Stack?
- **TypeScript-first** approach for strong typing.
- **tRPC** enables a seamless full-stack API experience.
- **Next.js** for a robust React framework.
- **Prisma** for efficient database handling.
- **TailwindCSS** for fast UI development.

---

## Clerk Authentication Setup

Clerk provides a complete authentication suite with:
- Multi-factor authentication
- Advanced security & bot detection
- Social sign-on options
- Session management

### Install Clerk
```sh
bun install @clerk/nextjs
```

### Middleware Configuration
Add a **`middleware.ts`** file inside `src/`:
```ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
    '/sign-in(.*)', '/sign-up(.*)'
]) 

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

### Wrapping `layout.tsx` with `<ClerkProvider>`
```tsx
import "~/styles/globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import { TRPCReactProvider } from "~/trpc/react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

---

## Remaining Tasks

### **Critical Integrations:**
- ![Stripe](https://img.shields.io/badge/Stripe-Payments-purple) **Stripe** *(Pending)*
- Rate Limiting *(Pending)*
- **Database Configuration:**
  - Use **NeonDB** as the primary PostgreSQL instance.
  - Alternative: **Self-host PostgreSQL** on **EC2 with NGINX**.

### **AI Improvements:**
- Improve **context handling** in responses.
- Fix **missing `EmailAddress` and Name** in replies.

### **Database Migration**
Instead of `npx prisma migrate`, use:
```sh
bun prisma db push  # Pushes schema to DB
```

**Important:**
Remove the `"query"` param from `db.ts`, as it complicates operations. Further research required.

---

## Deployment Strategy
- **Option 1**: Deploy to **Vercel** *(simple, managed hosting)*
- **Option 2**: Host on **EC2**, using **NGINX** for reverse proxy

---

## Summary
This document outlines the project setup, authentication flow, database configuration, and AI capabilities. Key tasks include AI fine-tuning, Stripe integration, and final deployment. The project follows a **structured approach**, leveraging modern frameworks to build a robust SaaS product.

