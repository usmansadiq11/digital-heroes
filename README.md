# Digital Heroes

**Play. Give. Win.**

Digital Heroes is a charity-first golf rewards platform that connects golf performance with social impact.

Members can maintain their latest golf scores, participate in monthly reward draws, choose a charity and contribution percentage, track winnings, and complete winner verification. Administrators have a dedicated control panel for users, subscriptions, charities, draws, winners, donations, and reporting.

The project was developed as a full-stack implementation of the Digital Heroes product requirements using **Next.js, TypeScript, Tailwind CSS, Supabase, and PostgreSQL**.

---

## Overview

Digital Heroes brings three experiences together:

* **Golf performance** — members maintain their latest five scores.
* **Monthly rewards** — eligible members can enter monthly number draws.
* **Charitable giving** — members choose a charity and decide how much of their contribution goes toward it.

The platform supports three main user experiences:

| Role              | Experience                                                                         |
| ----------------- | ---------------------------------------------------------------------------------- |
| Public visitor    | Explore the platform, charities, how it works, and draw information                |
| Registered member | Manage scores, subscription, charity contribution, draw participation and winnings |
| Administrator     | Manage users, charities, draws, winners, donations and reports                     |

---

## Key Features

### 1. Authentication & Role-Based Access

Digital Heroes uses Supabase Authentication for account management.

Implemented:

* Email-based signup and login
* Authenticated user sessions
* Automatic profile creation
* User/admin role separation
* Automatic routing based on account role
* Protected admin routes
* Public access to charity discovery
* Secure database access using Row Level Security (RLS)

The application uses Supabase's Next.js integration and `@supabase/ssr` for the Supabase client setup.

---

### 2. Subscription System

Members can select between:

* Monthly membership — ₹10
* Yearly membership — ₹100

The application supports subscription states including:

* Active
* Cancelled
* Lapsed

Implemented subscription behaviour includes:

* Subscription creation
* Monthly/yearly plan selection
* Renewal date tracking
* Cancellation
* Lapsed subscription detection
* Subscription status displayed on the member dashboard
* Draw participation restricted to active members
* Renewal flow for lapsed members

The current assignment implementation uses a **demo checkout flow** so the complete subscription lifecycle can be demonstrated without requiring a live payment-provider account.

The subscription layer is structured so a production payment provider such as Stripe can be connected to the same membership lifecycle later.

---

## 3. Golf Score Management

Members can maintain their golf performance history directly from the dashboard.

Implemented rules:

* Scores are limited to **1–45**
* A score date is required
* Only the latest **5 scores** are retained
* Scores are displayed in reverse chronological order
* Duplicate score dates for the same user are prevented
* Adding a sixth score removes the oldest retained score
* Existing scores can be edited
* Scores can be deleted

Administrators can also review and manage member scores from the admin panel.

This implements the rolling five-score requirement from the product specification.

---

## 4. Monthly Draw Engine

Digital Heroes includes a dedicated draw engine for monthly rewards.

Each draw generates five unique numbers from the supported score range.

Supported match tiers:

* **5-number match**
* **4-number match**
* **3-number match**

### Prize allocation

The prize pool is distributed according to the defined reward structure:

| Match     | Prize Pool Allocation |
| --------- | --------------------: |
| 5 numbers |                   40% |
| 4 numbers |                   35% |
| 3 numbers |                   25% |

If multiple members qualify for the same tier, that tier's prize allocation is divided between the qualifying winners.

### Jackpot rollover

When there is no 5-number winner, the jackpot allocation can roll into the next draw.

The following draw therefore includes the previous rollover amount when calculating the available prize pool.

---

## 5. Draw Simulation

The admin draw management panel provides two simulation approaches:

### Random

Generates five unique draw numbers using a random selection process.

### Algorithmic

Generates draw numbers using score-frequency information from submitted member scores.

This provides an additional simulation mode for demonstrating how the draw engine can support different number-generation strategies while keeping the underlying prize and winner calculation logic separate.

Administrators can review the generated numbers and prize pool before publishing a draw.

---

## 6. Charity Platform

Charity is a central part of Digital Heroes rather than an additional feature.

Visitors can browse available charities without creating an account.

Implemented charity features include:

* Public charity directory
* Charity search
* Charity descriptions
* Charity location information
* Charity website information
* Charity impact information
* Charity profile/details view
* Charity selection for members
* Contribution percentage selection
* Minimum contribution of 10%
* Contribution adjustment up to 100%
* Charity spotlight
* Admin charity creation
* Admin charity deletion
* Admin spotlight management

