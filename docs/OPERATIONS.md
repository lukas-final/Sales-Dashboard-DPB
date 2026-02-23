# OPERATIONS / RUNBOOK

## Standard-Workflow für Änderungen
1. Pull latest
2. Implementieren
3. `npm run build`
4. Commit + Push
5. Vercel Build prüfen
6. Live testen

## Quick-Checks
- Build lokal: `npm run build`
- API Health: `GET /api/health`
- Login Test: `POST /api/login`

## Typische Fehlerbilder
- "table not found": Supabase Migration/SQL nicht ausgeführt
- 401 Login: falsche Credentials oder alte Cookies
- 403 für Closer: Route ist Admin-only (gewollt)

## Backlog-Notizen
- Meta Integration vorbereitet, aber noch nicht eingebaut
- Monday Integration noch offen
