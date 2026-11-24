import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import worker,{validateSoftware} from '../worker/api.mjs';
const origin='https://inventory.example';
const license=(name,version='1')=>({nome:name,versao:version,licenca:'Anual',renovacao:'2027-01-10',responsavel:'admin@example.com'});
const account=(name,email)=>({name,email,password:'correct horse battery staple'});
function fixture(){
 const sql=new DatabaseSync(':memory:');sql.exec('PRAGMA foreign_keys=ON');sql.exec(readFileSync(new URL('../migrations/0001_initial.sql',import.meta.url),'utf8'));
 return {close:()=>sql.close(),prepare(query){const st=sql.prepare(query);const execute=(...params)=>({
 first:async()=>st.get(...params)??null,
 all:async()=>({results:st.all(...params)}),
 run:async()=>({meta:{changes:Number(st.run(...params).changes)}})
 });return {...execute(),bind:(...params)=>execute(...params)};}};
}
function request(db,path,method='GET',data,cookie,originHeader=true){
 const headers={};if(originHeader)headers.Origin=origin;if(cookie)headers.Cookie=cookie;if(data!==undefined)headers['Content-Type']='application/json';
 return worker.fetch(new Request(origin+path,{method,headers,...(data===undefined?{}:{body:JSON.stringify(data)})}),{DB:db,ASSETS:{fetch:()=>new Response('ok')}});
}
test('software validation and dates',()=>{
 assert.equal(validateSoftware(license('  Editor  ')).nome,'Editor');
 assert.equal(validateSoftware({...license('A'),renovacao:'2026-02-30'}),null);
 assert.equal(validateSoftware({...license('A'),responsavel:'not-an-email'}),null);
 assert.equal(validateSoftware({...license('A'),licenca:'Vitalícia',renovacao:'2026-01-01'}).renovacao,null);
});
test('registration, login, authorization, CRUD and session logout',async()=>{
 const db=fixture();try{
  assert.equal((await request(db,'/api/health')).status,200);
  const a=await request(db,'/api/auth/register','POST',account('Ana','ana@example.com'));assert.equal(a.status,201);
  const aCookie=a.headers.get('set-cookie').split(';')[0];assert.match(a.headers.get('set-cookie'),/HttpOnly; Secure; SameSite=Strict/);
  const b=await request(db,'/api/auth/register','POST',account('Bruno','bruno@example.com'));assert.equal(b.status,201);
  const bCookie=b.headers.get('set-cookie').split(';')[0];
  assert.equal((await request(db,'/api/auth/register','POST',account('Outro','ana@example.com'))).status,409);
  assert.equal((await request(db,'/api/auth/login','POST',{email:'ana@example.com',password:'correct horse battery staple'})).status,200);
  assert.equal((await request(db,'/api/auth/login','POST',{email:'ana@example.com',password:'incorrect password'})).status,401);
  assert.equal((await request(db,'/api/softwares')).status,401);
  assert.equal((await request(db,'/api/softwares','POST',license('No origin'),aCookie,false)).status,403);
  const added=await request(db,'/api/softwares','POST',license('Adobe'),aCookie);assert.equal(added.status,201);
  const id=(await added.json()).id;
  assert.equal((await request(db,'/api/softwares','POST',license('adobe'),aCookie)).status,409);
  assert.equal((await request(db,'/api/softwares','POST',{...license('Office'),licenca:'Vitalícia',renovacao:''},aCookie)).status,201);
  const list=(await (await request(db,'/api/softwares','GET',undefined,aCookie)).json()).items;
  assert.equal(list.length,2);assert.equal(list.find(x=>x.nome==='Office').renovacao,null);
  assert.equal((await (await request(db,'/api/softwares','GET',undefined,bCookie)).json()).items.length,0);
  assert.equal((await request(db,'/api/softwares/'+id,'PUT',license('Bad'),bCookie)).status,404);
  assert.equal((await request(db,'/api/softwares/'+id,'DELETE',undefined,bCookie)).status,404);
  assert.equal((await request(db,'/api/softwares/'+id,'PUT',license('Adobe Updated','2'),aCookie)).status,200);
  assert.equal((await request(db,'/api/softwares/'+id,'DELETE',undefined,aCookie)).status,200);
  assert.equal((await request(db,'/api/auth/logout','POST',undefined,aCookie)).status,200);
  assert.equal((await request(db,'/api/softwares','GET',undefined,aCookie)).status,401);
 }finally{db.close();}
});
test('frontend entry document contains controls',()=>{
 const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
 for(const id of ['auth-form','software-form','metrics','rows','search','export','import'])assert.ok(html.includes('id="'+id+'"'));
});
