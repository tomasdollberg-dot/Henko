#!/usr/bin/env python3
"""Genera material en bruto para la web de Henko con MoneyPrinterTurbo.

MoneyPrinterTurbo ensambla clips de stock de Pexels: no crea imágenes ni vídeo
original. Aquí se usa solo para conseguir clips de equipos trabajando (pizarras,
post-its, talleres) que ilustren «mejora continua». Sin voz, sin música y sin
subtítulos; el procesado final (recorte, color, peso) se hace después con ffmpeg.

Debe ejecutarse con el Python del entorno de MoneyPrinterTurbo, desde el Terminal del Mac:

    cd ~/MoneyPrinterTurbo-v1.3.7
    .venv/bin/python ~/Proyectos/henko/tools/generate_media.py --only hero-equipo   # prueba con uno
    .venv/bin/python ~/Proyectos/henko/tools/generate_media.py                      # todos

Salida: ~/Proyectos/henko/media-raw/<nombre>.mp4  (carpeta ignorada por git)
Licencia del material: Pexels permite uso comercial sin atribución; guardá igualmente
el registro de la tarea (task_id) por si hay que localizar un clip.
"""
import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path

# Términos de búsqueda en inglés (Pexels indexa en inglés). El guion es solo un
# texto de apoyo que exige el CLI; no se oye ni se ve en el resultado.
BRIEFS = [
    dict(slug="hero-equipo", aspect="16:9", clip=5,
         script="Un equipo de trabajo ordena sus procesos junto a su consultor, con pizarras y notas adhesivas.",
         terms=["team meeting sticky notes whiteboard", "small business team planning workshop",
                "colleagues planning kanban board", "hands moving sticky notes board",
                "manager and team discussing process improvement", "office team collaboration discussion"]),
    dict(slug="taller-pizarra", aspect="1:1", clip=5,
         script="Un taller de equipo para ordenar el trabajo.",
         terms=["whiteboard planning team", "sticky notes wall", "kanban board close up",
                "team standup meeting office"]),
    dict(slug="mejora-continua", aspect="1:1", clip=5,
         script="Revisar, ajustar y mejorar de forma continua.",
         terms=["process improvement diagram whiteboard", "business team reviewing checklist",
                "audit checklist clipboard office", "colleagues reviewing documents table"]),
    dict(slug="higiene-seguridad", aspect="1:1", clip=5,
         script="Controles para un entorno de trabajo seguro.",
         terms=["workplace safety inspection", "industrial worker safety helmet checking",
                "factory floor safety audit", "warehouse safety walkthrough"]),
    dict(slug="seleccion-personal", aspect="1:1", clip=5,
         script="Encontrar a las personas adecuadas para cada equipo.",
         terms=["job interview office", "recruiter interviewing candidate",
                "hr team reviewing resumes", "handshake business meeting"]),
    dict(slug="asesoramiento-legal", aspect="1:1", clip=5,
         script="Cumplimiento legal claro y al día.",
         terms=["legal documents desk", "lawyer reviewing contract",
                "business people signing documents", "compliance paperwork office"]),
    dict(slug="capacitacion", aspect="1:1", clip=5,
         script="Formar al equipo con ejemplos de su propia operación.",
         terms=["employee training session", "workshop trainer explaining whiteboard",
                "factory team training room", "colleagues learning together office"]),
]


def run_brief(mpt: Path, out_dir: Path, brief: dict) -> bool:
    cmd = [
        sys.executable, "cli.py",
        "--video-script", brief["script"],
        "--video-terms", ",".join(brief["terms"]),
        "--video-language", "es-ES",
        "--video-source", "pexels",
        "--video-aspect", brief["aspect"],
        "--video-count", "1",
        "--voice-name", "no-voice",
        "--bgm-type", "none",
        "--no-subtitle-enabled",
        "--video-clip-duration", str(brief["clip"]),
        "--video-transition-mode", "none",
        "--n-threads", "2",
    ]
    log = out_dir / f"{brief['slug']}.log"
    print(f"→ {brief['slug']} ({brief['aspect']})")
    with log.open("w") as fh:
        result = subprocess.run(cmd, cwd=mpt, stdout=fh, stderr=subprocess.STDOUT)
    if result.returncode != 0:
        print(f"  ✗ falló (código {result.returncode}). Revisá {log}")
        return False

    # El CLI imprime una línea JSON con el task_id; el vídeo queda en storage/tasks/<id>/final-1.mp4
    task_id = None
    for line in reversed(log.read_text(errors="ignore").splitlines()):
        line = line.strip()
        if line.startswith("{") and '"task_id"' in line:
            try:
                task_id = json.loads(line)["task_id"]
                break
            except (json.JSONDecodeError, KeyError):
                continue
    src = mpt / "storage" / "tasks" / task_id / "final-1.mp4" if task_id else None
    if not src or not src.exists():
        candidates = sorted((mpt / "storage" / "tasks").glob("*/final-1.mp4"), key=lambda p: p.stat().st_mtime)
        src = candidates[-1] if candidates else None
    if not src:
        print(f"  ✗ no encuentro el vídeo final. Revisá {log}")
        return False
    dest = out_dir / f"{brief['slug']}.mp4"
    shutil.copy2(src, dest)
    print(f"  ✓ {dest}  (task_id: {task_id})")
    return True


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--mpt", default="~/MoneyPrinterTurbo-v1.3.7", help="carpeta de MoneyPrinterTurbo")
    ap.add_argument("--out", default="~/Proyectos/henko/media-raw", help="carpeta de salida")
    ap.add_argument("--only", help="generar solo este nombre (ver BRIEFS)")
    a = ap.parse_args()
    mpt = Path(a.mpt).expanduser()
    out_dir = Path(a.out).expanduser()
    if not (mpt / "cli.py").exists():
        print(f"No encuentro cli.py en {mpt}")
        return 2
    out_dir.mkdir(parents=True, exist_ok=True)
    briefs = [b for b in BRIEFS if not a.only or b["slug"] == a.only]
    if not briefs:
        print("Nombre desconocido. Opciones: " + ", ".join(b["slug"] for b in BRIEFS))
        return 2
    ok = [run_brief(mpt, out_dir, b) for b in briefs]
    print(f"\n{sum(ok)}/{len(ok)} generados en {out_dir}")
    return 0 if all(ok) else 1


if __name__ == "__main__":
    sys.exit(main())
