# PROCURA TODAS AS OCORRÊNCIAS DE BRANCO PURO E TROCA POR CURRENTCOLOR, A COR ATUAL DO TEXTO DO SISTEMA
# SERVE PRA SVGS NÃO QUEBRAREM ENTRE O MODO CLARO E ESCURO, E NÃO DESTOAREM DE TEXTOS NORMAIS

from pathlib import Path
import sys
import shutil
import re

if len(sys.argv) < 2:
    print("Uso: python set_current_color.py CAMINHO_DO_SVG")
    sys.exit(1)

svg_path = Path(sys.argv[1])

if not svg_path.exists():
    print("Arquivo não encontrado:", svg_path)
    sys.exit(1)

# diretório do script pra salvar backup
script_dir = Path(__file__).parent
backup_dir = script_dir / "backup"
backup_dir.mkdir(exist_ok=True)

# backup
backup_path = backup_dir / (svg_path.stem + ".bak.svg")
shutil.copy2(svg_path, backup_path)

# ler conteúdo
content = svg_path.read_text(encoding="utf-8")

# substitui fill e stroke brancos normais
content = re.sub(r'fill="#ffffff"', 'fill="currentColor"', content, flags=re.IGNORECASE)
content = re.sub(r'stroke="#ffffff"', 'stroke="currentColor"', content, flags=re.IGNORECASE)

# substitui fill:#ffffff e stroke:#ffffff dentro de style=""
def replace_style(match):
    style = match.group(1)
    style = re.sub(r'fill\s*:\s*#ffffff', 'fill:currentColor', style, flags=re.IGNORECASE)
    style = re.sub(r'stroke\s*:\s*#ffffff', 'stroke:currentColor', style, flags=re.IGNORECASE)
    return f'style="{style}"'

content = re.sub(r'style="([^"]*?)"', replace_style, content, flags=re.IGNORECASE)

# salvar de volta
svg_path.write_text(content, encoding="utf-8")

print("Substituição concluída. Backup salvo em:", backup_path)
