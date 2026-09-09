#!/usr/bin/env python3
"""Generate the reviewed Twilight scripts; key stays in process memory.

ELEVENLABS_API_KEY=... python3 scripts/twilight/generate-audio.py
Or use --key-stdin (hidden prompt in a terminal). Matching audio is skipped.
Use --replace to archive and replace clips after a dialogue revision.
"""
import argparse
import hashlib
import getpass
import json
import os
from pathlib import Path
import subprocess
import shutil
import sys
import tempfile
import urllib.error
import urllib.request

parser = argparse.ArgumentParser()
parser.add_argument('--key-stdin', action='store_true')
parser.add_argument('--only', nargs='*')
parser.add_argument('--replace', action='store_true')
args = parser.parse_args()
key = (getpass.getpass('ElevenLabs key: ') if sys.stdin.isatty() else sys.stdin.readline().strip()) if args.key_stdin else os.environ.get('ELEVENLABS_API_KEY')
if not key:
    sys.exit('Set ELEVENLABS_API_KEY or provide --key-stdin. Never commit the key.')
root = Path(__file__).resolve().parents[2]
plan = json.loads((root / 'docs/twilight/production.json').read_text())
receipt_path = root / 'docs/twilight/audio-receipts.json'
receipts = json.loads(receipt_path.read_text()) if receipt_path.exists() else {}
items = [(b, 'badges', 'badge-') for b in plan['badges']] + [(b, 'greetings', '') for b in plan['greetings']]
if args.only and set(args.only) - {item['id'] for item, _, _ in items}:
    sys.exit('Unknown clip ID in --only.')
processing = 'silenceremove=start_periods=1:start_duration=0.02:start_threshold=-48dB:start_silence=0.06,areverse,silenceremove=start_periods=1:start_duration=0.02:start_threshold=-48dB:start_silence=0.10,areverse,loudnorm=I=-16:TP=-1.5:LRA=11'
for item, folder, prefix in items:
    if args.only and item['id'] not in args.only:
        continue
    output = root / 'public/passports/twilight/assets/audio' / folder / f'{prefix}{item["id"]}.mp3'
    output.parent.mkdir(parents=True, exist_ok=True)
    voice = plan['voices'][item['voice']]
    body = {'text': item['narration'], 'model_id': plan['model'], 'voice_settings': plan['voiceSettings']}
    digest = hashlib.sha256(json.dumps({'body': body, 'voiceId': voice['id'], 'processing': processing}, sort_keys=True).encode()).hexdigest()
    if output.exists() and receipts.get(item['id'], {}).get('scriptHash') == digest:
        print('SKIP', item['id'], flush=True)
        continue
    if output.exists() and not args.replace:
        sys.exit(f'{output.name} has different content. Use --replace to archive and replace it.')
    url = f'https://api.elevenlabs.io/v1/text-to-speech/{voice["id"]}?output_format=mp3_44100_128'
    request = urllib.request.Request(url, data=json.dumps(body).encode(), headers={'xi-api-key': key, 'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(request, timeout=120) as response:
            audio = response.read()
            request_id = response.headers.get('request-id')
            content_type = response.headers.get('content-type', '')
        if 'audio' not in content_type or len(audio) < 1000:
            sys.exit(f'Invalid audio response for {item["id"]}')
        # Decode and check a candidate before atomically replacing any live file.
        with tempfile.TemporaryDirectory(dir=output.parent) as tmp:
            raw = Path(tmp) / 'raw.mp3'
            candidate = Path(tmp) / 'clip.mp3'
            raw.write_bytes(audio)
            subprocess.run(['ffmpeg', '-v', 'error', '-i', str(raw), '-af', processing, '-ar', '44100', '-b:a', '128k', str(candidate)], check=True)
            duration = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', str(candidate)], text=True))
            if not 0.3 <= duration <= 6:
                sys.exit(f'Review {item["id"]}: unexpected {duration:.2f}s duration. Live clip preserved.')
            if output.exists():
                old = receipts.get(item['id'], {})
                archive = root / 'docs/twilight/audio-history/clips' / old.get('scriptHash', 'untracked')
                archive.mkdir(parents=True, exist_ok=True)
                shutil.copy2(output, archive / output.name)
                (archive / f'{item["id"]}.json').write_text(json.dumps(old, indent=2) + '\n')
            candidate.replace(output)
        receipts[item['id']] = {'character': item['character'], 'voice': voice['name'], 'voiceId': voice['id'], 'model': plan['model'], 'voiceSettings': plan['voiceSettings'], 'processing': processing, 'scriptHash': digest, 'durationSeconds': round(duration, 2), 'bytes': output.stat().st_size, 'requestId': request_id}
        pending = receipt_path.with_suffix('.json.tmp')
        pending.write_text(json.dumps(receipts, indent=2) + '\n')
        pending.replace(receipt_path)
        print('OK', item['id'], round(duration, 2), 'seconds', flush=True)
    except urllib.error.HTTPError as e:
        # Only print the service's structured error, never request headers.
        sys.exit(f'ElevenLabs {e.code}: {e.read().decode()[:500]}')
