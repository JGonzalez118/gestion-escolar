from celery import shared_task
import time


@shared_task
def notificar_ausencia(estudiante_id, materia_id, fecha):
    from .models import Estudiante, Materia

    time.sleep(5)  

    estudiante = Estudiante.objects.get(id=estudiante_id)
    materia = Materia.objects.get(id=materia_id)

    print(
        f"[NOTIFICACIÓN] {estudiante.nombre} {estudiante.apellido} "
        f"fue marcado AUSENTE en {materia.nombre} el {fecha}."
    )