The homepage includes a **Charity Spotlight** area connected to the charity database, allowing administrators to highlight a selected organisation.

---

## 7. Independent Donations

The platform also includes an independent donation flow.

Members can record a separate donation toward a selected charity independently from their regular contribution allocation.

Donation records include:

* Member
* Charity
* Amount
* Status
* Creation date

Administrators can review donation records through the admin panel.

The current implementation records the donation as a completed demo transaction so the end-to-end charity workflow can be demonstrated within the assignment environment.

---

## 8. Winner Verification & Payout Tracking

When a member wins a draw, the platform supports a verification workflow.

Implemented flow:

1. Winner is recorded.
2. Winner views the prize and payment status.
3. Winner uploads verification proof.
4. Administrator reviews the submitted proof.
5. Administrator approves or rejects the proof.
6. Approved winners can be marked as paid.
7. Payment status is reflected in the dashboard.

Supported verification states include:

* Pending
* Approved
* Rejected

Payment tracking includes:

* Pending
* Paid

Winner proof files are stored using Supabase Storage.

---

## 9. Member Dashboard

The member dashboard brings the main account functions together in one place.

Members can view:

* Account information
* Subscription status
* Renewal information
* Latest five scores
* Score entry
* Score editing
* Score deletion
* Selected charity
* Charity contribution percentage
* Draw participation
* Winnings
* Payment status
* Winner verification status
* Winner proof upload
* Independent donation functionality

The dashboard also prevents draw participation when the member does not have an active subscription.

---

# Admin Panel

Digital Heroes includes a dedicated administrator experience.

## Admin Dashboard

The main admin dashboard provides an overview of platform activity, including:

* Users
* Charities
* Draws
* Winners
* Donations
* Reports

---

## User Management

Administrators can:

* View registered users
* View user roles
* View subscription status
* Update user roles
* Update subscription status
* View member scores
* Edit member scores
* Delete member scores
* Review score history

---

## Charity Management

Administrators can:

* Add charities
* View charities
* Delete charities
* Add charity descriptions
* Add website information
* Add location information
* Add impact information
* Set a charity as the homepage spotlight
* Remove the current spotlight

Only one charity is presented as the active spotlight at a time.

---

## Draw Management

Administrators can:

* Generate random draw numbers
* Generate algorithmic draw numbers
* Calculate prize pools
* Include jackpot rollover
* Simulate draws
* Review generated results
* Publish draws
* Review draw information

The draw engine separates number generation, match detection, prize calculation, and winner processing to keep the logic maintainable.

---

## Winner Management

Administrators can:

* Review winners
* View submitted proof
* Approve proof
* Reject proof
* Track verification status
* Mark approved winnings as paid
* Track payment status

---

## Donation Management

Administrators can review donation records and associated charity information from the dedicated donation management section.

---

## Reports & Analytics

The admin area includes reporting functionality for reviewing platform activity and draw-related information.

The reporting layer is designed to provide an operational view of:

* User activity
* Charity activity
* Draw activity
* Prize information
* Contribution/donation information
* Winner information

---

# Database Architecture

The application uses **Supabase PostgreSQL** as its primary data layer.

Core tables include:

```text
profiles
subscriptions
charities
charity_selections
scores
draws
draw_entries
winners
winner_proofs
donations
```

### Relationships

```text
User
 ├── Profile
 ├── Subscription
 ├── Scores
 ├── Charity Selection
 ├── Draw Entries
 ├── Winners
 └── Donations

Charity
 ├── Charity Selections
 └── Donations

Draw
 ├── Draw Entries
 └── Winners

Winner
 └── Winner Proof
```

Database constraints and Row Level Security policies are used to protect user-specific records and separate administrative operations from regular member access.

Supabase recommends reviewing RLS policies carefully before deployment because database access through the Data API is governed by these policies.

---

# Security & Access Control

The application uses:

* Supabase Authentication
* PostgreSQL Row Level Security
* Role-based authorization
* User-specific database policies
* Admin-only management operations
* Protected subscription and draw actions
* Authenticated winner-proof uploads

Examples of protected operations include:

* Members can manage their own scores.
* Members can view their own winnings.
* Members can create their own draw entries.
* Members can manage their own charity selection.
* Administrators can manage platform-wide records.
* Non-admin users cannot access admin management routes.

The Supabase publishable key is supplied through environment variables rather than hard-coded into the repository. Supabase's current Next.js guidance also uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for this setup.

