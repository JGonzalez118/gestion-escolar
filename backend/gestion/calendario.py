from datetime import date

TRIMESTRES_2026 = [
    {
        "nombre": "Primer Trimestre",
        "inicio": date(2026, 3, 2),
        "fin": date(2026, 5, 29),
    },
    {
        "nombre": "Segundo Trimestre",
        "inicio": date(2026, 6, 8),
        "fin": date(2026, 9, 4),
    },
    {
        "nombre": "Tercer Trimestre",
        "inicio": date(2026, 9, 14),
        "fin": date(2026, 12, 11),
    },
]

def obtener_nombre_periodo_actual(hoy=None):
    """
    Devuelve el nombre del trimestre correspondiente a la fecha dada
    (o a hoy, si no se especifica). Devuelve None si la fecha cae
    en un receso o fuera del año lectivo.
    """
    if hoy is None:
        hoy = date.today()
    for trimestre in TRIMESTRES_2026:
        if trimestre["inicio"] <= hoy <= trimestre["fin"]:
            return trimestre["nombre"]
    return None