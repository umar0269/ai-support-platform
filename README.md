# AI Support Platform

An AI-powered customer support platform built with Next.js 16, Supabase, and OpenAI. It enables businesses to upload knowledge-base documents, embed an AI chat widget on any website, and manage support tickets — all backed by a RAG (Retrieval-Augmented Generation) pipeline.

## Features

- **Embeddable chat widget** — drop a single `<script>` tag on any site to add AI support chat
- **RAG pipeline** — documents are chunked, embedded, and stored as vectors; the chat API retrieves relevant context before generating answers
- **Admin dashboard** — upload/delete documents, browse knowledge base, manage support tickets
- **Ticket management** — chats that the AI cannot resolve are escalated to human support tickets
- **PDF ingestion** — upload PDFs; text is extracted, chunked, and embedded automatically
- **Playground** — test the RAG chat directly in the browser at `/playground`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Database & Auth | Supabase (PostgreSQL + pgvector) |
| AI / LLM | OpenAI API |
| Embeddings | OpenAI or Ollama (configurable) |
| Styling | Tailwind CSS v4 |
| Language | TypeScript |

## Project Structure

```
src/
├── app/
│   ├── admin/          # Admin dashboard (documents, upload, tickets)
│   ├── api/            # API routes (chat, documents, tickets, upload)
│   ├── demo/           # Demo page
│   ├── playground/     # RAG chat playground
│   └── widget-frame/   # Iframe rendered inside the embeddable widget
├── components/
│   ├── admin/          # Sidebar, StatusBadge
│   └── widget/         # ChatWidget, ChatWindow, ChatBubble, ChatHeader, ChatInput
├── hooks/              # useDocuments, useDocument, useTickets, useUploadDocument
├── lib/
│   ├── chunking/       # Text chunking logic
│   ├── embedding/      # Embedding provider (OpenAI / Ollama factory)
│   ├── llm/            # LLM provider factory (OpenAI / Ollama)
│   ├── openai/         # OpenAI client
│   ├── pdf/            # PDF text extraction
│   ├── supabase/       # Supabase client (browser + server)
│   └── widget/         # Widget API helpers and local storage utils
├── repositories/       # Data-access layer (documents, chunks, tickets, vector search)
├── services/           # Business logic (chat, document processor, embeddings, escalation, prompt builder, retrieval)
└── types/              # Shared TypeScript types
public/
└── widget.js           # Self-contained embeddable chat widget script
supabase/
└── migrations/         # Database migrations (schema, storage, indexes, vector, RPC, tickets)
```

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project with the `pgvector` extension enabled
- An OpenAI API key

### 1. Clone and install

```bash
git clone <repo-url>
cd ai-support-platform
npm install
```

### 2. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run database migrations

Apply the migrations in order using the Supabase CLI or the SQL editor in the Supabase dashboard:

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_storage_policy.sql
supabase/migrations/003_indexes.sql
supabase/migrations/004_vector_768.sql
supabase/migrations/005_match_chunks_rpc.sql
supabase/migrations/006_support_tickets.sql
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Key Routes

| Route | Description |
|-------|-------------|
| `/` | Landing / home page |
| `/admin` | Admin dashboard overview |
| `/admin/documents` | Browse and delete knowledge-base documents |
| `/admin/upload` | Upload new PDF documents |
| `/admin/tickets` | View and manage support tickets |
| `/playground` | Interactive RAG chat playground |
| `/demo` | Embeddable widget demo |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | Send a message; returns an AI response using RAG |
| `GET` | `/api/documents` | List all documents |
| `DELETE` | `/api/documents/[id]` | Delete a document and its chunks |
| `POST` | `/api/upload` | Upload and process a PDF document |
| `GET` | `/api/tickets` | List support tickets |
| `PATCH` | `/api/tickets/[id]` | Update a ticket (status, assignment, etc.) |

## Embedding the Chat Widget

Add the following snippet to any website to embed the AI support chat:

```html
<script>
  window.AI_SUPPORT_CONFIG = {
    apiUrl: "https://your-domain.com",
    projectId: "your-project-id"
  };
</script>
<script src="https://your-domain.com/widget.js"></script>
```

The widget auto-derives the `apiUrl` from its own script `src` if `window.AI_SUPPORT_CONFIG` is not set.

## Scripts

```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run start   # Start production server
npm run lint    # Run ESLint
```
