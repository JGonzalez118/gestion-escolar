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
- **Models** (`gestion/models.py`): `Grado` → `Salon` (a class group, has a `consejero` Docente) → `Estudiante`. `Materia` links a `Docente` + `Grado`. Grading: `Actividad` (per `Materia`/`Periodo`) → `Nota` (per `Estudiante`/`Actividad`). `Asistencia` records attendance per `Estudiante`/`Materia`/date with state P/A/T/E. `Docente` and `Estudiante` each have a nullable `OneToOneField` to Django's `User`.
- **Auth & roles**: JWT via `rest_framework_simplejwt`. Token endpoints `POST /api/token/` and `/api/token/refresh/` (60-min access lifetime). Roles are Django **Groups** named `"Docente"` and `"Estudiante"`, checked through custom permissions in `gestion/permissions.py` (`EsDocente`, `EsEstudiante`).
- **Data scoping is enforced in `get_queryset`/`get_permissions`** per ViewSet, not globally. Example: `EstudianteViewSet` returns all rows for superusers, only the consejero's salon for a Docente, and only the own record for an Estudiante. When adding endpoints, replicate this role-based filtering rather than assuming global access.
- **Soft delete**: `Docente` and `Estudiante` have an `activo` boolean; default querysets filter `activo=True`. Don't hard-delete these.
- `gestion/views.py` exposes ViewSets registered via DRF `DefaultRouter` in `gestion/urls.py`, plus a function view `perfil` (`GET /api/perfil/`) that returns role + profile + salon for the logged-in user. ViewSets also add `@action` routes like `estudiantes/mi_salon`.
- Serializers in `gestion/serializers.py`. Admin registrations in `gestion/admin.py`.

### Frontend (React 19 + Vite + react-router-dom 7)
- `src/api/` is a thin REST layer. `client.js` exports a `request()` wrapper that reads the JWT from `localStorage["access"]`, sets the `Bearer` header, and hits `BASE_URL = http://127.0.0.1:8000/api`. Each resource (estudiantes, notas, asistencia, etc.) has its own module that calls `request()`. `auth.js` handles login (stores `access`/`refresh`) and logout.
- **Auth state lives in `localStorage`**: `access`, `refresh`, `rol`, `salon_id`, `salon_nombre`, `perfil`. `PrivateRoute` (`src/components/PrivateRoute.jsx`) gates routes on the presence of `access` and optionally a required `role` (compared against `localStorage["rol"]`).
- Routing in `src/App.jsx`: the `Sidebar` renders on every page except `/login`. Pages live in `src/pages/`, reusable pieces in `src/components/`.
- UI uses `@coreui/react`, `lucide-react` icons, `sweetalert2` for alerts, and Tailwind v4. Theme toggling via `src/context/ThemeContext.jsx`.

## Notes
- `core/settings.py` is dev-only: `DEBUG = True`, hardcoded `SECRET_KEY`, `CORS_ALLOW_ALL_ORIGINS = True`, SQLite (`db.sqlite3`). Don't treat these as production-ready.
- Seeded credentials after `python manage.py seed`: docente `docente1` / `123456`, estudiante `estudiante1` / `123456`.
