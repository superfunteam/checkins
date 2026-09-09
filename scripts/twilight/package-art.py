#!/usr/bin/env python3
"""Package the completed art for review, preserving the generated originals."""
import html, json, shutil, subprocess, tempfile, zipfile
from pathlib import Path
root=Path(__file__).resolve().parents[2]
out=root/'docs/twilight/final-art'
manifest=json.loads((out/'manifest.json').read_text())
passport=json.loads((root/'public/passports/twilight/passport.json').read_text())
by_id={i['id']:i for i in manifest['images']}
badges=sorted(passport['badges'],key=lambda b:b['order'])
(out/'web').mkdir(exist_ok=True)
cards=[]
for b in badges:
 asset=root/by_id[b['id']]['asset'];shutil.copy2(asset,out/'web'/f"{b['id']}.webp")
 cards.append(f'''<figure data-type="{b['type']}"><a href="web/{b['id']}.webp" target="_blank"><img src="web/{b['id']}.webp" alt="{html.escape(b['name'])}" width="768" height="768" loading="lazy"></a><figcaption><small>{b['type'].upper()} · {b['order']:02}</small><h2>{html.escape(b['name'])}</h2><p>{html.escape(b['shortDesc'])}</p></figcaption></figure>''')
page='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Twilight — Complete Badge Collection</title><style>
*{box-sizing:border-box}body{margin:0;background:#13272c;color:#f2eee8;font:16px/1.5 system-ui,sans-serif}header,main{max-width:1240px;margin:auto;padding:32px}header{padding-bottom:12px}h1{font:38px Georgia,serif;margin:0 0 12px}header p{max-width:740px;color:#c4d0cf}nav{display:flex;flex-wrap:wrap;gap:10px;margin:24px 0}button{font:inherit;border:1px solid #83938b;border-radius:8px;padding:10px 16px;background:transparent;color:inherit;cursor:pointer}button[aria-pressed=true]{background:#e9e5dc;color:#173034}main{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:28px;padding-top:12px}figure{margin:0}img{display:block;width:100%;height:auto;aspect-ratio:1;object-fit:cover;border:12px solid white;border-radius:50% 50% 24% 24%;box-shadow:0 8px 14px #0004}body.square img{border-radius:0;border:0}small{color:#b9aaa4;font-size:11px;letter-spacing:.12em}h2{font:22px/1.2 Georgia,serif;margin:6px 0}figcaption{padding:16px 4px}figcaption p{color:#b5c7c5;font-size:13px;margin:0}figure[hidden]{display:none}@media(max-width:850px){main{grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}}@media(max-width:600px){main{grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;padding:20px}header{padding:24px}h1{font-size:30px}img{border-width:8px}h2{font-size:19px}}@media print{nav{display:none}body{background:white;color:black}figure{break-inside:avoid}}
</style><header><small>FORKS FIELD NOTES · ART COLLECTION</small><h1>From first sight to forever.</h1><p>33 painterly Twilight illustrations: 20 scenes, 5 completed films, 4 meals, and 4 collection rewards. Every in-app badge uses the Gowalla arch. Open an image for its web-ready artwork; the original PNGs and complete prompts are retained alongside this gallery.</p><nav aria-label="Artwork category"><button data-filter="all" aria-pressed="true">All 33</button><button data-filter="scene" aria-pressed="false">Scenes</button><button data-filter="movie" aria-pressed="false">Movies</button><button data-filter="meal" aria-pressed="false">Meals</button><button data-filter="secret" aria-pressed="false">Collections</button><button id="shape" aria-pressed="false">View square artwork</button></nav></header><main>'''+''.join(cards)+'''</main><script>document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',x===b));document.querySelectorAll('figure').forEach(f=>f.hidden=b.dataset.filter!=='all'&&f.dataset.type!==b.dataset.filter)});document.querySelector('#shape').onclick=e=>{const square=document.body.classList.toggle('square');e.target.setAttribute('aria-pressed',square);e.target.textContent=square?'View Gowalla arches':'View square artwork'};</script></html>'''
(out/'index.html').write_text(page)
(out/'README.md').write_text('''# Complete Twilight badge collection

33 generated illustrations: 20 scenes, 5 final film badges, 4 meals, and 4 bonuses. The five approved samples are preserved. All in-app badges and certificate badges use the Gowalla arch shape.

Open `index.html` for a filterable gallery with arch and square previews. `web/` contains 768px optimized WebP assets; `originals/` preserves the generated square PNGs. `manifest.json` records the exact prompts and the one signature-removal edit. The share ZIP contains the gallery, web assets, contact sheet, and manifest; originals remain in this folder.

Artwork uses a cohesive gothic romance / painterly fantasy-game direction. Scene compositions are interpretive illustrations, not literal film stills. Copy, narration, and timing notes are in the parent Twilight handoff folder.
''')
with tempfile.TemporaryDirectory() as tmp:
 panels=[]
 for b in badges:
  panel=Path(tmp)/f"{b['order']:02}.jpg";panels.append(str(panel))
  subprocess.run(['magick',str(out/'web'/f"{b['id']}.webp"),'-resize','270x270','-background','#13272c','-gravity','south','-splice','0x50','-font','Helvetica','-fill','#f2eee8','-pointsize','13','-annotate','+0+22',b['name'],'-fill','#b5c7c5','-pointsize','10','-annotate','+0+5',b['type'].upper(),str(panel)],check=True)
 subprocess.run(['magick','montage',*panels,'-tile','5x','-geometry','+10+10','-background','#13272c',str(out/'contact-sheet.jpg')],check=True)
zip_path=root/'docs/twilight/twilight-complete-art.zip'
with zipfile.ZipFile(zip_path,'w',zipfile.ZIP_DEFLATED) as z:
 for p in [out/'index.html',out/'README.md',out/'manifest.json',out/'contact-sheet.jpg',*sorted((out/'web').glob('*.webp'))]:z.write(p,Path('twilight-complete-art')/p.relative_to(out))
print(f'Packaged {len(badges)} illustrations; {zip_path.stat().st_size/1e6:.1f} MB share ZIP')
