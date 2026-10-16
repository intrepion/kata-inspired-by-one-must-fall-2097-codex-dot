import './style.css';
import {createGame,neutral,step,type Input} from './engine';
import {render} from './render';
import {load,save,type Store} from './storage';
const el=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
const canvas=el<HTMLCanvasElement>('game');const ctx=canvas.getContext('2d')!;
const store:Store={getItem:k=>window.localStorage.getItem(k),setItem:(k,v)=>window.localStorage.setItem(k,v)};
const record=load(store);let game=createGame(),started=false,paused=false,recorded=false;
const held=new Set<string>();let audio:AudioContext|undefined;let effect={label:'',until:0};
function updateRecord(){el('record').textContent=`PILOT RECORD ${String(record.wins).padStart(2,'0')}–${String(record.losses).padStart(2,'0')}`;el('sound').textContent=record.muted?'SOUND OFF':'SOUND ON';}
updateRecord();
function tone(kind:string){if(record.muted)return;try{audio??=new AudioContext();void audio.resume();const o=audio.createOscillator(),gain=audio.createGain();o.type=kind==='block'?'triangle':'sawtooth';o.frequency.setValueAtTime(kind==='special'?220:kind==='block'?480:110,audio.currentTime);o.frequency.exponentialRampToValueAtTime(35,audio.currentTime+.15);gain.gain.setValueAtTime(.07,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.18);o.connect(gain).connect(audio.destination);o.start();o.stop(audio.currentTime+.2);}catch{/* Audio is optional. */}}
function launch(){game=createGame();started=true;paused=false;recorded=false;held.clear();el('overlay').hidden=true;el('pause').textContent='PAUSE [ESC]';canvas.focus();tone('special');}
el('engage').onclick=()=>{if(paused){togglePause();return;}launch();};
el('sound').onclick=()=>{record.muted=!record.muted;save(store,record);updateRecord();canvas.focus();};
function togglePause(){if(!started||game.phase==='match')return;paused=!paused;held.clear();el('overlay').hidden=!paused;el('overlay-title').textContent='Pilot link paused.';el('overlay-copy').textContent='Your machine is holding position.';el('engage').textContent='RESUME LINK ↗';el('pause').textContent=paused?'RESUME [ESC]':'PAUSE [ESC]';if(!paused)canvas.focus();}
el('pause').onclick=togglePause;canvas.onclick=()=>canvas.focus();
const keys=new Set(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyW','KeyA','KeyS','KeyD','KeyJ','KeyK','Enter','ShiftRight','Escape']);
window.addEventListener('keydown',e=>{if(!keys.has(e.code))return;if(e.target instanceof HTMLButtonElement)return;e.preventDefault();if(e.repeat)return;if(e.code==='Escape'){togglePause();return;}held.add(e.code);});
window.addEventListener('keyup',e=>held.delete(e.code));window.addEventListener('blur',()=>{held.clear();if(started&&!paused&&game.phase!=='match')togglePause();});
function inputs():Input{const i=neutral();const left=held.has('ArrowLeft')||held.has('KeyA'),right=held.has('ArrowRight')||held.has('KeyD');i.x=left===right?0:left?-1:1;i.up=held.has('ArrowUp')||held.has('KeyW');i.down=held.has('ArrowDown')||held.has('KeyS');i.punch=held.has('KeyJ')||held.has('Enter');i.kick=held.has('KeyK')||held.has('ShiftRight');return i;}
let previous=performance.now(),accumulator=0;
function frame(now:number){accumulator+=Math.min(100,now-previous);previous=now;
 while(accumulator>=1000/60){accumulator-=1000/60;if(started&&!paused){step(game,inputs());for(const e of game.events){tone(e.kind);effect={label:e.label,until:now+800};if(e.kind==='special')el('motion').textContent='MOTION VERIFIED / ARC DRIVE';}if(game.phase==='match'&&!recorded){recorded=true;if(game.winner===0)record.wins++;else record.losses++;const saved=save(store,record);updateRecord();el('overlay').hidden=false;el('overlay-title').textContent=game.winner===0?'Circuit conquered.':'Machine down. Pilot ready.';el('overlay-copy').textContent=`${game.message} · ${game.score[0]}–${game.score[1]} · ${saved?'Record saved locally.':'Storage unavailable; record is session-only.'}`;el('engage').textContent='REMATCH ↗';}}}
 render(ctx,game,paused);el('status').textContent=!started?'AWAITING PILOT':paused?'LINK PAUSED':game.phase==='match'?game.message:now<effect.until?effect.label:`ROUND ${game.round} / ${game.phase==='fight'?'COMBAT ACTIVE':'RESETTING'}`;
 requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
