// Native Cloudflare Worker API. No framework; all inventory access is account-scoped.
const encoder = new TextEncoder();
const hex = bytes => [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2,'0')).join('');
const random = () => hex(crypto.getRandomValues(new Uint8Array(32)));
const digest = async s => hex(await crypto.subtle.digest('SHA-256', encoder.encode(s)));
const json = (data,status=200,headers={}) => new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
const fail = (message,status=400) => json({error:message},status);
const emailOK = s => typeof s==='string' && s.length<=254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const textOK = (s,max) => typeof s==='string' && s.trim().length>0 && s.trim().length<=max;
const passwordOK = s => typeof s==='string' && s.length>=12 && s.length<=128;
const cookie = (value,maxAge) => '__Host-inventory='+value+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age='+maxAge;
async function passwordHash(password,salt=random()){
  const key=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);
  const hash=hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:encoder.encode(salt),iterations:100000},key,256));
  return salt+':'+hash;
}
function equal(a,b){if(a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;}
async function body(req){
  if(!req.headers.get('content-type')?.startsWith('application/json'))throw new Error('JSON obrigatório');
  const reader=req.body?.getReader();if(!reader)throw new Error('Corpo obrigatório');
  let size=0;const chunks=[];
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>16384){await reader.cancel();throw new Error('Corpo muito grande');}chunks.push(value);}
  const all=new Uint8Array(size);let offset=0;for(const c of chunks){all.set(c,offset);offset+=c.length;}
  const v=JSON.parse(new TextDecoder().decode(all));if(!v||typeof v!=='object'||Array.isArray(v))throw new Error('JSON inválido');return v;
}
async function user(req,db){
  const token=req.headers.get('cookie')?.match(/(?:^|;\s*)__Host-inventory=([a-f0-9]{64})(?:;|$)/)?.[1];
  if(!token)return null;
  return db.prepare('SELECT u.id,u.name,u.email FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>?').bind(await digest(token),Date.now()).first();
}
async function session(db,id){
  const token=random();
  await db.prepare('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)').bind(await digest(token),id,Date.now()+86400000*7).run();
  return cookie(token,604800);
}
export function validateSoftware(v){
  if(!textOK(v.nome,160)||!textOK(v.versao,80)||!emailOK(v.responsavel)||!['Trial','Anual','Vitalícia'].includes(v.licenca))return null;
  let renovacao=null;
  if(v.licenca!=='Vitalícia'){
    if(typeof v.renovacao!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v.renovacao))return null;
    const d=new Date(v.renovacao+'T00:00:00Z');
    if(!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==v.renovacao)return null;
    renovacao=v.renovacao;
  }
  const nome=v.nome.trim(),versao=v.versao.trim();
  return {nome,versao,licenca:v.licenca,renovacao,responsavel:v.responsavel.trim(),nome_key:nome.toLocaleLowerCase('pt-BR'),versao_key:versao.toLocaleLowerCase('pt-BR')};
}
export default {async fetch(req,env){
  const url=new URL(req.url),path=url.pathname,method=req.method;
  if(!path.startsWith('/api/'))return env.ASSETS?env.ASSETS.fetch(req):new Response('Not found',{status:404});
  if(!env.DB)return fail('Banco indisponível',503);
  const db=env.DB;
  if(!['GET','HEAD'].includes(method)&&req.headers.get('Origin')!==url.origin)return fail('Origem não autorizada',403);
  try{
    if(path==='/api/health'&&method==='GET'){await db.prepare('SELECT 1').first();return json({status:'ok'});}
    if(path==='/api/auth/register'&&method==='POST'){
      const v=await body(req);if(!textOK(v.name,120)||!emailOK(v.email)||!passwordOK(v.password))return fail('Informe nome, e-mail e senha de 12 a 128 caracteres.');
      const id=crypto.randomUUID(),email=v.email.trim().toLowerCase(),name=v.name.trim();
      const result=await db.prepare('INSERT INTO users(id,name,email,password_hash) VALUES(?,?,?,?) ON CONFLICT(email) DO NOTHING').bind(id,name,email,await passwordHash(v.password)).run();
      if(!result.meta.changes)return fail('Não foi possível cadastrar esta conta.',409);
      return json({user:{id,name,email}},201,{'Set-Cookie':await session(db,id)});
    }
    if(path==='/api/auth/login'&&method==='POST'){
      const v=await body(req);if(!emailOK(v.email)||!passwordOK(v.password))return fail('Credenciais inválidas',401);
      const u=await db.prepare('SELECT id,name,email,password_hash FROM users WHERE email=?').bind(v.email.trim().toLowerCase()).first();
      const salt=u?.password_hash.split(':')[0]||'0'.repeat(64);
      const calculated=await passwordHash(v.password,salt);
      if(!u||!equal(calculated,u.password_hash))return fail('Credenciais inválidas',401);
      return json({user:{id:u.id,name:u.name,email:u.email}},200,{'Set-Cookie':await session(db,u.id)});
    }
    if(path==='/api/auth/logout'&&method==='POST'){
      const token=req.headers.get('cookie')?.match(/(?:^|;\s*)__Host-inventory=([a-f0-9]{64})(?:;|$)/)?.[1];
      if(token)await db.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await digest(token)).run();
      return json({ok:true},200,{'Set-Cookie':cookie('',0)});
    }
    const u=await user(req,db);if(!u)return fail('Entre na sua conta',401);
    if(path==='/api/me'&&method==='GET')return json({user:u});
    if(path==='/api/softwares'&&method==='GET'){
      const {results}=await db.prepare('SELECT id,nome,versao,licenca,renovacao,responsavel,created_at,updated_at FROM softwares WHERE user_id=? ORDER BY nome_key,versao_key').bind(u.id).all();
      return json({items:results});
    }
    const match=path.match(/^\/api\/softwares\/([a-f0-9-]{36})$/);
    if((path==='/api/softwares'&&method==='POST')||(match&&method==='PUT')){
      const v=validateSoftware(await body(req));if(!v)return fail('Verifique os dados do software.');
      const values=[v.nome,v.versao,v.licenca,v.renovacao,v.responsavel,v.nome_key,v.versao_key];
      try{
        if(method==='POST'){
          const id=crypto.randomUUID();
          const r=await db.prepare('INSERT INTO softwares(id,user_id,nome,versao,licenca,renovacao,responsavel,nome_key,versao_key) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(user_id,nome_key,versao_key) DO NOTHING').bind(id,u.id,...values).run();
          return r.meta.changes?json({id},201):fail('Software e versão já cadastrados',409);
        }
        const r=await db.prepare("UPDATE softwares SET nome=?,versao=?,licenca=?,renovacao=?,responsavel=?,nome_key=?,versao_key=?,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=? AND user_id=?").bind(...values,match[1],u.id).run();
        return r.meta.changes?json({ok:true}):fail('Software não encontrado',404);
      }catch(e){if(String(e).includes('UNIQUE constraint'))return fail('Software e versão já cadastrados',409);throw e;}
    }
    if(match&&method==='DELETE'){
      const r=await db.prepare('DELETE FROM softwares WHERE id=? AND user_id=?').bind(match[1],u.id).run();
      return r.meta.changes?json({ok:true}):fail('Software não encontrado',404);
    }
    return fail('Rota não encontrada',404);
  }catch(e){if(e instanceof SyntaxError||['JSON obrigatório','Corpo obrigatório','Corpo muito grande','JSON inválido'].includes(e.message))return fail('Requisição inválida');console.error('API error',e.name);return fail('Erro interno',500);}
}};
