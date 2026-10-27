"""Génère les fiches projet (src/components/projets/*.astro) et src/data/projets.ts depuis les maquettes Projet-*.dc.html."""
import re, sys, os, json, html
M, ROOT = sys.argv[1], sys.argv[2]
ORDER = ['Medusor', 'Salon-des-Peches', 'Liquide-Imaginaire', 'Nutraclear', 'Fitadium', 'AP-Ressources-Humaines',
         'Oui-a-la-Qualite', 'Aline-Lemesle', 'Yubo', 'MSA', 'La-Grange-Coworking', 'Produit-Loco', 'Brand-Style']
SLUG = {k: k.lower().replace('oui-a-la-qualite', 'oui-a-la-qualite') for k in ORDER}
COLOR2KEY = {'#F2E3A0': 'cm', '#C9D6EC': 'audit', '#EFC9D2': 'graphisme', '#CFE3C4': 'redac', '#F4D3B8': 'ugc'}
SHORT = {'cm': 'CM'}

def strip_svg_ids(s):
    return s

def esc_braces(s):
    parts = re.split(r'(<[^>]+>)', s)
    return ''.join(p if p.startswith('<') else re.sub(r'[{}]', lambda m: "{'%s'}" % m.group(0), p) for p in parts)

def img_to_component(s):
    def rep(m):
        attrs = m.group(1)
        src = re.search(r'src="([^"]+)"', attrs).group(1)
        attrs = re.sub(r'\s*src="[^"]+"', '', attrs)
        return '<Img src="%s"%s sizes="(max-width: 720px) 132px, 240px" />' % (src, attrs)
    return re.sub(r'<img([^>]*?)/?>', rep, s)

def convert_examples(sheet):
    """Exemples : clic sur l'image = plein écran (V3). Les liens « Voir le post ↗ » restent."""
    def fig(m):
        f = m.group(0)
        if 'ap-rh.com' in f:
            return f  # capture du site : cliquable vers le site (PASSATION 5.3)
        full = None
        mfull = re.search(r'<a href="(msa-infographie\.jpg)"[^>]*aria-label="[^"]*"[^>]*>', f)
        if mfull:
            full = mfull.group(1)
        # le lien qui enveloppe le polaroïd devient un bouton « agrandir »
        def wrap(mm):
            return '<button type="button" class="ex-zoom" data-zoom%s>' % ('' if not full else ' data-full-name="%s"' % full)
        f = re.sub(r'<a href="[^"]+" target="_blank" rel="noopener" aria-label="[^"]*" style="display:block;text-decoration:none;color:inherit">', wrap, f, count=1)
        if 'class="ex-zoom"' in f:
            f = f.replace('</div></a><a class="link"', '</div></button><a class="link"', 1)
        elif '<div class="ph"' in f:
            f = re.sub(r'<div class="ph" style="([^"]*)">Plaquette<br>\[photo à venir\]</div>', r'<div class="ph" style="\1"><span class="a-completer">À compléter</span></div>', f)
        else:
            f = f.replace('<div class="polaroid"', '<button type="button" class="ex-zoom" data-zoom><div class="polaroid"', 1)
            f = f.replace('</div></figure>', '</div></button></figure>', 1)
        return f
    sheet = re.sub(r'<figure.*?</figure>', fig, sheet, flags=re.S)
    return sheet

def link_map(s):
    s = s.replace('href="msa-infographie.jpg"', 'href={img("msa-infographie.jpg")}')
    s = s.replace('href="Contact.dc.html"', 'href="/contact/"')
    return s

