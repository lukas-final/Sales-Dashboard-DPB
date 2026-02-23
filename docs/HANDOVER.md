# HANDOVER

## Projekt
- Repo: https://github.com/lukas-final/Sales-Dashboard-DPB
- Live: https://sales-dashboard-dpb.vercel.app
- Stack: Next.js 14, Tailwind, Supabase, Vercel

## Login
- Admin: username `admin`, password `DPB2026`
- Closer: username `alex` / `niklas`, password `Closing`

## Rollen
- ADMIN: Dashboard, Dateneingabe, Entries, Admin
- CLOSER: nur Dateneingabe + Entries (eigene Daten), kein Dashboard/Admin

## Datenmodelle (Supabase)
- `closers`
- `users`
- `traffic_entries`
- `sales_entries`

## Wichtige Routen
- UI: `/dashboard`, `/data-entry`, `/entries`, `/admin`, `/login`
- API: `/api/login`, `/api/logout`, `/api/me`, `/api/traffic`, `/api/sales`, `/api/stats`, `/api/closers`

## Deploy
1. Änderungen ins Repo pushen
2. Vercel deployt automatisch (oder `vercel --prod`)
3. Nach Deploy Smoke-Test:
   - Login
   - Dateneingabe speichern
   - Dashboard aktualisiert

## Betriebshinweise
- Closer sehen nur eigene sales-Einträge (scoped über `closer_id`)
- Traffic-Einträge sind Admin-only
- Follow-Up bei Ergebnis `FOLLOW_UP` ist Pflicht
