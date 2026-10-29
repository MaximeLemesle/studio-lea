"""Prépare un aperçu en ligne du site (dossier sans réécriture d'URL, sans PHP).

Usage : PREVIEW=1 npx astro build --outDir dist-preview && python3 tools/preview.py dist-preview

Les chemins absolus (/services/, /assets/…) deviennent relatifs (../services/index.html),
et <html> reçoit data-root pour que les fiches projet se chargent en relatif.
"""
import os
import re
import sys

ROOT = sys.argv[1]


def rel_prefix(path):
    depth = os.path.relpath(path, ROOT).count(os.sep)
    return '../' * depth or './'


def fix_url(url, prefix):
    if not url.startswith('/') or url.startswith('//'):
        return url
    path, _, frag = url.partition('#')
    path, _, query = path.partition('?')
    path = path.lstrip('/')
    if path == '' or path.endswith('/'):
        path += 'index.html'
    out = prefix + path
    if query:
        out += '?' + query
    if frag:
        out += '#' + frag
    return out


for dirpath, _, files in os.walk(ROOT):
    for name in files:
        full = os.path.join(dirpath, name)
        if name.endswith('.html'):
            prefix = rel_prefix(full)
            t = open(full, encoding='utf-8').read()
            t = re.sub(r'\b(href|src|action|data-full)="(/[^"]*)"', lambda m: '%s="%s"' % (m.group(1), fix_url(m.group(2), prefix)), t)
            t = re.sub(r'\bsrcset="([^"]*)"', lambda m: 'srcset="%s"' % ', '.join(
                ' '.join([fix_url(p.split()[0], prefix)] + p.split()[1:]) for p in m.group(1).split(',') if p.strip()), t)
            t = re.sub(r'url\((["\']?)(/assets/[^)"\']+)\1\)', lambda m: 'url(%s%s%s)' % (m.group(1), fix_url(m.group(2), prefix), m.group(1)), t)
            t = t.replace('<html lang="fr">', '<html lang="fr" data-root="%s">' % prefix, 1)
            open(full, 'w', encoding='utf-8').write(t)
        elif name.endswith('.css'):
            t = open(full, encoding='utf-8').read()
            t = re.sub(r'url\((["\']?)/assets/', lambda m: 'url(%s./' % m.group(1), t)
            open(full, 'w', encoding='utf-8').write(t)
        elif name.endswith('.js'):
            t = open(full, encoding='utf-8').read()
            t = t.replace('"/assets/', '"./').replace("'/assets/", "'./")
            open(full, 'w', encoding='utf-8').write(t)
print('aperçu prêt :', ROOT)
