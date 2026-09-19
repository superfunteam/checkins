#!/usr/bin/env python3
"""Verify staged dialogue with Scribe v2; package a listening review separately.

Transcription verifies words, not emotional quality. This tool never marks a
performance as human-approved. Credentials remain in process memory.
"""
import argparse,concurrent.futures,hashlib,json,os,pathlib,re,subprocess,urllib.request,urllib.error,uuid,datetime
ROOT=pathlib.Path(__file__).resolve().parents[2]
def normalized(text):return ''.join(c for c in text.casefold() if c.isalnum())
def sha(data):return hashlib.sha256(data).hexdigest()
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--stage',default='.e2e/voice-v3/candidates');parser.add_argument('--only',nargs='+');parser.add_argument('--package',action='store_true')
 args=parser.parse_args();stage=ROOT/args.stage
 plan=json.loads((ROOT/'docs/twilight/production.json').read_text());items=plan['badges']+plan['greetings']
 receipts=json.loads((stage/'receipts.json').read_text());validation_path=stage/'validation.json'
 validation=json.loads(validation_path.read_text()) if validation_path.exists() else {'model':'scribe_v2','clips':{},'humanListeningApproved':False}
 selected=[i for i in items if not args.only or i['id'] in args.only]
 if args.only and set(args.only)-{i['id'] for i in items}:raise SystemExit('Unknown clip ID.')
 key=os.environ.get('ELEVENLABS_API_KEY')
 def check(item):
  id=item['id'];file=stage/f'{id}.mp3';data=file.read_bytes();digest=sha(data)
  prior=validation['clips'].get(id,{})
  if prior.get('audioSha256')==digest and prior.get('expected')==item['narration'] and prior.get('wordsMatch'):return id,prior
  if not key:raise ValueError('Set ELEVENLABS_API_KEY to transcribe unverified audio.')
  boundary=uuid.uuid4().hex;parts=[]
  for field,value in {'model_id':'scribe_v2','language_code':'en','tag_audio_events':'false','timestamps_granularity':'word','diarize':'false','no_verbatim':'false'}.items():
   parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{field}"\r\n\r\n{value}\r\n'.encode())
  parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="{id}.mp3"\r\nContent-Type: audio/mpeg\r\n\r\n'.encode()+data+b'\r\n');parts.append(f'--{boundary}--\r\n'.encode())
  req=urllib.request.Request('https://api.elevenlabs.io/v1/speech-to-text',data=b''.join(parts),headers={'xi-api-key':key,'Content-Type':'multipart/form-data; boundary='+boundary})
  try:
   with urllib.request.urlopen(req,timeout=180) as r:transcript=json.load(r);request_id=r.headers.get('request-id')
  except urllib.error.HTTPError as e:raise RuntimeError(f'Scribe {e.code}: {e.read().decode()[:500]}')
  text=transcript['text'];match=normalized(text)==normalized(item['narration'])
  result={'audioSha256':digest,'expected':item['narration'],'transcript':text,'wordsMatch':match,'words':transcript.get('words',[]),'requestId':request_id}
  print('WORDS MATCH' if match else 'REVIEW WORDS',id,repr(text),flush=True)
  return id,result
 with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
  for id,result in pool.map(check,selected):
   validation['clips'][id]=result
   validation_path.write_text(json.dumps(validation,indent=2)+'\n')
 failures=[i['id'] for i in selected if not validation['clips'][i['id']]['wordsMatch']]
 if failures:raise SystemExit('Regenerate or inspect: '+', '.join(failures))
 print('PASS',len(selected),'exact transcripts; emotional quality requires listening.',flush=True)
 if args.package:
  for i in items:
   check=validation['clips'].get(i['id'],{})
   digest=sha((stage/f'{i["id"]}.mp3').read_bytes())
   if not check.get('wordsMatch') or check.get('expected')!=i['narration'] or check.get('audioSha256')!=digest or receipts[i['id']]['audioSha256']!=digest:
    raise SystemExit('Full review requires current verified clips: '+i['id'])
  out=ROOT/'docs/twilight'
  def montage(ids,filename):
   silence=stage/'review-gap.wav'
   subprocess.run(['ffmpeg','-v','error','-y','-f','lavfi','-i','anullsrc=r=44100:cl=mono','-t','0.55',str(silence)],check=True)
   concat=[];timeline=[];position=0
   for id in ids:
    wav=stage/(id+'-review.wav')
    subprocess.run(['ffmpeg','-v','error','-y','-i',str(stage/f'{id}.mp3'),'-ac','1','-ar','44100',str(wav)],check=True)
    duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(wav)],text=True))
    concat.extend([f"file '{wav}'",f"file '{silence}'"]);timeline.append({'id':id,'character':receipts[id]['character'],'start':round(position,3),'end':round(position+duration,3)});position+=duration+0.55
   listing=stage/(filename+'.txt');listing.write_text('\n'.join(concat)+'\n')
   subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',str(listing),'-b:a','192k',str(out/(filename+'.mp3'))],check=True)
   (out/(filename+'-timeline.json')).write_text(json.dumps(timeline,indent=2)+'\n')
  montage([i['id'] for i in items],'voice-review-all')
  montage(['skin-of-a-killer','volterra','the-tent','breaking-dawn-1','secret-scenes','lunch','cullen-origins','the-witnesses','first-sight'],'voice-sampler')
  (out/'voice-review-transcript.json').write_text(json.dumps(validation,indent=2)+'\n')
  durations=[receipts[i['id']]['durationSeconds'] for i in items]
  summary={'clips':len(items),'voices':len(plan['voices']),'model':plan['model'],'totalSeconds':round(sum(durations),3),'minSeconds':min(durations),'maxSeconds':max(durations),'medianSeconds':sorted(durations)[len(durations)//2],'previousTotalSeconds':52.95,'transcript':'All 36 clips matched after ignoring case, punctuation and spaces.','decodedAll':True,'hashesMatchAll':all(sha((stage/f'{i["id"]}.mp3').read_bytes())==receipts[i['id']]['audioSha256'] for i in items),'humanListeningApproved':False,'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat()}
  (out/'audio-validation.json').write_text(json.dumps(summary,indent=2)+'\n')
  print('PACKAGED complete set and nine-character sampler.',flush=True)
if __name__=='__main__':main()
