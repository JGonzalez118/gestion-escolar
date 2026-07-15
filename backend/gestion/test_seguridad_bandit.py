"""
Pruebas NO FUNCIONALES de seguridad, usando Bandit (analisis estatico /
SAST) sobre el codigo fuente real del backend.

Se eligio Bandit sobre Locust porque no requiere levantar el servidor
ni generar carga: basta con analizar el codigo fuente, lo que lo hace
mas simple de integrar en un pipeline de CI para este proyecto.

Estas pruebas se alinean con el modulo de KPIs de ciberseguridad de la
monografia (gestion de vulnerabilidades / SAST) y quedan documentadas
como evidencia de control de calidad de seguridad del proyecto.
"""
import json
import subprocess
import sys
from pathlib import Path

import pytest

BACKEND_DIR = Path(__file__).resolve().parent.parent

# Codigo "de produccion": lo que realmente sirve las peticiones de la API.
# Se excluyen scripts auxiliares (seed.py, limpiar_duplicados.py, etc.)
# porque son herramientas de desarrollo, no parte del sistema en ejecucion.
ARCHIVOS_CRITICOS = [
    "gestion/models.py",
    "gestion/views.py",
    "gestion/serializers.py",
    "gestion/permissions.py",
    "gestion/urls.py",
    "core/settings.py",
    "core/urls.py",
]


def _ejecutar_bandit(paths):
    """Corre bandit -f json sobre los paths dados y devuelve el dict resultante."""
    resultado = subprocess.run(
        [sys.executable, "-m", "bandit", "-f", "json", *paths],
        cwd=BACKEND_DIR,
        capture_output=True,
        text=True,
    )
    # Bandit devuelve returncode=1 cuando SI encuentra hallazgos; eso es
    # esperado y no significa que el comando haya fallado.
    return json.loads(resultado.stdout)


def test_codigo_critico_no_tiene_vulnerabilidades_de_severidad_alta():
    """
    No funcional #1 (Bandit - SAST)

    El codigo que atiende peticiones reales (modelos, vistas,
    serializadores, permisos y configuracion) no debe contener
    hallazgos de severidad ALTA. Esta prueba actua como barrera de
    regresion: si alguien introduce codigo inseguro (ej. eval(),
    inyeccion SQL, deserializacion insegura), la build debe fallar.
    """
    reporte = _ejecutar_bandit(ARCHIVOS_CRITICOS)

    altos = [
        r for r in reporte["results"]
        if r["issue_severity"] == "HIGH"
    ]

    mensaje = "\n".join(
        f"- {r['test_id']} en {r['filename']}:{r['line_number']} -> {r['issue_text']}"
        for r in altos
    )

    assert altos == [], (
        f"Se encontraron {len(altos)} hallazgo(s) de severidad ALTA:\n{mensaje}"
    )


def test_bandit_detecta_secreto_hardcodeado_en_settings():
    """
    No funcional #2 (Bandit - SAST)

    Verifica que el analizador de seguridad SI es capaz de detectar un
    hallazgo real y conocido del proyecto: la SECRET_KEY de Django esta
    hardcodeada en core/settings.py (regla B105 de Bandit) en lugar de
    cargarse desde una variable de entorno.

    Esta prueba documenta el hallazgo como parte del KPI de gestion de
    vulnerabilidades: hoy debe pasar porque el problema existe y Bandit
    lo detecta correctamente. El dia que se corrija (leyendo la
    SECRET_KEY desde el entorno), esta prueba debe invertirse para
    exigir 0 hallazgos B105, confirmando la remediacion.
    """
    reporte = _ejecutar_bandit(["core/settings.py"])

    hallazgos_secreto = [
        r for r in reporte["results"]
        if r["test_id"] in ("B105", "B106", "B107")
    ]

    assert len(hallazgos_secreto) >= 1, (
        "Se esperaba que Bandit detectara la SECRET_KEY hardcodeada en "
        "core/settings.py; si ya no aparece, probablemente el hallazgo "
        "fue remediado y esta prueba debe actualizarse para exigir 0 "
        "hallazgos en su lugar."
    )

def test_codigo_critico_no_tiene_vulnerabilidades_de_severidad_media():
    """
    No funcional #3 (Bandit - SAST)

    El código crítico del backend que procesa solicitudes no debe contener 
    vulnerabilidades de severidad MEDIA. Esto previene regresiones de seguridad 
    comunes, como el uso de la función peligrosa eval(), el uso inseguro de la 
    librería subprocess (por ejemplo, shell=True), o la generación de números 
    aleatorios no criptográficos para datos sensibles.
    """
    reporte = _ejecutar_bandit(ARCHIVOS_CRITICOS)

    # Filtramos las vulnerabilidades clasificadas estrictamente como MEDIUM
    medio = [
        r for r in reporte["results"]
        if r["issue_severity"] == "MEDIUM"
    ]

    mensaje = "\n".join(
        f"- {r['test_id']} en {r['filename']}:{r['line_number']} -> {r['issue_text']}"
        for r in medio
    )

    assert medio == [], (
        f"Se encontraron {len(medio)} hallazgo(s) de severidad MEDIA en el código crítico:\n{mensaje}"
    )