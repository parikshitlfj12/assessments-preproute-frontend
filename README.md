# PrepRoute — Test Management Application

A 5-page test management application for creating, editing, and publishing MCQ-based
tests. Built for the Preproute Frontend Developer task with a focus on clean code
structure, robust API integration, and a UI that follows the provided Figma design.

> **Live flow:** Login → Dashboard → Create/Edit Test → Add Questions → Preview & Publish

---

## Tech Stack

| Concern | Choice | Why |
| --- | --- | --- |
| Framework | **React 18 + TypeScript** | Required; type safety across the API layer. |
| Build tool | **Vite** | Fast dev server + HMR. |
| Routing | **React Router v6** | Nested layout routes + protected routes. |
| Server state | **TanStack Query (React Query)** | Caching, loading/error states, and cache invalidation for all API data. |
| Client state | **Zustand** | Tiny, boilerplate-free store for the auth session. |
| Data fetching | **Axios** | Central instance with JWT + error interceptors. |
| Forms & validation | **React Hook Form + Zod** | Declarative validation with `zodResolver`. |
| Styling | **Tailwind CSS** | Rapidly match the Figma design system with a consistent token set. |
| Icons / toasts | **lucide-react**, **react-hot-toast** | Lightweight, consistent iconography and feedback. |
| Sanitization | **DOMPurify** | Cleans rich-text HTML (from the editor, pastes, and the API) to prevent XSS. |

---

## Getting Started

### Prerequisites
- Node.js **18+** (developed on Node 20)

### Install & run

```bash
npm install
npm run dev
```

The app runs at **http://localhost:3000**.

> ⚠️ **Port matters.** The staging backend's CORS allowlist only accepts
> `http://localhost:3000`, so the dev server is pinned to that port
> (`strictPort: true`). Running on any other port will cause the browser to block
> API calls with a CORS error.

### Environment

Configuration lives in `.env` (see `.env.example`):

```
VITE_API_BASE_URL=https://admin-moderator-backend-staging.up.railway.app/api
```

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server (port 3000). |
| `npm run build` | Type-check (`tsc -b`) and build for production. |
| `npm run preview` | Preview the production build (port 3000). |
| `npm run lint` | Run ESLint. |
| `npm run typecheck` | Type-check without emitting. |

### Test credentials

```
User ID:  vedant-admin
Password: vedant123
```

---

## Project Structure

```
src/
├── api/            # One module per resource (auth, taxonomy, tests, questions)
├── components/
│   ├── common/     # PageHeader, TestInfoCard, TestDetailsFields, EditTestModal
│   ├── layout/     # AppLayout, Sidebar, Topbar
│   ├── questions/  # QuestionEditor, QuestionPreviewCard
│   └── ui/         # Reusable primitives (Button, Input, Select, MultiSelect, Modal, RichTextEditor…)
├── hooks/          # React Query hooks + the shared useTestForm form hook
├── lib/            # axios instance, query client, constants, validation, csv parser, utils (incl. sanitizeHtml)
├── pages/          # One component per screen (Login, Dashboard, CreateEditTest…)
├── routes/         # ProtectedRoute, AuthWatcher (401 handling)
├── store/          # Zustand auth store
└── types/          # Central domain & API types
```

---

## The 5 Pages

1. **Login** — `userId` / `password` with validation. Stores the JWT + user in
   `localStorage` and redirects to the dashboard. Shows friendly errors on failure.
2. **Dashboard** — All tests in a responsive table (cards on mobile) with summary
   stats, **search** (name/subject), **status & subject filters**, **pagination**,
   and **View / Edit / Delete** actions (delete is confirmed via a modal).
3. **Create / Edit Test** — Test name, type, difficulty, subject → topics →
   sub-topics (dependent multi-selects), marking scheme, and configuration, with a
   **live preview** of the test summary card. Supports **Save as Draft** and
   **Next: Add Questions**.
4. **Add Questions** — Builder layout with a question-list rail and an MCQ editor:
   4 options with mark-correct, a **rich-text formatting bar** for the question
   (bold / italic / underline / strikethrough / lists / links, stored as HTML),
   an optional **image** per question (via URL, stored as `media_url`), plus
   explanation, difficulty and topic / sub-topic. Questions can be added
   manually **or bulk-imported from CSV** (with a downloadable template), and
   edited / deleted on the staged list. The editor is capped at the test's
   configured question count, and at least one question is required to continue.
