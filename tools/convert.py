"""Convertit une maquette desktop (*.dc.html) en page Astro (contenu entre header et footer)."""
import re, sys, os, json

SRC = sys.argv[1]
OUT = sys.argv[2]
LAYOUT_PROPS = sys.argv[3] if len(sys.argv) > 3 else ''

ROUTES = {
    'Accueil-desktop': '/', 'Accueil-mobile': '/',
    'Services': '/services/',
    'Service-CM': '/services/community-management/',
    'Service-Audit': '/services/audit-strategique/',
    'Service-Graphisme': '/services/graphisme/',
    'Service-Redaction': '/services/redactionnel/',
    'Service-UGC': '/services/ugc/',
    'Portfolio': '/portfolio/',
    'Apropos': '/a-propos/',
    'Contact': '/contact/',
    'Mentions-legales': '/mentions-legales/',
    'Confidentialite': '/confidentialite/',
}
PROJETS = {
    'Medusor': 'medusor', 'Salon-des-Peches': 'salon-des-peches', 'Liquide-Imaginaire': 'liquide-imaginaire',
    'Nutraclear': 'nutraclear', 'Fitadium': 'fitadium', 'AP-Ressources-Humaines': 'ap-ressources-humaines',
    'Oui-a-la-Qualite': 'oui-a-la-qualite', 'Aline-Lemesle': 'aline-lemesle', 'Yubo': 'yubo', 'MSA': 'msa',
    'La-Grange-Coworking': 'la-grange-coworking', 'Produit-Loco': 'produit-loco', 'Brand-Style': 'brand-style',
}

def map_href(m):
    h = m.group(1)
    base = h.split('#')[0]
    frag = '#' + h.split('#')[1] if '#' in h else ''
    if base.endswith('.dc.html'):
        name = base[:-8]
        if name.startswith('Projet-'):
            return 'href="/portfolio/%s/"%s' % (PROJETS[name[7:]], ' data-projet="%s"' % PROJETS[name[7:]])
        return 'href="%s%s"' % (ROUTES[name], frag)
    if base.endswith('.jpg'):
        return 'href={img("%s")}' % base
    return m.group(0)

t = open(SRC, encoding='utf-8').read()
body = t[t.find('</header>') + len('</header>'):]
end = body.find('<!-- FOOTER -->')
if end < 0:
    end = body.find('<footer')
body = body[:end]

# annotations (bulles bleues) : jamais sur le site
body = re.sub(r'\s*<(div|li) class="anim"[^>]*>.*?</\1>', '', body, flags=re.S)
body = re.sub(r'href="([^"]*)"', map_href, body)

# images -> composant optimisé
def img(m):
    attrs = m.group(1)
    src = re.search(r'src="([^"]+)"', attrs).group(1)
    attrs = re.sub(r'\s*src="[^"]+"', '', attrs)
    return '<Img src="%s"%s />' % (src, attrs)
body = re.sub(r'<img([^>]*?)/?>', img, body)

# accolades dans le texte (Astro les interpréterait)
def esc(seg):
    return re.sub(r'[{}]', lambda m: "{'%s'}" % m.group(0), seg)
parts = re.split(r'(<[^>]+>)', body)
body = ''.join(p if p.startswith('<') else esc(p) for p in parts)

body = body.strip('\n')
uses_img = 'img(' in body
front = "---\nimport Base from '%s/layouts/Base.astro';\nimport Img from '%s/components/Img.astro';\n%s---\n" % (
    LAYOUT_PROPS.split('|')[0], LAYOUT_PROPS.split('|')[0],
    "import { img } from '%s/lib/images';\n" % LAYOUT_PROPS.split('|')[0] if uses_img else '')
props = LAYOUT_PROPS.split('|')[1] if '|' in LAYOUT_PROPS else ''
out = front + '\n<Base %s>\n%s\n</Base>\n' % (props, body)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
open(OUT, 'w', encoding='utf-8').write(out)
print('ok', OUT, len(out))
