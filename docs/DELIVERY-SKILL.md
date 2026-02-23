# DELIVERY-SKILL (Anti-Fehler Playbook)

## Ziel
Eine App in einem Durchlauf sauber liefern, mit transparentem Fortschritt, ohne falsche Statusmeldungen.

## 1) Immer-Wahrheits-Regel
- Nie "fertig" sagen ohne nachweisbaren Build/Deploy-Output.
- Wenn kein Fortschritt passiert ist: explizit sagen und sofort weiterarbeiten.

## 2) Pflicht-Checks vor jedem Status
- Lokal: `npm run build` muss grün sein.
- Nach Push: Commit-ID nennen.
- Nach Deploy: Vercel-Output + Live-URL nennen.
- Kritische API kurz per curl testen.

## 3) Status-Format (immer gleich)
- Was gebaut
- Was getestet
- Commit
- Deploy-Status
- Restzeit

## 4) Fehlerprävention
- Nie mehrere riskante Änderungen ohne Build dazwischen.
- Bei Auth-Änderungen immer Login-API manuell testen.
- Bei DB-Änderungen SQL + API + UI gegentesten.
- Bei Mobile-UI immer Overflow checken.

## 5) Scope-Schutz
- Nutzeranforderung 1:1 in Checkliste umwandeln.
- Bei Scope-Änderung: kurz bestätigen und direkt umsetzen.

## 6) Rollen-/Rechte-Checks
- Admin: Vollzugriff
- Closer: nur eigene Daten, keine Stats/Admin
- Vor Release mit beiden Rollen testen.

## 7) Abschluss-Definition
Nur "komplett fertig" wenn:
- alle Muss-Punkte umgesetzt
- Build grün
- Deploy grün
- Kernflows E2E getestet
- Doku aktualisiert (CHANGELOG/HANDOVER)
