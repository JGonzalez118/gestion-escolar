# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

School management dashboard ("Sistema de Gestión Escolar") for tracking student attendance and grades. Two separate apps that run simultaneously: a Django REST backend (`backend/`) and a React + Vite frontend (`frontend/`). Code, comments, and domain vocabulary are in Spanish.

## Commands

Backend (run from `backend/`, with the virtualenv activated):
```bash
source venv/bin/activate          # Linux; Windows: venv\Scripts\Activate
python manage.py runserver        # serves API at http://127.0.0.1:8000/api
python manage.py migrate
python manage.py seed             # populate DB with test data (custom command)
python manage.py createsuperuser  # admin for http://127.0.0.1:8000/admin
python manage.py test             # run tests (gestion/tests.py)
python manage.py test gestion.tests.ClassName.test_method  # single test
```

Frontend (run from `frontend/`):
```bash
pnpm install
pnpm run dev      # http://localhost:5173/
pnpm run build
pnpm run lint     # eslint .
```

You need two terminals running (backend + frontend) for the app to work.

## Architecture

### Backend (Django 6 + DRF)
- Single app `gestion/` holds all domain logic; project config is in `core/`.
- **Models** (`gestion/models.py`): `Grado` → `Salon` (a class group, has an `anio_escolar` and a `consejero` Docente) → `Estudiante`. `Materia` belongs to a `Grado` (no Docente FK — teachers reach materias via the salon they counsel). Grading: `Actividad` (per `Materia`/`Periodo`, with `tipo` [tarea/ejercicio/taller/examen], `puntaje_maximo`, `descripcion`) → `Nota` (per `Estudiante`/`Actividad`, `unique_together`). `Asistencia` records attendance per `Estudiante`/`Materia`/date (`unique_together`) with state P/A/T/E. `Docente` and `Estudiante` each have a nullable `OneToOneField` to Django's `User`.
- **Grade scale**: `Nota.nota` is on a **0–5 scale**, computed server-side as `round(clamp(0..5, puntos_obtenidos / puntaje_maximo * 5), 1)` and marked `read_only` in the serializer — clients send only `puntos_obtenidos`. `NotaViewSet.create` and `AsistenciaViewSet.create` both **upsert** via `update_or_create` (POSTing an existing student/activity or student/materia/date pair updates instead of erroring), returning 201 on create / 200 on update.
- **Periodos/trimestres**: `gestion/calendario.py` hardcodes the three 2026 trimester date ranges (`TRIMESTRES_2026`) and `obtener_nombre_periodo_actual()`. `GET /api/periodos/actual/` resolves today's date to the active `Periodo` row (404 during a break or if the row isn't seeded).
- **Auth & roles**: JWT via `rest_framework_simplejwt`. Token endpoints `POST /api/token/` and `/api/token/refresh/` (60-min access lifetime). Roles are Django **Groups** named `"Docente"` and `"Estudiante"`, checked through custom permissions in `gestion/permissions.py` (`EsDocente`, `EsEstudiante`).
- **Data scoping is enforced in `get_queryset`/`get_permissions`** per ViewSet, not globally. Example: `EstudianteViewSet` returns all rows for superusers, only the consejero's salon for a Docente, and only the own record for an Estudiante. Writes on `Materia`/`Actividad`/`Nota` require `EsDocente`; reads require `IsAuthenticated`. When adding endpoints, replicate this role-based filtering rather than assuming global access.
- **Soft delete**: `Docente` and `Estudiante` have an `activo` boolean; default querysets filter `activo=True`. Don't hard-delete these.
- `gestion/views.py` exposes ViewSets registered via DRF `DefaultRouter` in `gestion/urls.py`, plus a function view `perfil` (`GET /api/perfil/`) that returns role + profile + salon for the logged-in user. Notable `@action` routes: `estudiantes/mi_salon`, `salones/mi_salon`, `periodos/actual`, and `GET /api/notas/boletin/?periodo=<id>` (per-student per-materia grade averages + final average for a period, role-scoped).
- Serializers in `gestion/serializers.py`. Admin registrations in `gestion/admin.py`.

