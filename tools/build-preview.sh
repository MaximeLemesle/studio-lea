#!/bin/sh
# Construit l'aperçu en ligne allégé dans dist-preview/ (voir tools/preview.py).
set -e
rm -rf dist-preview
PREVIEW=1 npx astro build --outDir dist-preview
python3 tools/preview.py dist-preview
rm -rf dist-preview/api dist-preview/.htaccess dist-preview/assets/*.woff
cd dist-preview
for f in assets/*.jpg; do b=$(basename "$f"); grep -rqF "$b" --include=*.html --include=*.css --include=*.js . || rm "$f"; done
