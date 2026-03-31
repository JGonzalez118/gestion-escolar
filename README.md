
# Sistema de Gestión Escolar

Dashboard para gestionar la asistencia y las calificaciones de los estudiantes.


## Correr localmente

### Requisitos
- Python 3.x
- Node.js

Clona el proyecto

```bash
  git clone https://link-to-project
```

Ve al directorio del proyecto

```bash
  cd gestion_escolar
```
### Importante!
- A partir de aquí debes tener dos terminales activas. En una manejaras el backend y en la otra el frontend.

### Backend

Entra al directorio backend
```bash
  cd backend
```
Crea el entorno virtual
```bash
  python -m venv venv
```

Activa el entorno virtual

- Windows
```bash
  venv\Scripts\Activate
```
- Linux
```bash
   source venv/bin/activate
```

Instala las dependencias
```bash
   pip install -r requirements.txt
```

Aplica las migraciones

```bash
   python manage.py migrate
```

Ejecuta el servidor backend
```bash
   python manage.py runserver
```
- ruta: http://127.0.0.1:8000/api

### Frontend

Ve al directorio Frontend
```bash
cd frontend
```
Instala las dependencias
```bash
npm install
```

Ejecuta el servidor
```bash
npm run dev
```
- ruta http://localhost:5173/

### Opcional

- Al hacer las migraciones en la parte de backend, se creará el archivo db.sqlite3.
- Para tener un admin en el dashboard de django admin has lo siguiente despues de hacer las migraciones:
```bash
   python manage.py createsuperuser
```
- Crea un usuario, correo y contraseña (que no se te olviden)
- Luego accedes a la ruta: http://127.0.0.1:8000/admin