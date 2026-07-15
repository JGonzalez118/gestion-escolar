"""
Pruebas FUNCIONALES (pytest + pytest-django + DRF APIClient).

Estas pruebas ejercitan el sistema de punta a punta a través de sus
endpoints REST reales (autenticación, permisos y reglas de negocio),
tal como lo haría el frontend React.
"""
import pytest


@pytest.mark.django_db
def test_perfil_devuelve_datos_correctos_para_docente(api_client, docente_con_salon):
    """
    Funcional #1
    Un docente autenticado que consulta GET /api/perfil/ debe recibir
    su rol, sus datos personales y el salón del cual es consejero.
    """
    user, docente, salon = docente_con_salon
    api_client.force_authenticate(user=user)

    response = api_client.get("/api/perfil/")

    assert response.status_code == 200
    data = response.json()
    assert data["rol"] == "docente"
    assert data["nombre_completo"] == "Maria Gonzalez"
    assert data["docente"]["cedula"] == "8-123-456"
    assert data["salon"]["nombre"] == "10-A"
    assert data["salon"]["grado"] == "Décimo"


@pytest.mark.django_db
def test_docente_solo_ve_estudiantes_de_su_propio_salon(
    api_client,
    docente_con_salon,
    estudiante_del_salon,
    otro_salon_con_estudiante,
):
    """
    Funcional #2
    Un docente que consulta GET /api/estudiantes/ debe ver únicamente
    a los estudiantes de su propio salón (consejería), y NUNCA a los
    estudiantes de otros salones, incluso si ambos existen en la BD.
    """
    user, docente, salon = docente_con_salon
    _, estudiante_ajeno = otro_salon_con_estudiante

    api_client.force_authenticate(user=user)

    response = api_client.get("/api/estudiantes/")

    assert response.status_code == 200
    data = response.json()
    resultados = data["results"] if isinstance(data, dict) and "results" in data else data

    cedulas_visibles = {e["cedula"] for e in resultados}

    assert estudiante_del_salon.cedula in cedulas_visibles
    assert estudiante_ajeno.cedula not in cedulas_visibles
    assert len(resultados) == 1

@pytest.mark.django_db
def test_docente_no_puede_modificar_estudiante_de_otro_salon(
    api_client,
    docente_con_salon,
    otro_salon_con_estudiante,
):
    """
    Funcional #3
    Un docente que intenta alterar la información de un estudiante que NO 
    pertenece a su salón (consejería) mediante una petición PUT/PATCH debe recibir 
    un código de error HTTP (403 Forbidden o 404 Not Found), evitando modificaciones 
    no autorizadas entre salones de clase.
    """
    user, docente, salon = docente_con_salon
    _, estudiante_ajeno = otro_salon_con_estudiante

    # Autenticamos al docente principal (María)
    api_client.force_authenticate(user=user)

    # Intentamos actualizar los datos de 'Carlos' (que es del salón de Juan)
    url_estudiante_ajeno = f"/api/estudiantes/{estudiante_ajeno.id}/"
    payload_cambio = {
        "nombre": "Carlos Modificado",
        "apellido": "Rios"
    }

    response = api_client.put(url_estudiante_ajeno, payload_cambio, format="json")

    # Esperamos que el sistema proteja el recurso denegando el acceso o no encontrándolo
    assert response.status_code in [403, 404], (
        f"Se esperaba un código 403 o 404, pero se obtuvo {response.status_code}. "
        f"¡Un docente pudo intentar modificar un estudiante ajeno!"
    )