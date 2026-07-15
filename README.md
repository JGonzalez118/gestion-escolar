# Sistema de Gestión Escolar

Dashboard para gestionar la asistencia y las calificaciones de los estudiantes.


## Correr localmente

### Requisitos
- Python 3.x
- Node.js
- pnpm versión 11 en adelante
- Redis (para las notificaciones asíncronas de asistencia)

Clona el proyecto

```bash
git clone https://github.com/JGonzalez118/gestion-escolar.git
```

Ve al directorio del proyecto

```bash
cd gestion_escolar
```
### Importante!
- A partir de aquí debes tener **tres terminales activas**: una para el backend, otra para el frontend, y otra para el worker de notificaciones (Celery).

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
pnpm install
```

Ejecuta el servidor
```bash
pnpm run dev
```
- ruta http://localhost:5173/

### Notificaciones de asistencia (tareas asíncronas)

Cuando un profesor marca a un estudiante como **Ausente**, el sistema dispara una notificación en segundo plano sin bloquear el guardado de la asistencia. Esto corre a través de Celery, usando Redis como broker de mensajes.

Asegúrate de tener Redis corriendo (localmente o vía Docker) escuchando en el puerto `6379`.

En la **tercera terminal**, dentro del directorio `backend` y con el entorno virtual activado, ejecuta el worker de Celery:

```bash
celery -A core worker --loglevel=info
```

- En Windows, agrega el flag `--pool=solo` al final del comando:
```bash
celery -A core worker --loglevel=info --pool=solo
```

Con el backend, frontend, Redis y el worker corriendo, al marcar una asistencia como "Ausente" desde el dashboard vas a ver en esta terminal un mensaje de notificación aparecer unos segundos después, sin que el guardado de la asistencia se haya visto afectado.

### Opcional

- Al hacer las migraciones en la parte de backend, se creará el archivo db.sqlite3.
- Para tener un admin en el dashboard de django admin has lo siguiente despues de hacer las migraciones:
```bash
python manage.py createsuperuser
```
- Crea un usuario, correo y contraseña (que no se te olviden)
- Luego accedes a la ruta: http://127.0.0.1:8000/admin

### Poblar la base de datos con datos de prueba

Después de crear el superusuario puedes llenar automáticamente la base de datos con información inicial (grados, salones, docentes, estudiantes, materias, periodos, usuarios y grupos).

Ejecuta:

```bash
python manage.py seed
```
#### Docente
```bash
usuario: docente1
contraseña: 123456
```
#### Estudiante
```bash
usuario: estudiante1
contraseña: 123456
```