

# MedLink — Hospital Management & Patient Portal

## Overview
A comprehensive, premium medical platform with Doctor and Patient portals, featuring disease code translation (ICD-11 ↔ Ayurveda/Siddha/Unani), FHIR encoding, OTP auth, and 100+ UI features. Monochrome design with Doctor Blue (#0A66C2) accents.

## Phase 1: Foundation & Design System
- Set up global theme: Inter font, monochrome palette, Doctor Blue accents, CSS variables for dark/light mode
- Custom scrollbars, smooth transitions, skeleton loaders, toast system
- Responsive sidebar layout shell with role-based rendering (Doctor vs Patient)
- Sticky header with notification bell (badge), avatar dropdown, search bar
- Mobile hamburger menu, breadcrumbs, footer (Privacy Policy, Terms of Service)
- Custom 404 page, error boundary, offline indicator, session timeout modal

## Phase 2: Landing Page
- Premium hero section with "MedLink" branding, medical imagery/illustrations
- Nav bar with "Welcome Back / Sign In" CTA
- Feature sections: "For Doctors", "For Patients", "Advanced Technology (FHIR & Ayush)"
- Stats bar (query latency, compliance, active records)
- CTA section: "Request a Demo", "Download Whitepaper"
- Dark/Light mode toggle in header

## Phase 3: Authentication Flow
- Split-screen role selection: Doctor / Patient toggle
- **Doctor login:** Gmail OAuth button + HPR ID input with "Request OTP" button
- **Patient login:** ABHA ID input + Aadhaar ID input with "Request OTP" button
- 6-digit OTP input with auto-focus, auto-tab, and hardcoded bypass (587315 = success)
- Resend OTP countdown timer (45s)
- Eye icon toggle for ID visibility, "Forgot ID" recovery UI
- Role stored in app state for conditional routing

## Phase 4: Doctor Dashboard
- **Greeting banner** with date/time, quick stats (patients seen, pending FHIR uploads)
- **Patient Linking:** Modal to search/link patient by ABHA, Aadhaar, Gmail, or Phone
- **Consultation Desk:**
  - Vitals form (BP, Heart Rate, SpO2, Temp, Weight)
  - Chief complaints rich-text area
  - Medical history tags, current medications list
- **Disease Code Translation Module (star feature):**
  - Autocomplete search bar reading from `public/matchedFile/conciseFinalData.csv`
  - Debounced keystroke search with live highlighting
  - Split-view result cards: ICD-11 Code + Ayurveda + Siddha + Unani terms
  - Similarity score progress bar, AI Precision badge
  - Add/remove multiple diagnoses
- **Prescription Builder:**
  - Drug search, dosage dropdown, duration input, special instructions
  - Dynamic "Add Medication" list
- **FHIR Encoding:**
  - "Generate FHIR Resource" button → syntax-highlighted JSON preview modal
  - "Publish to Patient Portal" action
- **Clinic Settings:** Clinic name, address/location input, specialization multi-select, working hours table
- **Appointments:** Approval/rejection list, consultation history table with date filters, CSV export
- **Digital signature** upload pad

## Phase 5: Patient Dashboard
- **Health Summary** greeting banner
- **Visit Timeline:** Chronological cards of past consultations with expandable accordions
- **Vitals History:** Line chart placeholder showing trends
- **Active Medications** list with refill indicators
- **Download Center:** PDF prescription download, FHIR JSON download buttons
- **Prescription Translator:** Language toggle (English/Hindi/Tamil/Gujarati) with side-by-side view
- **Doctors Near Me:**
  - Search by name/specialty, location permission prompt
  - Distance radius slider (5-15km), specialty filter tags
  - Doctor result cards with availability, ratings, "Book Appointment" CTA
- **Appointments:** Date/time picker, confirmation modal, upcoming panel, cancel/reschedule
- **Documents:** Lab report upload dropzone, shared documents gallery
- **Profile:** Edit phone/email, ABHA/Aadhaar linked badges, QR code generator

## Phase 6: Polish & Interactivity
- Smooth page transition animations (framer-motion)
- Empty states for all tables/lists
- Tooltips on medical terms
- Pagination, sortable headers on all tables
- Hover elevation on cards, focus rings for accessibility
- Form validation styling (red borders), success checkmark animations
- Modal scroll locking, file upload progress bars
- Interactive toggle switches for active/inactive states

## Technical Notes
- All data is mock/simulated — no real backend calls except Supabase for future auth
- CSV parsing via PapaParse for disease code matching
- Role-based routing: `/doctor/*` and `/patient/*` paths
- State management via React context for auth/role
- ~15-20 page components, ~30+ reusable UI components

