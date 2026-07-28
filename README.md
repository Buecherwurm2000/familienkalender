# Familienkalender

Ein gemeinsamer Kalender für die ganze Familie — gehostet auf Vercel, Daten in Supabase.

## Setup

### 1. Supabase einrichten

1. Gehe zu [supabase.com](https://supabase.com) und erstelle ein kostenloses Projekt
2. Öffne den **SQL Editor** und führe den Inhalt von `supabase/schema.sql` aus
3. Kopiere unter **Project Settings → API** die Werte:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Lokal starten

```bash
cd familienkalender
npm install
# .env.local mit deinen Supabase-Werten befüllen
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000)

### 3. Auf Vercel deployen

```bash
npm install -g vercel
vercel
```

Oder: Repository auf GitHub pushen und bei [vercel.com](https://vercel.com) importieren.

**Umgebungsvariablen in Vercel setzen:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Familienmitglieder anpassen

In [src/app/page.tsx](src/app/page.tsx) die `FAMILY_MEMBERS`-Liste anpassen:

```ts
const FAMILY_MEMBERS = [
  { name: 'Mama', color: '#ec4899' },
  { name: 'Papa', color: '#3b82f6' },
  { name: 'Emma', color: '#10b981' },
  { name: 'Max', color: '#f59e0b' },
]
```

## Features

- Monatsansicht mit Terminübersicht
- Termin hinzufügen, bearbeiten, löschen
- Farbkodierung pro Familienmitglied
- Echtzeit-Updates (alle sehen Änderungen sofort)
- Mobilfreundlich