### Frontend (React 19 + Vite + react-router-dom 7)
- `src/api/` is a thin REST layer. `client.js` exports a `request()` wrapper that reads the JWT from `localStorage["access"]`, sets the `Bearer` header, and hits `BASE_URL = http://127.0.0.1:8000/api`. Each resource (estudiantes, notas, asistencia, etc.) has its own module that calls `request()`. `auth.js` handles login (stores `access`/`refresh`) and logout.
- **Auth state lives in `localStorage`**: `access`, `refresh`, `rol`, `salon_id`, `salon_nombre`, `perfil`. `PrivateRoute` (`src/components/PrivateRoute.jsx`) gates routes on the presence of `access` and optionally a required `role` (compared against `localStorage["rol"]`).
- Pages **read the profile from `localStorage["perfil"]`** (parsed via a small local `leerPerfil()` helper) rather than re-fetching `GET /api/perfil/` — that call happens once at login.
- **Routing + roles** (`src/App.jsx`): `Sidebar` renders on every page except `/login`. `Dashboard` (`/`) and `Actividades` (`/actividades`) are open to both roles; `Salon` (`/salon`), `Estudiantes` (`/estudiantes`) and `Boletin` (`/boletin`) are **docente-only** (`PrivateRoute role="docente"`). Their nav links are filtered the same way in `Sidebar.jsx` via the `roles` field on each `NAV_ITEMS` entry — **when adding a page, gate it in both places**, or a student sees a link that bounces them back to `/`.
- Components in `src/components/`: `Sidebar` (brand + profile block + role-filtered nav), `PrivateRoute`, `AsistenciaCard` (bulk attendance with P/A/T/E chips), `ClaseActualCard`, `CrearActividadForm`, `EstadoAsistenciaSelect` (colored badge dropdown for one student's attendance state), `Navbar`.
- **Attendance has two distinct entry points, on purpose**: `Salon` is for *taking* the day's attendance in bulk (compact P/A/T/E chips; preloads what's already saved for today so a single correction isn't done blind), while `Estudiantes → Asistencia` is for *reviewing and correcting* (readable colored badge per student; picking a state saves instantly with an optimistic update, since `POST /api/asistencia/` upserts). Both share one color language: green=Presente, red=Ausente, amber=Tarde, gray=Excusa.
- **Alerts**: use the helpers in `src/utils/alertas.js` (`alertaExito`, `alertaError`, `alertaInfo`, `alertaConfirmar`, `toastExito`) — they wrap SweetAlert2 with the project palette and follow the active light/dark theme. **Don't use native `alert()` / `confirm()`.**
- `Boletin` supports **print / save-as-PDF**: a `@media print` block in `boletin.css` hides the sidebar and controls, forces white paper regardless of theme, and lays the table out as a full grid in landscape (`@page { size: A4 landscape; margin: 0 }` — the zero margin is what suppresses the browser's own URL/title headers). The page temporarily swaps `document.title` so the saved file is named `boletin-<salon>`.
- Charts use **`recharts`** (Dashboard's gender-distribution donut). It is the single heaviest dependency; Vite warns the bundle exceeds 500 kB because of it.

#### Frontend design system
Every page follows the same visual language — match it when adding UI.
- **Styles are per-page files in `src/styles/`** (`login.css`, `sidebar.css`, `dashboard.css`, `salon.css`, `estudiantes.css`, `actividades.css`, `boletin.css`), written in **BEM** (`.boletin__header`, `.chip--active`). Avoid inline styles.
- Each file defines its **own CSS variables scoped to the page root** (`--paper`, `--card`, `--field`, `--ink`, `--ink-soft`, `--line`, `--cream`, `--accent`, plus state colors) and overrides them under `[data-theme="dark"] .<page>`. These deliberately shadow the older global tokens in `index.css` (`--card-bg`, `--primary`, `--text-h`, …), which survive only in legacy spots — prefer the paper/ink variables.
- Fonts: **Bricolage Grotesque** for display/headings, **Hanken Grotesk** for body; both loaded in `index.html`.
- Icons: `lucide-react`. Theme toggling via `src/context/ThemeContext.jsx`, which sets `data-theme` on `<html>`.
- `@coreui/react` and Tailwind v4 are still dependencies but are being phased out of new UI; `Sidebar` was rewritten from `CSidebar` to a plain `<aside>`.
- ESLint runs the **React Compiler** rules: define a function before the `useEffect` that calls it (or inline it), and don't pass a named function to `useMemo`. `pnpm run lint` fails the build on these.

## Notes
- `core/settings.py` is dev-only: `DEBUG = True`, hardcoded `SECRET_KEY`, `CORS_ALLOW_ALL_ORIGINS = True`, SQLite (`db.sqlite3`). Don't treat these as production-ready.
- Seeded credentials after `python manage.py seed`: docente `docente1` / `123456`, estudiante `estudiante1` / `123456`.

## Known gaps
- **Unprotected endpoints**: `REST_FRAMEWORK` in `core/settings.py` sets no `DEFAULT_PERMISSION_CLASSES`, so DRF falls back to `AllowAny`. `GradoViewSet`, `DocenteViewSet`, `SalonViewSet`, `PeriodoViewSet` and `AsistenciaViewSet` don't override permissions, so they are reachable — including writes and deletes — **without authenticating at all**. Only `Materia`, `Actividad` and `Nota` check `EsDocente`. Fix before building any UI that writes to those resources.
- **No UI to manage `Materia`**: materias only ever come from `python manage.py seed`; nothing in the frontend creates or edits them, even though the write endpoints exist and are `EsDocente`-protected.
- A `Grados` page/route existed but was a stub and was removed (the PM dropped the feature). `src/api/grados.js` is intentionally kept although currently unused.
- Activities are always created with **today's** date (both `seed` and `CrearActividadForm` hardcode it), so in practice no future-dated activities exist — `Actividades` still renders a "Próximas" section defensively if any appear.
