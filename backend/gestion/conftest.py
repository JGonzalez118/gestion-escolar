import datetime
import pytest
from django.contrib.auth.models import User, Group
from rest_framework.test import APIClient

from gestion.models import Grado, Docente, Salon, Estudiante


@pytest.fixture
def api_client():
    """Cliente HTTP de DRF para llamar a los endpoints como en producción."""
    return APIClient()


@pytest.fixture
def grado_decimo(db):
    return Grado.objects.create(nombre="Décimo")


@pytest.fixture
def docente_con_salon(db, grado_decimo):
    """
    Crea un usuario Django en el grupo 'Docente', su perfil Docente
    y un Salon del que es consejero.
    """
    user = User.objects.create_user(username="prof_maria", password="Clave123!")
    grupo_docente, _ = Group.objects.get_or_create(name="Docente")
    user.groups.add(grupo_docente)

    docente = Docente.objects.create(
        user=user,
        nombre="Maria",
        apellido="Gonzalez",
        cedula="8-123-456",
        telefono=60001234,
        activo=True,
    )

    salon = Salon.objects.create(
        nombre="10-A",
        anio_escolar=2026,
        grado=grado_decimo,
        consejero=docente,
    )

    return user, docente, salon


@pytest.fixture
def otro_salon_con_estudiante(db, grado_decimo):
    """
    Crea un segundo docente/salon con un estudiante que NO pertenece
    al salon del docente principal (docente_con_salon), para verificar
    el aislamiento de datos entre salones.
    """
    otro_user = User.objects.create_user(username="prof_juan", password="Clave123!")
    grupo_docente, _ = Group.objects.get_or_create(name="Docente")
    otro_user.groups.add(grupo_docente)

    otro_docente = Docente.objects.create(
        user=otro_user,
        nombre="Juan",
        apellido="Perez",
        cedula="8-999-999",
        telefono=60009999,
        activo=True,
    )

    otro_salon = Salon.objects.create(
        nombre="10-B",
        anio_escolar=2026,
        grado=grado_decimo,
        consejero=otro_docente,
    )

    estudiante_ajeno = Estudiante.objects.create(
        nombre="Carlos",
        apellido="Rios",
        cedula="8-111-111",
        genero="M",
        fecha_nacimiento=datetime.date(2010, 5, 20),
        salon=otro_salon,
        activo=True,
    )

    return otro_salon, estudiante_ajeno


@pytest.fixture
def estudiante_del_salon(db, docente_con_salon):
    """Estudiante que sí pertenece al salón del docente principal."""
    _, _, salon = docente_con_salon
    return Estudiante.objects.create(
        nombre="Ana",
        apellido="Diaz",
        cedula="8-222-222",
        genero="F",
        fecha_nacimiento=datetime.date(2010, 3, 15),
        salon=salon,
        activo=True,
    )
