#!/usr/bin/env python3
"""Design character voices with Eleven v3. Descriptions are sent to Voice Design.

Uses ELEVENLABS_API_KEY in process memory. Previews are staged for audition;
--save creates only the explicitly selected preview in the ElevenLabs account.
"""
import argparse,base64,hashlib,json,os,pathlib,urllib.request,urllib.error
root=pathlib.Path(__file__).resolve().parents[2]
parser=argparse.ArgumentParser();parser.add_argument('--only',nargs='+');parser.add_argument('--save',action='store_true');parser.add_argument('--preview',type=int,default=0)
args=parser.parse_args()
key=os.environ.get('ELEVENLABS_API_KEY')
if not key:raise SystemExit('Set ELEVENLABS_API_KEY in the environment.')
cast_path=root/'scripts/twilight/voice-cast.json';cast=json.loads(cast_path.read_text())
selected=args.only or list(cast)
if set(selected)-set(cast):raise SystemExit('Unknown cast member.')
out=root/'docs/twilight/voice-design';out.mkdir(parents=True,exist_ok=True)
def request(endpoint,body):
 req=urllib.request.Request('https://api.elevenlabs.io'+endpoint,data=json.dumps(body).encode(),headers={'xi-api-key':key,'Content-Type':'application/json'})
 try:
  with urllib.request.urlopen(req,timeout=180) as r:return json.load(r),r.headers.get('request-id')
 except urllib.error.HTTPError as e:raise SystemExit(f'ElevenLabs {e.code}: {e.read().decode()[:500]}')
for character in selected:
 voice=cast[character]
 body={'voice_description':voice['designDescription'],'model_id':'eleven_ttv_v3','text':voice['previewText'],'guidance_scale':5,'seed':240919+list(cast).index(character),'loudness':0.5}
 digest=hashlib.sha256(json.dumps(body,sort_keys=True).encode()).hexdigest()
 receipt_path=out/f'{character}.json'
 receipt=json.loads(receipt_path.read_text()) if receipt_path.exists() else {}
 if receipt.get('designHash')!=digest:
  result,request_id=request('/v1/text-to-voice/design?output_format=mp3_44100_192',body)
  previews=[]
  for i,preview in enumerate(result['previews']):
   path=out/f'{character}-preview-{i+1}.mp3';path.write_bytes(base64.b64decode(preview['audio_base_64']))
   previews.append({k:v for k,v in preview.items() if k!='audio_base_64'}|{'file':path.name})
  receipt={'character':character,'request':body,'designHash':digest,'requestId':request_id,'previews':previews}
  receipt_path.write_text(json.dumps(receipt,indent=2)+'\n')
  print('DESIGNED',character,len(previews),'previews',flush=True)
 else:print('REUSE design',character,flush=True)
 if args.save:
  if voice.get('designHash')==digest and voice.get('id') and voice.get('selectedPreview')==args.preview+1:
   print('REUSE saved voice',character,flush=True);continue
  preview=receipt['previews'][args.preview]
  create={'voice_name':voice['name'],'voice_description':voice['designDescription'],'generated_voice_id':preview['generated_voice_id'],'labels':{'language':'en','use_case':'characters','description':'Twilight party'}}
  saved,request_id=request('/v1/text-to-voice',create)
  voice.update({'id':saved['voice_id'],'designHash':digest,'selectedPreview':args.preview+1})
  receipt.update({'voiceId':saved['voice_id'],'selectedPreview':args.preview+1,'createRequestId':request_id})
  receipt_path.write_text(json.dumps(receipt,indent=2)+'\n');cast_path.write_text(json.dumps(cast,indent=2)+'\n')
  print('SAVED',character,voice['id'],flush=True)
