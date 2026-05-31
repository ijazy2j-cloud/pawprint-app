# PawPrint Sri Lanka

Free, non-commercial community platform for pet rescue, lost & found, and adoption in Sri Lanka.

## Mission
PawPrint Sri Lanka helps people report abandoned or injured pets, reunite lost animals with families, coordinate NGOs/volunteers, and promote ethical adoption. No sales, no premium listings, no paid promotion.

## Tech stack
- Next.js 14 App Router + TypeScript
- PostgreSQL + Prisma
- NextAuth.js
- Tailwind CSS + shadcn/ui
- Cloudinary uploads
- Resend email notifications
- Redis-compatible caching/rate-limit design
- @vercel/og social previews
- next-pwa PWA support
- next-intl-ready i18n structure

## Local development
```bash
npm install
cp .env.example .env
npm run db:generate
npm run dev
```

Or with Docker:
```bash
docker compose up -d postgres redis
npm run db:push
npm run db:seed
npm run dev
```

## Environment variables
| Variable | Purpose |
| --- | --- |
| DATABASE_URL | PostgreSQL connection string |
| REDIS_URL | Redis connection string |
| NEXTAUTH_SECRET | NextAuth signing secret |
| NEXTAUTH_URL | Canonical app URL |
| NEXT_PUBLIC_APP_URL | Public canonical URL for share links |
| GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET | Google OAuth |
| RESEND_API_KEY / RESEND_FROM_EMAIL | Email delivery |
| CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET / CLOUDINARY_UPLOAD_FOLDER | Image uploads |
| CRON_SECRET | Protects cron endpoints |
| FACEBOOK_PAGE_ACCESS_TOKEN / FACEBOOK_PAGE_ID / TWITTER_API_KEY | Optional social auto-share |

## Feature phases
1. Foundation: Next.js, Prisma, auth, Docker.
2. SOS pipeline: urgent pet reports, uploads, NGO notifications.
3. Lost & Found: matching, posters, reunification.
4. Adoption Center: zero-commerce listings and applications.
5. Community Wall: happy stories, comments, reactions, spotlight.
6. NGO/Volunteer/Admin dashboards: assignments, analytics, audit logs.
7. Social alerts: OG images, email templates, escalation, share utilities.
8. Production polish: PWA, i18n-ready messages, SEO, security headers, Docker/Nginx/CI.

## Verification
```bash
npm run verify:all
npm run build
```

## Lighthouse targets
- Performance: >80 mobile, >90 desktop
- Accessibility: >95
- Best Practices: >90
- SEO: >95

No third-party analytics that sell user data. Plausible may be added later if privacy-safe analytics are needed.

## Contributing
- No pet sales, prices, deposits, or premium listings.
- Protect precise GPS and contact data.
- Keep public pages district-level only.
- Use soft-delete/status moderation for core records.
- Add verification checks for new behavior.

## Deployment
See `DEPLOY.md`.

## License
AGPL-3.0 recommended to discourage commercial forks that exploit rescue/community data.
