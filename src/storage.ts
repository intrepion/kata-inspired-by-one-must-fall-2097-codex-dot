export interface RecordData {version:1;wins:number;losses:number;muted:boolean}
export const KEY='rivet-circuit:v1';
const defaults=():RecordData=>({version:1,wins:0,losses:0,muted:false});
export interface Store {getItem(key:string):string|null;setItem(key:string,value:string):void}
export function load(store:Store):RecordData{try{const v:unknown=JSON.parse(store.getItem(KEY)??'null');if(typeof v==='object'&&v!==null&&'version'in v&&v.version===1&&'wins'in v&&'losses'in v&&'muted'in v&&typeof v.wins==='number'&&Number.isSafeInteger(v.wins)&&v.wins>=0&&typeof v.losses==='number'&&Number.isSafeInteger(v.losses)&&v.losses>=0&&typeof v.muted==='boolean')return v as RecordData;}catch{/* Unavailable storage has a safe default. */}return defaults();}
export function save(store:Store,record:RecordData):boolean{try{store.setItem(KEY,JSON.stringify(record));return true;}catch{return false;}}