5. **Preview & Publish** — Full read-only overview of the test and every question
   (correct option highlighted), plus a publish panel with **Publish Now** /
   **Schedule** and **Live Until** duration options.

---

## Key Technical Decisions

- **Server vs. client state are kept separate.** React Query owns all remote data
  (tests, taxonomy, questions) with cache invalidation on mutations; Zustand only
  holds the auth session. This avoids duplicating server data in a global store.
- **Centralised Axios instance** injects the `Authorization: Bearer <token>` header
  and dispatches a global event on `401` so the app can log out and redirect from
  one place (`AuthWatcher`).
- **Read/write model asymmetry is handled explicitly.** `GET /tests` returns
  subject/topics/sub-topics as **names**, but create/update expect **UUIDs**. On the
  edit screen the app re-hydrates the form by mapping the returned names back to IDs
  (subject → its topics → their sub-topics), staged as each dependent list loads.
- **Reusable, accessible UI primitives** (Button, Input, Select, MultiSelect, Modal,
  Badge) keep the pages declarative and the styling consistent with the Figma tokens.
- **The test-details form is defined once.** `useTestForm` (state, cascading taxonomy
  queries, edit hydration, payload building) and `TestDetailsFields` (presentation)
  are shared by both the full Create/Edit page and the in-flow Edit modal, so the two
  entry points can never drift apart.
- **Validation** is schema-driven with Zod so rules live in one place and are shared
  between the form and the submit payload.
- **Rich text is stored as sanitized HTML.** The question editor is a lightweight,
  dependency-free `contentEditable` (`RichTextEditor`) that emits HTML. Every entry
  point — external values loaded from the API, clipboard pastes, and the final
  render — is passed through a `sanitizeHtml` helper (DOMPurify with a strict tag /
  attribute allowlist), so untrusted markup can never execute (XSS defense in depth).
- **CSV bulk import is fully client-side.** `lib/csv.ts` parses the upload, maps
  flexible header aliases, normalizes values, validates each row against the same Zod
  schema, and reports skipped / over-limit rows — then feeds the drafts through the
  existing `POST /questions/bulk` flow (no new backend needed). A matching template
  is generated for download.

---

## Backend Notes / Deviations from the Shared Doc

While integrating, a few behaviours differed from the provided API document. These
were verified against the live staging API and handled in code:

- **Response envelope** uses `{ status: "success", message, data }` (the doc showed
  `success: true`). Types and the Axios error helper follow the real shape.
- **CORS** allows only `http://localhost:3000` — hence the pinned dev port.
- **`POST /questions/bulk`** additionally requires a **`subject`** field (the subject
  *name*) on every question; `topic` / `sub_topic` are optional. Sending without
  `subject` returns `400 Validation failed`.
- **`PUT /tests/:id`** validates `scheduled_date` / `expiry_date` as ISO-8601 and
  **rejects explicit `null`s** — these fields are therefore only sent when a real
  value exists.
- **Test statuses** observed on the backend are `draft`, `live`, `expired`,
  `unpublished` (there is no dedicated `scheduled` status). "Schedule" therefore
  publishes the test (`status: "live"`) with a future `scheduled_date`.

## Known Limitations

- The documented question API only supports **bulk create** and **bulk fetch**
  (no per-question update/delete endpoints). Editing an already-saved question is
  therefore limited: new questions are created on save, and existing ones are
  re-linked by ID.
- `Delete` on the dashboard calls `DELETE /tests/:id` (RESTful convention); errors
  are surfaced via a toast if the backend rejects it.

---

## Deployment (Vercel)

The app is deployment-ready for Vercel and needs no dashboard configuration:

1. Push the repo to GitHub and import it into Vercel (framework auto-detects as
   **Vite** → build `npm run build`, output `dist/`).
2. Deploy. That's it.

**Why it works despite the CORS allowlist.** The staging backend only allows the
`http://localhost:3000` origin, so a browser on a `*.vercel.app` origin would be
blocked. To avoid depending on the backend team, production calls the **same Vercel
origin** instead of Railway:

- `.env.production` sets `VITE_API_BASE_URL=/api`, so the browser requests
  `/api/*` on the Vercel domain (same-origin — no CORS preflight).
- `vercel.json` rewrites `/api/*` to the Railway backend **server-side**, where
  browser CORS rules don't apply. A second rewrite sends all other paths to
  `index.html` so client-side routes survive a refresh.

Local development is unaffected: `.env` still points straight at Railway and runs
on the allowlisted `http://localhost:3000`.
