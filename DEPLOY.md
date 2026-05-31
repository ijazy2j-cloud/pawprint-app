# PawPrint Sri Lanka Deployment

## Prerequisites
- Docker and Docker Compose
- A domain name (optional for MVP)
- Cloudinary account
- Resend account
- Google OAuth credentials
- PostgreSQL backup destination

## First deploy
1. Clone the repo.
2. Copy `.env.example` to `.env`.
3. Fill every required secret. Never commit `.env`.
4. Start production services:
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```
5. Run migrations:
   ```bash
   docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
   ```
6. Seed idempotent defaults/admin:
   ```bash
   docker compose -f docker-compose.prod.yml exec app npm run db:seed
   ```
7. Check health:
   ```bash
   curl http://localhost/api/health
   ```

## SSL
For MVP, put the app behind Cloudflare proxy for free SSL. For direct server SSL, install Certbot and mount `/etc/letsencrypt` into the nginx service. The nginx config includes commented placeholders.

## Backups
Daily PostgreSQL dump example:
```bash
0 2 * * * docker compose -f /opt/pawprint-sl/docker-compose.prod.yml exec -T db pg_dump -U pawprint pawprint | gzip > /backups/pawprint-$(date +\%F).sql.gz
```

## Cron
Call the escalation route every 4 hours:
```bash
curl -H "x-cron-secret: $CRON_SECRET" https://pawprint.lk/api/cron/escalate
```

## Monitoring
Use `/api/health` for uptime checks. Redis failure should degrade rate limiting/cache only; Resend failures are logged to `AuditLog` and should not block users.
