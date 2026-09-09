#!/usr/bin/env python3
"""Import one generated badge and record the full built-in prompt."""
import argparse
import json
from pathlib import Path
import shutil
import subprocess

parser = argparse.ArgumentParser()
parser.add_argument('badge_id')
parser.add_argument('source', type=Path)
args = parser.parse_args()
root = Path(__file__).resolve().parents[2]
plan = json.loads((root / 'docs/twilight/production.json').read_text())
badge = next(b for b in plan['badges'] if b['id'] == args.badge_id)
out = root / 'docs/twilight/final-art'
(out / 'originals').mkdir(parents=True, exist_ok=True)
shutil.copy2(args.source, out / 'originals' / f'{args.badge_id}.png')
asset = root / f'public/passports/twilight/assets/images/badges/badge-{args.badge_id}.webp'
subprocess.run(['magick', str(args.source), '-resize', '768x768', '-quality', '88', str(asset)], check=True)
manifest = out / 'manifest.json'
data = json.loads(manifest.read_text()) if manifest.exists() else {'imageMode':'built-in image_gen','images':[]}
data['images'] = [b for b in data['images'] if b['id'] != args.badge_id]
data['images'].append({'id':args.badge_id,'name':badge['name'],'original':f'originals/{args.badge_id}.png','asset':str(asset.relative_to(root)),'prompt':badge['imagePrompt']})
manifest.write_text(json.dumps(data, indent=2) + '\n')
print(f'Imported {args.badge_id}: {asset.stat().st_size} bytes')
