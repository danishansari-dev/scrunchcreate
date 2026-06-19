# Scrunch & Create — Changelog

> All notable changes to this project will be documented in this file.  
> Format: `[YYYY-MM-DD] Category: Description`

---

## [2026-06-19] Phase 1 — Senior Engineer Onboarding

### Documentation
- Created `/docs/PROJECT_OVERVIEW.md` — full architecture, module map, data flow
- Created `/docs/AUDIT_REPORT.md` — 28 issues identified (3 Critical, 7 High, 10 Medium, 8 Low)
- Created `/docs/IMPLEMENTATION_PLAN.md` — 4-milestone execution plan
- Created `/docs/CHANGELOG.md` — this file
- Created `/docs/DECISIONS.md` — technical decision log
- Created `/docs/TODO.md` — pending work backlog
- Created `/docs/TEST_REPORT.md` — validation results
- Created `/docs/HANDOVER.md` — developer onboarding guide

### Audit Findings
- Identified Cloudinary API secret exposed in `.env` (committed to git)
- Found plaintext password storage in mock auth system
- Discovered duplicate pricing engines (`pricingConfig.js` vs `pricing.js`)
- Found 7 unused npm dependencies still installed
- Identified WhatsApp message total calculation mismatch
- Found missing 404 route, SEO meta tags, loading states, error boundaries

---

## Pre-Audit History (from git log)

### Recent Commits
- `e44cf1b` — feat: enrich placeOrder payload with contact, payment, coupon, and fee data
- `f8cd0d5` — style: rebuild Cart CSS with shipping bar, cross-sell grid, and mobile-optimized grid layout
- `68e3557` — feat: enhance Cart page with free shipping bar, cross-sells, coupon field, and trust badges
- `931f646` — style: rebuild OrderSuccess CSS with animated success icon, detail cards, and cross-sell grid
- `4fbbbd8` — feat: redesign order confirmation with full details, delivery estimate, WhatsApp CTA, and cross-sells
