from django.core.management.base import BaseCommand
from django.contrib.auth.models import User, Group
from gestion.models import *
import random
from datetime import date, timedelta


class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        self.stdout.write("Creando grupos...")
        docentes_group, _ = Group.objects.get_or_create(
            name="Docente"
        )
        estudiantes_group, _ = Group.objects.get_or_create(
            name="Estudiante"
        )

        grados = []
        nombres_grados = [
            "Kinder",
            "1°",
            "2°",
            "3°",
            "4°",
            "5°",
            "6°"
        ]
        for nombre in nombres_grados:
            grado, _ = Grado.objects.get_or_create(
                nombre=nombre
            )
            grados.append(grado)

        self.stdout.write("Creando períodos (trimestres)...")
        nombres_periodos = [
            "Primer Trimestre",
            "Segundo Trimestre",
            "Tercer Trimestre",
        ]
        periodos = []
        for nombre in nombres_periodos:
            periodo, _ = Periodo.objects.get_or_create(
                nombre=nombre
            )
            periodos.append(periodo)

        self.stdout.write("Creando docentes...")
        docentes = []
        for i in range(1, 8):
            user = User.objects.create_user(
                username=f"docente{i}",
                password="123456"
            )
            user.groups.add(docentes_group)
            docente = Docente.objects.create(
                user=user,
                nombre=f"Profesor{i}",
                apellido="Panama",
                cedula=f"8-123-{i}",
                telefono=60000000 + i
            )
            docentes.append(docente)

        self.stdout.write("Creando salones...")
        salones = []
        for grado, docente in zip(
            grados,
            docentes
        ):
            salon = Salon.objects.create(
                nombre=f"{grado.nombre} A",
                grado=grado,
                consejero=docente
            )
            salones.append(salon)

        materias_primaria = [
            "Matemáticas",
            "Español",
            "Ciencias Naturales",
            "Ciencias Sociales",
            "Inglés",
            "Educación Física",
            "Religión",
            "Informática",
            "Expresiones Artísticas"
        ]

        self.stdout.write("Creando materias...")
        materias_por_grado = {}
        for grado in grados:
            materias_del_grado = []
            for nombre_materia in materias_primaria:
                materia = Materia.objects.create(
                    nombre=nombre_materia,
                    grado=grado
                )
                materias_del_grado.append(materia)
            materias_por_grado[grado.id] = materias_del_grado

        self.stdout.write("Creando estudiantes...")
        estudiantes_por_salon = {}
        for salon in salones:
            estudiantes_del_salon = []
            for i in range(1, 7):
                user = User.objects.create_user(
                    username=f"{salon.nombre}_est{i}",
                    password="123456"
                )
                user.groups.add(
                    estudiantes_group
                )
                estudiante = Estudiante.objects.create(
                    user=user,
                    nombre=f"Alumno{i}",
                    apellido="Perez",
                    cedula=f"4-555-{i}",
                    genero=random.choice(
                        ["M", "F"]
                    ),
                    fecha_nacimiento="2015-01-01",
                    salon=salon
                )
                estudiantes_del_salon.append(estudiante)
            estudiantes_por_salon[salon.id] = estudiantes_del_salon

        self.stdout.write("Creando actividades de prueba...")
        tipos_actividad = ["tarea", "examen", "proyecto", "taller"]
        hoy = date.today()

        actividades_creadas = []
        for salon in salones:
            materias_del_grado = materias_por_grado[salon.grado.id]

            for periodo in periodos:
                # 2 actividades por materia por trimestre, para no saturar
                for materia in materias_del_grado[:2]:
                    actividad = Actividad.objects.create(
                        nombre=f"Actividad {materia.nombre}",
                        fecha=hoy,
                        tipo=random.choice(tipos_actividad),
                        puntaje_maximo=random.choice([10, 20, 50, 100]),
                        descripcion=f"Actividad de prueba para {materia.nombre}.",
                        materia=materia,
                        periodo=periodo,
                    )
                    actividades_creadas.append((actividad, salon))

        self.stdout.write("Creando notas de prueba...")
        for actividad, salon in actividades_creadas:
            for estudiante in estudiantes_por_salon[salon.id]:
                puntos = round(
                    random.uniform(
                        actividad.puntaje_maximo * 0.5,
                        actividad.puntaje_maximo
                    ),
                    1
                )
                nota_calculada = round(
                    (puntos / actividad.puntaje_maximo) * 5,
                    1
                )
                Nota.objects.create(
                    estudiante=estudiante,
                    actividad=actividad,
                    puntos_obtenidos=puntos,
                    nota=nota_calculada,
                )

        self.stdout.write("Creando asistencia de prueba...")
        estados_asistencia = ["P", "P", "P", "A",
                              "T", "E"]  # ponderado hacia Presente
        for salon in salones:
            materias_del_grado = materias_por_grado[salon.grado.id]
            materia_principal = materias_del_grado[0]

            for estudiante in estudiantes_por_salon[salon.id]:
                Asistencia.objects.create(
                    estudiante=estudiante,
                    materia=materia_principal,
                    fecha=hoy,
                    estado=random.choice(estados_asistencia),
                )

        self.stdout.write(
            self.style.SUCCESS(
                "Base de datos creada."
            )
        )
