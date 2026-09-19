#!/usr/bin/env python3
"""Stage expressive Twilight dialogue, then publish a fully validated set.

ELEVENLABS_API_KEY is read from the environment or --key-stdin, never saved.
Generate with --only <ids> for auditions; --publish installs all 36 clips only
when their current hashes have passed review-audio.py's transcript checks.
"""
import argparse,concurrent.futures,getpass,hashlib,json,os,pathlib,shutil,subprocess,sys,urllib.request,urllib.error
ROOT=pathlib.Path(__file__).resolve().parents[2]
PROCESSING='silenceremove=start_periods=1:start_duration=0.02:start_threshold=-55dB:start_silence=0.08,areverse,silenceremove=start_periods=1:start_duration=0.02:start_threshold=-55dB:start_silence=0.12,areverse,loudnorm=I=-18:TP=-1.5:LRA=11'
def sha(data):return hashlib.sha256(data).hexdigest()
def write_json(path,data):
 temp=path.with_suffix('.json.tmp');temp.write_text(json.dumps(data,indent=2)+'\n');temp.replace(path)
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--key-stdin',action='store_true');parser.add_argument('--only',nargs='+');parser.add_argument('--take',type=int);parser.add_argument('--workers',type=int,default=2);parser.add_argument('--stage',default='.e2e/voice-v3/candidates');parser.add_argument('--publish',action='store_true')
 args=parser.parse_args();stage=ROOT/args.stage;stage.mkdir(parents=True,exist_ok=True)
 plan=json.loads((ROOT/'docs/twilight/production.json').read_text());items=plan['badges']+plan['greetings']
 if plan['model']!='eleven_v3':raise SystemExit('Expected Eleven v3 production plan.')
 if args.only and set(args.only)-{i['id'] for i in items}:raise SystemExit('Unknown clip ID.')
 receipts_path=stage/'receipts.json';receipts=json.loads(receipts_path.read_text()) if receipts_path.exists() else {}
 def request_for(item,take):
  voice=plan['voices'][item['voice']]
  if not voice.get('id') or not voice.get('designHash'):raise ValueError('Create the designed voice first: '+item['voice'])
  if not item.get('synthesisText') or not item.get('performance',{}).get('tags'):raise ValueError('Missing performance: '+item['id'])
  body={'text':item['synthesisText'],'model_id':plan['model'],'voice_settings':plan['voiceSettings'],'seed':9192026+items.index(item)*10+take,'language_code':'en'}
  signature={'request':body,'voiceId':voice['id'],'castDesignHash':voice['designHash'],'processing':PROCESSING,'outputFormat':'mp3_44100_192'}
  return voice,body,sha(json.dumps(signature,sort_keys=True).encode())
 if args.publish:
  validation=json.loads((stage/'validation.json').read_text())
  if set(validation['clips'])!={i['id'] for i in items}:raise SystemExit('Validate the complete 36-clip set before publishing.')
  for item in items:
   r=receipts.get(item['id'],{});_,_,digest=request_for(item,r.get('take',1));file=stage/f'{item["id"]}.mp3';check=validation['clips'][item['id']]
   if r.get('scriptHash')!=digest or r.get('audioSha256')!=sha(file.read_bytes()) or check.get('audioSha256')!=r['audioSha256'] or not check.get('wordsMatch'):
    raise SystemExit('Regenerate or validate stale clip: '+item['id'])
  live_receipt_path=ROOT/'docs/twilight/audio-receipts.json';old=json.loads(live_receipt_path.read_text())
  for item in items:
   id=item['id'];greeting=id.startswith('greeting-');filename=f'{id if greeting else "badge-"+id}.mp3';folder='greetings' if greeting else 'badges'
   output=ROOT/'public/passports/twilight/assets/audio'/folder/filename
   if output.exists():
    archive=ROOT/'docs/twilight/audio-history/clips'/old.get(id,{}).get('scriptHash','untracked');archive.mkdir(parents=True,exist_ok=True)
    shutil.copy2(output,archive/filename);write_json(archive/f'{id}.json',old.get(id,{}))
   shutil.copy2(stage/f'{id}.mp3',output)
  write_json(live_receipt_path,{i['id']:receipts[i['id']] for i in items})
  print('PUBLISHED',len(items),'validated Eleven v3 clips. Bump passport.version before deploying.');return
 key=(getpass.getpass('ElevenLabs key: ') if sys.stdin.isatty() else sys.stdin.readline().strip()) if args.key_stdin else os.environ.get('ELEVENLABS_API_KEY')
 if not key:raise SystemExit('Set ELEVENLABS_API_KEY or use --key-stdin.')
 def generate(item):
  id=item['id'];take=args.take if args.take is not None else receipts.get(id,{}).get('take',1)
  voice,body,digest=request_for(item,take);output=stage/f'{id}.mp3'
  if output.exists() and receipts.get(id,{}).get('scriptHash')==digest and receipts[id].get('audioSha256')==sha(output.read_bytes()):
   print('SKIP',id,flush=True);return id,receipts[id]
  req=urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{voice["id"]}?output_format=mp3_44100_192',data=json.dumps(body).encode(),headers={'xi-api-key':key,'Content-Type':'application/json'})
  try:
   with urllib.request.urlopen(req,timeout=180) as r:
    raw=r.read();request_id=r.headers.get('request-id');content_type=r.headers.get('content-type','')
  except urllib.error.HTTPError as e:raise RuntimeError(f'ElevenLabs {e.code} for {id}: {e.read().decode()[:500]}')
  if 'audio' not in content_type or len(raw)<1000:raise ValueError('Invalid audio: '+id)
  takes=stage/'takes';takes.mkdir(exist_ok=True);source=takes/f'{id}-{take}-raw.mp3';source.write_bytes(raw)
  candidate=takes/f'{id}-{take}.mp3'
  subprocess.run(['ffmpeg','-v','error','-y','-i',str(source),'-af',PROCESSING,'-ar','44100','-b:a','192k',str(candidate)],check=True)
  duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',str(candidate)],text=True))
  if not 0.3<=duration<=8:raise ValueError(f'Review {id}: {duration:.2f}s, outside 0.3–8s; not selected.')
  shutil.copy2(candidate,output)
  receipt={'character':item['character'],'voice':voice['name'],'voiceId':voice['id'],'castDesignHash':voice['designHash'],'model':plan['model'],'voiceSettings':plan['voiceSettings'],'request':body,'performance':item['performance'],'spokenText':item['narration'],'processing':PROCESSING,'outputFormat':'mp3_44100_192','take':take,'scriptHash':digest,'audioSha256':sha(output.read_bytes()),'durationSeconds':round(duration,3),'bytes':output.stat().st_size,'requestId':request_id}
  print('STAGED',id,round(duration,2),'seconds',flush=True);return id,receipt
 selected=[i for i in items if not args.only or i['id'] in args.only]
 failed=[]
 with concurrent.futures.ThreadPoolExecutor(max_workers=max(1,min(args.workers,3))) as pool:
  jobs={pool.submit(generate,item):item['id'] for item in selected}
  for future in concurrent.futures.as_completed(jobs):
   try:
    id,receipt=future.result();receipts[id]=receipt;write_json(receipts_path,receipts)
   except Exception as error:failed.append(jobs[future]);print('FAILED',jobs[future],str(error),flush=True)
 if failed:raise SystemExit('Unpublished failures: '+', '.join(failed))
if __name__=='__main__':main()