---

# Technology Stack

### Frontend

* Next.js 16
* React
* TypeScript
* Tailwind CSS
* Lucide React

### Backend / Data

* Supabase
* PostgreSQL
* Supabase Authentication
* Supabase Storage
* Row Level Security

### Development

* Node.js
* npm
* Git
* GitHub
* Vercel

---

# Project Structure

```text
digital-heroes/
│
├── app/
│   ├── admin/
│   │   ├── charities/
│   │   ├── donations/
│   │   ├── draw/
│   │   ├── reports/
│   │   ├── users/
│   │   └── winners/
│   │
│   ├── auth/
│   ├── charities/
│   ├── dashboard/
│   ├── draw/
│   ├── subscribe/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── lib/
│   ├── supabase/
│   │   └── client.ts
│   ├── draw.ts
│   └── winners.ts
│
├── public/
│
├── .env.local
├── package.json
├── tsconfig.json
└── README.md
```

---

# Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Do **not** commit `.env.local` or real credentials to GitHub.

For deployment, the same variables should be configured in the hosting platform's environment-variable settings. Vercel provides environment-variable configuration for production, preview, and development environments.

---

# Local Development

### 1. Clone the repository

```bash
git clone <your-github-repository-url>
cd digital-heroes
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create:

```text
.env.local
```

and add the Supabase project URL and publishable key.

### 4. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# Production Build

Before deployment, verify the production build:

```bash
npm run build
```

The project should compile successfully before being deployed.

---

# Deployment

The application is designed for deployment using **Vercel** with **Supabase** as the backend.

Deployment flow:

```text
GitHub
   ↓
Vercel
   ↓
Next.js Application
   ↓
Supabase
   ├── Authentication
   ├── PostgreSQL
   ├── Row Level Security
   └── Storage
```

Required environment variables should be added to the Vercel project before production deployment. Vercel environment variables can be scoped to the appropriate deployment environments and changes require a redeployment to take effect.

---

# Product Design

The interface follows the product direction of making **charity and emotional impact a first-class part of the experience**.

Design principles include:

* Dark modern interface
* High-contrast typography
* Lime/green accent system
* Charity-first messaging
* Clear reward visualisation
* Motion and hover interactions
* Responsive layouts
* Simple member workflows
* Separate administrator experience
* Minimal golf clichés in the visual language

The homepage focuses on the relationship between:

```text
Performance → Participation → Reward → Impact
```

---

# Testing Coverage

The implemented application has been tested across the main product workflows:

* User signup
* User login
* Role-based routing
* Subscription creation
* Subscription cancellation
* Lapsed subscription handling
* Five-score rolling logic
* Score editing
* Score deletion
* Draw entry
* Draw access restriction
* Random draw simulation
* Algorithmic draw simulation
* Prize calculation
* Jackpot rollover
* Charity browsing
* Charity selection
* Contribution percentage
* Charity spotlight
* Winner verification
* Proof upload
* Proof approval/rejection
* Payment status tracking
* Independent donations
* Admin access control
* Admin user management
* Admin charity management
* Admin draw management
* Admin winner management
* Admin reports
* Mobile responsive layouts
* Production build verification

---

# Current Payment Integration

For the assignment environment, subscription and donation flows use **demonstration transactions** so the complete application workflow can be tested without requiring live payment credentials.

The architecture keeps payment state separate from the rest of the application, allowing a production payment provider such as Stripe or another supported provider to be integrated into the subscription and payout workflows.

This approach allows the core Digital Heroes product experience — membership, eligibility, charity contribution, draw participation, winnings, and payment tracking — to be demonstrated end-to-end.

---

# Future Production Extensions

The current architecture is intentionally structured so additional production services can be connected without redesigning the core application.

Potential production extensions include:

* Live payment gateway integration
* Automated recurring subscription billing
* Automated monthly draw scheduling
* Production payment processing for winnings
* Rich charity imagery and media
* Expanded charity profiles
* Email notifications
* Automated winner notifications
* Advanced analytics
* Production domain and transactional email configuration

These extensions build on the existing authentication, database, role, draw, charity, and winner-management architecture.

---

# Project Goal

Digital Heroes is designed around a simple idea:

> **Your game can create an impact beyond the game.**

The platform turns ordinary golf participation into a recurring opportunity to support charities while giving members an engaging monthly reward experience.

---

## License

This project was created as part of a technical product assignment and is intended for evaluation and demonstration purposes.
