from django.db.models import Count, Max
from gestion.models import Asistencia  # ajusta "asistencia" al nombre real de tu app

duplicados = (
    Asistencia.objects.values('estudiante', 'materia', 'fecha')
    .annotate(total=Count('id'), ultimo_id=Max('id'))
    .filter(total__gt=1)
)

registros_a_borrar = []

for grupo in duplicados:
    ids_del_grupo = Asistencia.objects.filter(
        estudiante=grupo['estudiante'],
        materia=grupo['materia'],
        fecha=grupo['fecha'],
    ).order_by('id').values_list('id', flat=True)

    ids_a_borrar = list(ids_del_grupo)[:-1]
    registros_a_borrar.extend(ids_a_borrar)

print(f"Se van a borrar {len(registros_a_borrar)} registros duplicados.")
print(registros_a_borrar)