data = []
os.makedirs(ROOT + '/src/components/projets', exist_ok=True)
for n, name in enumerate(ORDER, 1):
    t = open('%s/Projet-%s.dc.html' % (M, name), encoding='utf-8').read()
    slug = SLUG[name]
    vbox = re.search(r'<section class="vbox".*?</section>', t, flags=re.S).group(0)
    tm = re.search(r'<h2 id="v-titre" class="h2" style="font-size:(\d+)px">([^<]+)</h2>', vbox)
    title, tsize = tm.group(2), tm.group(1)
    left = re.search(r'<div style="display:flex;flex-direction:column;gap:30px">(.*?)</dl>\s*</div>', vbox, flags=re.S).group(1) + '</dl>'
    cover = re.search(r'<img src="([^"]+)" alt="([^"]+)" style="([^"]+)">', left)
    client = re.search(r'<dt class="label" style="font-size:11px">Client</dt><dd style="([^"]*)">([^<]+)</dd>', left)
    tabs = re.findall(r'<button class="vtab" role="tab" aria-selected="\w+" style="background:(#\w+)">([^<]+)</button>', vbox)
    # feuilles : la première dans la fenêtre, les autres sous « Au clic sur l'onglet… »
    sheets = {}
    if True:
        # découpe équilibrée des <div>
        for m in re.finditer(r'<div class="vpanel dots"[^>]*style="background-color:(#\w+)">\s*<div class="vsheet">', t):
            start = m.end(); depth = 1; i = start
            while depth:
                o = t.find('<div', i); c = t.find('</div>', i)
                if o != -1 and o < c: depth += 1; i = o + 4
                else: depth -= 1; i = c + 6
            sheets.setdefault(m.group(1), t[start:i - 6])
    assert len(sheets) == len(tabs), (name, len(sheets), len(tabs))
    prev = re.search(r'<a class="vnav" href="Projet-([^"]+)\.dc\.html">.*?<span class="nm">([^<]+)</span></a>', vbox, flags=re.S)
    nxt = re.search(r'<a class="vnav" href="Projet-([^"]+)\.dc\.html"><span class="nm">([^<]+)</span>', vbox)
    svcs = re.search(r'<dd style="margin:8px 0 0" class="svcs">(.*?)</dd>', left).group(1)

    keys = [COLOR2KEY[c] for c, _ in tabs]
    data.append({'slug': slug, 'title': title, 'index': n, 'services': keys,
                 'cover': cover.group(1), 'coverAlt': cover.group(2)})

    tab_html = []
    panel_html = []
    for i, (color, label) in enumerate(tabs):
        key = COLOR2KEY[color]
        short = SHORT.get(key)
        lab = ('<span class="d-only">%s</span><span class="m-only">%s</span>' % (label, short)) if short else label
        tab_html.append('<li role="presentation"><button class="vtab" type="button" role="tab" id="tab-%s-%s" aria-controls="panel-%s-%s" aria-selected="%s" tabindex="%s" style="background:%s">%s</button></li>'
                        % (slug, key, slug, key, 'true' if i == 0 else 'false', '0' if i == 0 else '-1', color, lab))
        sheet = sheets[color]
        sheet = sheet.replace('<p class="label" style="font-size:11px">Ce que j\'ai fait</p>',
                              '<p class="label" style="font-size:11px"><span class="m-only">%s · </span>Ce que j\'ai fait</p>' % label, 1)
        sheet = re.sub(r'<div style="display:grid;grid-template-columns:repeat\((\d),minmax\(0,1fr\)\);gap:26px;padding:4px 6px 6px">',
                       r'<div class="ex-grid" style="display:grid;grid-template-columns:repeat(\1,minmax(0,1fr));gap:26px;padding:4px 6px 6px">', sheet)
        sheet = convert_examples(sheet)
        panel_html.append('''<div class="vpanel dots" role="tabpanel" id="panel-%s-%s" aria-labelledby="tab-%s-%s" style="background-color:%s"%s>
          <div class="vsheet">%s</div>
        </div>''' % (slug, key, slug, key, color, '' if i == 0 else ' hidden', sheet.strip()))

    body = '''<dialog class="fiche" id="fiche-%(slug)s" aria-labelledby="titre-%(slug)s" data-fiche="%(slug)s" data-index="%(n)d" open={open} data-open-on-load={open ? '' : undefined}>
  <section class="vbox">
    <div class="washi washi-plain f-washi1" style="width:120px;top:-15px;left:70px;transform:rotate(-4deg)"></div>
    <div class="washi washi-dots f-washi2" style="width:120px;top:-15px;right:90px;transform:rotate(3deg)"></div>
    <div class="f-grab" aria-hidden="true"></div>

    <div class="f-head">
      <div class="f-head-txt">
        <p class="label f-index"><span class="d-only">Portfolio · projet</span><span class="m-only">Projet</span> %(n)d / 13</p>
        <h2 id="titre-%(slug)s" class="h2 f-title" style="font-size:%(tsize)spx">%(title)s</h2>
        <p class="script f-script m-only" aria-hidden="true">en coulisses</p>
      </div>
      <button class="vclose" type="button" data-fiche-close aria-label="Fermer la fiche projet"><svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 2 L12 12 M12 2 L2 12" stroke="#4A2018" stroke-width="2.2" stroke-linecap="round"></path></svg>Fermer</button>
    </div>

    <div class="f-grid">
      <div class="f-left">
%(left)s
      </div>
      <div class="f-right">
        <ul class="vtabs" role="tablist" aria-label="Services réalisés pour ce client">
          %(tabs)s
        </ul>
        %(panels)s
      </div>
    </div>

    <div class="f-nav">
      <a class="vnav f-prev" href="/portfolio/%(prev)s/" data-projet="%(prev)s" data-fiche-nav="prev"><svg width="18" height="14" viewBox="0 0 18 14" aria-hidden="true"><path d="M17 7 H2 M7 1 L1 7 L7 13" fill="none" stroke="#4A2018" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg><span class="d-only">Précédent</span><span class="nm">%(prevname)s</span></a>
      <a class="btn btn-primary f-cta" href="/contact/"><span class="d-only">Un projet similaire ? Écrivez-moi</span><span class="m-only">Un projet similaire ?</span></a>
      <a class="vnav f-next" href="/portfolio/%(next)s/" data-projet="%(next)s" data-fiche-nav="next"><span class="nm">%(nextname)s</span><span class="d-only">Suivant</span><svg width="18" height="14" viewBox="0 0 18 14" aria-hidden="true"><path d="M1 7 H16 M11 1 L17 7 L11 13" fill="none" stroke="#4A2018" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg></a>
    </div>
  </section>
</dialog>
''' % {'slug': slug, 'n': n, 'title': title, 'tsize': tsize, 'left': '', 'tabs': '\n          '.join(tab_html), 'panels': '\n        '.join(panel_html),
       'prev': SLUG[prev.group(1)], 'prevname': prev.group(2), 'next': SLUG[nxt.group(1)], 'nextname': nxt.group(2)}

    # colonne gauche : couverture + client / services
    left_html = '''        <div class="polaroid f-cover" style="transform:rotate(-2.5deg)">
          <div class="washi washi-floral" style="width:110px;top:-14px;left:50%%;margin-left:-55px;transform:rotate(3deg)"></div>
          <img src="%s" alt="%s" style="%s">
          <p class="polaroid-cap"%s>%s</p>
        </div>
        <dl class="f-meta" style="margin:0;display:flex;flex-direction:column;gap:14px">
          %s<div class="f-svcs"><dt class="label" style="font-size:11px">Services</dt><dd style="margin:8px 0 0" class="svcs">%s</dd></div>
        </dl>''' % (cover.group(1), cover.group(2), cover.group(3), *re.search(r'<p class="polaroid-cap"((?: style="[^"]*")?)>([^<]+)</p>', left).groups(),
                    ('<div class="f-client"><dt class="label" style="font-size:11px">Client<span class="m-only"> :</span></dt><dd style="%s">%s</dd></div>' % (client.group(1), client.group(2))) if client else '',
                    svcs)
    body = body.replace('\n\n      </div>\n      <div class="f-right">', '\n' + left_html + '\n      </div>\n      <div class="f-right">', 1)
    body = img_to_component(body)
    body = body.replace('<Img src="%s"' % cover.group(1), '<Img src="%s"' % cover.group(1), 1).replace('sizes="(max-width: 720px) 132px, 240px" />\n          <p class="polaroid-cap"', 'sizes="(max-width: 720px) 330px, 360px" />\n          <p class="polaroid-cap"', 1)
    body = link_map(body)
    # bouton « agrandir » : image d'origine en plein écran
    def zoom(m):
        btn = m.group(0)
        return btn
    body = esc_braces(body)
    # data-full : URL de l'image d'origine
    def addfull(m):
        tag, rest = m.group(1), m.group(2)
        full = re.search(r'data-full-name="([^"]+)"', tag)
        src = full.group(1) if full else re.search(r'<Img src="([^"]+)"', rest).group(1)
        tag = re.sub(r' data-full-name="[^"]+"', '', tag)
        alt = re.search(r'alt="([^"]+)"', rest).group(1)
        return tag.replace('data-zoom', 'data-zoom data-full={img("%s")} aria-label="Agrandir : %s"' % (src, alt)) + rest
    body = re.sub(r'(<button type="button" class="ex-zoom" data-zoom[^>]*>)(<div class="polaroid".*?<Img src="[^"]+"[^>]*>)', addfull, body, flags=re.S)
    comp = '''---
// Fiche projet « %s » (maquette Projet-%s.dc.html). Généré par tools/projets.py, puis relu.
import Img from '../Img.astro';
import { img } from '../../lib/images';

interface Props {
  /** Fiche affichée d'emblée (page /portfolio/<projet>/). */
  open?: boolean;
}
const { open = false } = Astro.props;
---
%s''' % (title, name, body)
    open('%s/src/components/projets/%s.astro' % (ROOT, slug), 'w', encoding='utf-8').write(comp)
    print(n, slug, title, keys, 'client' if client else '')

ts = '''// Ordre et métadonnées des 13 projets (PASSATION § 5.3). Généré depuis les maquettes.
export type ServiceKey = 'cm' | 'audit' | 'graphisme' | 'redac' | 'ugc';
export interface Projet {
  slug: string;
  title: string;
  index: number;
  services: ServiceKey[];
  cover: string;
  coverAlt: string;
}
export const PROJETS: Projet[] = %s;
''' % json.dumps(data, ensure_ascii=False, indent=2)
os.makedirs(ROOT + '/src/data', exist_ok=True)
open(ROOT + '/src/data/projets.ts', 'w', encoding='utf-8').write(ts)
