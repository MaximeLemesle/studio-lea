import re, glob, collections, os, sys
M = sys.argv[1]; OUT = sys.argv[2]
main = ['Accueil-desktop','Services','Service-CM','Service-Audit','Service-Graphisme','Service-Redaction','Service-UGC','Portfolio','Apropos','Contact','Mentions-legales','Confidentialite']
projets = [os.path.basename(f)[:-8] for f in sorted(glob.glob(M+'/Projet-*.dc.html'))]
SKIP = re.compile(r'^(body|\.anim.*|\.no-anno.*|\*)$')
def rules(css):
    out=[];depth=0;cur=''
    for ch in css:
        cur+=ch
        if ch=='{':depth+=1
        elif ch=='}':
            depth-=1
            if depth==0: out.append(cur.strip());cur=''
    return out
per = {}
for p in main+projets:
    t=open('%s/%s.dc.html'%(M,p),encoding='utf-8').read()
    css=''.join(re.findall(r'<style>(.*?)</style>',t,flags=re.S))
    per[p]=[(r[:r.find('{')].strip(), r) for r in rules(css)]
count=collections.defaultdict(collections.Counter)
for p in main:
    for s,r in per[p]: count[s][r]+=1
common={}
for s,c in count.items():
    if SKIP.match(s): continue
    if len(c)==1 and sum(c.values())>=10: common[s]=next(iter(c))
os.makedirs(OUT+'/pages',exist_ok=True)
order=[]
for p in main:
    for s,r in per[p]:
        if s in common and s not in order: order.append(s)
open(OUT+'/base.css','w').write('/* Styles communs à toutes les maquettes (extraits tels quels) */\n'+'\n'.join(common[s] for s in order)+'\n')
for p in main+projets:
    rs=[r for s,r in per[p] if not SKIP.match(s) and common.get(s)!=r]
    name=p.replace('-desktop','').lower()
    open('%s/pages/%s.css'%(OUT,name),'w').write('\n'.join(rs)+'\n')
    print(p,len(rs))
