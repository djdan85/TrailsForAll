# Trail Web App

Webová aplikace pro cyklistické traily v České a Slovenské republice.

## Popis
Aplikace umožňuje uživatelům prohlížet, přidávat a hodnotit cyklistické traily. Obsahuje mapu s trasami (používá OpenStreetMap přes Leaflet.js) a podporu lokalizace pro češtinu a slovenštinu. Administrátoři mohou schvalovat nové traily (plánovaná funkce).

## Instalace
1. Nainstalujte závislosti:
   ```bash
   npm install
   ```
2. Spusťte aplikaci:
   ```bash
   npm start
   ```

## Požadavky
- Node.js (v16 nebo vyšší)
- Prohlížeč podporující moderní JavaScript (Chrome, Firefox, Safari)

## Struktura projektu
- `src/App.jsx`: Hlavní komponenta s mapou a seznamem trailů.
- `src/components/TrailList.jsx`: Komponenta pro zobrazení seznamu trailů.
- `src/components/Map.jsx`: Komponenta pro zobrazení mapy (Leaflet.js).
- `src/locales/`: Lokalizační soubory pro češtinu, slovenštinu a angličtinu.
- `src/App.css`: Základní styly (kombinované s Tailwind CSS).

## Plánované funkce
- Vkládání trailů s GPS soubory (GPX/KML).
- Administrační rozhraní pro schvalování tras.
- Filtrování a vyhledávání trailů.
- Podpora offline map (např. přes Mapbox).

## Poznámky
- Aplikace aktuálně používá mock data. Pro reálná data je třeba přidat backend (např. Node.js/Express s PostgreSQL/PostGIS).
- Leaflet.js je nakonfigurován s OpenStreetMap. Pro pokročilé mapové funkce zvažte Mapbox nebo Mapy.cz API.

## Licence
MIT