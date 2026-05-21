from django.core.management.base import BaseCommand
from django.contrib.auth.models import User, Group
from gestion.models import *

import random


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
                telefono=60000000+i
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

        for grado, salon in zip(
            grados,
            salones
        ):

            for materia in materias_primaria:

                Materia.objects.create(

                    nombre=materia,
                    docente=salon.consejero,
                    grado=grado
                )

        self.stdout.write("Creando estudiantes...")

        for salon in salones:

            for i in range(1, 7):

                user = User.objects.create_user(

                    username=f"{salon.nombre}_est{i}",
                    password="123456"
                )

                user.groups.add(
                    estudiantes_group
                )

                Estudiante.objects.create(

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

        self.stdout.write(
            self.style.SUCCESS(
                "Base de datos creada."
            )
        )
