# Physifit NG Study Guide

## Overview
This project is a Next.js app using the App Router and client-side UI for a fitness platform. It includes:

- Landing page with services and Explore buttons
- Sign-up flow for new clients
- Login page
- Client dashboard with sessions, messages, and fitness plan
- Trainer portal with clients, today's sessions, and messaging
- Book session flow for clients

## Key Technologies

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS

## Important Pages and Files

### `src/app/page.tsx`
- Main landing page
- Hero section, services cards, how it works, testimonials, FAQ
- `Explore Program →` cards now link to `/book-session`

### `src/components/Header.tsx`
- Shared header on public pages
- Includes navigation to Home, Services, How It Works, FAQ, Trainer Portal
- `Login` and `Get Started` buttons on the top right
- Hidden once a user enters dashboard/trainer/admin routes

### `src/app/signup/page.tsx`
- 3-step signup flow: Personal Info → Health Info → Review & Confirm
- Removed default first name, last name, and phone values (fields are empty)
- Account creation uses `useRouter().push('/dashboard')` after confirmation
- `Privacy & Data Policy` section removed, only terms acceptance is required

### `src/app/login/page.tsx`
- Simple login page next to Get Started in the header
- Placeholder sign-in action redirects to `/dashboard`

### `src/app/book-session/page.tsx`
- Book a session flow with service selection, session type, scheduling, and terms
- Uses local state for selected service, session type, preferred date/time, and payment summary

### `src/app/dashboard/page.tsx`
- Client dashboard with Overview, My Sessions, Messages, Fitness Plan tabs
- `View all →` opens the full sessions tab
- Added `+ Book More` button linking to `/book-session`
- Session numbering updated and booking flow updates session display
- Message page supports switching conversations and typing new messages

### `src/app/trainer-portal/page.tsx`
- Trainer portal with My Clients, Today's Sessions, and Messages
- Sign out returns to home
- Today's Sessions cards now allow clicking `Message` to go to the selected client's conversation
- Messaging supports typed replies and switching between client conversations

## Core Code Patterns

### Routing
- Uses Next.js App Router: each `src/app/<route>/page.tsx` defines a route
- Example routes:
  - `/` → `src/app/page.tsx`
  - `/signup` → `src/app/signup/page.tsx`
  - `/login` → `src/app/login/page.tsx`
  - `/book-session` → `src/app/book-session/page.tsx`
  - `/dashboard` → `src/app/dashboard/page.tsx`
  - `/trainer-portal` → `src/app/trainer-portal/page.tsx`

### Client-side state
- Uses `useState` for form data, tab state, selected conversation, and bookings
- Messages are stored in local state arrays and updated when sent

### Navigation
- Internal navigation uses `Link` from `next/link` and `router.push()` from `next/navigation`
- `Sign Out` buttons use `router.push('/')` to return home cleanly

## What to Present

### User flows to demonstrate

1. **Landing page**
   - Show services cards and `Explore Program →`
   - Point out `Login` and `Get Started` buttons

2. **Signup flow**
   - Fill in name, email, password, health info
   - Show review page and terms acceptance
   - Confirm and navigate to dashboard

3. **Dashboard overview**
   - Show total sessions, upcoming sessions, trainer card
   - Click `View all →` to open the full sessions list
   - Click `+ Book More` to navigate to booking flow

4. **Messages**
   - Open messages tab
   - Switch between Amaka, Ngozi, Biodun
   - Type and send a message

5. **Trainer portal**
   - Show My Clients and Today’s Sessions
   - Click `Message` for a client and verify it opens trainer messages
   - Use sign out to return home

### Important code points

- `Header.tsx` controls public navigation and adds the `Login` link
- `signup/page.tsx` demonstrates form state and router redirects
- `dashboard/page.tsx` and `trainer-portal/page.tsx` show how interactive UI state is managed
- `book-session/page.tsx` is the main booking flow

## Deployment and GitHub Checklist

### Files to push to GitHub
Push the source code and configuration files, but not `node_modules`.

Include:

- `package.json`
- `package-lock.json` or `yarn.lock` (if present)
- `next.config.js` (if present)
- `tsconfig.json`
- `tailwind.config.ts`
- `postcss.config.js`
- `src/` directory with all pages and components
- `public/` (if you have static assets)
- `.gitignore` (should exclude `node_modules`, `.next`, and build artifacts)

Do not push:

- `node_modules/`
- `.next/`
- `dist/` or build output
- local environment files like `.env` unless they are safe scoped examples

### Typical Git workflow

1. `git add .`
2. `git commit -m "Add Physifit NG app and documentation"`
3. `git push origin main`

If you use a feature branch:

1. `git checkout -b feature/<name>`
2. `git add .`
3. `git commit -m "Implement <feature>"`
4. `git push -u origin feature/<name>`

### Deploy to GitHub / Vercel

- For GitHub Pages: Not ideal for Next.js App Router. Use Vercel or Netlify instead.
- For Vercel: connect the GitHub repo and deploy the `main` or selected branch.
- For GitHub deployment with workflow: make sure the source files are in the repo root and the CI builds with `npm install && npm run build`.

### Build verification before push
Run locally first:

```bash
npm install
npm run build
npm run lint
```

If build passes, your code is ready to push.

## Final Notes

- The current app is mostly frontend/demo logic; authentication is placeholder.
- The booking and messaging states are handled in React state and not persisted to a backend.
- When presenting, emphasize the app structure, user flows, and how state/navigation works.

---

Feel free to open this file and review it before your presentation.