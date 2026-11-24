const $=id=>document.getElementById(id);
let items=[],account=null,register=false,editing=null;
function notice(message){$('notice').textContent=message;}
async function api(path,method='GET',data){
  const r=await fetch('/api/'+path,{method,credentials:'same-origin',...(data===undefined?{}:{headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})});
  const value=await r.json();if(!r.ok)throw new Error(value.error||'Falha na operação');return value;
}
function element(tag,value){const e=document.createElement(tag);e.textContent=value??'';return e;}
function dateKey(){const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');}
function status(i){if(i.licenca==='Vitalícia')return 'Vitalícia';const days=(Date.parse(i.renovacao)-Date.parse(dateKey()))/86400000;return days<0?'Vencida':days<=30?'A vencer':'Ativa';}
function dateLabel(v){return v?v.split('-').reverse().join('/'):'—';}
function render(){
  const counts=[['Total',items.length],['Ativas / vitalícias',items.filter(i=>['Ativa','Vitalícia'].includes(status(i))).length],['A vencer',items.filter(i=>status(i)==='A vencer').length],['Vencidas',items.filter(i=>status(i)==='Vencida').length]];
  $('metrics').replaceChildren(...counts.map(([label,n])=>{const d=element('div',label);d.className='metric';d.append(element('strong',n));return d;}));
  const q=$('search').value.toLocaleLowerCase('pt-BR'),f=$('filter').value;
  const visible=items.filter(i=>(!f||status(i)===f)&&[i.nome,i.versao,i.responsavel].some(v=>v.toLocaleLowerCase('pt-BR').includes(q))).sort((a,b)=>$('sort').value==='date'?(a.renovacao||'9999').localeCompare(b.renovacao||'9999'):a.nome.localeCompare(b.nome,'pt-BR'));
  $('rows').replaceChildren(...visible.map(i=>{const tr=element('tr');for(const v of [i.nome,i.versao,i.licenca,dateLabel(i.renovacao),i.responsavel])tr.append(element('td',v));const st=element('td',status(i));st.className='status '+(status(i)==='Vencida'?'expired':status(i)==='A vencer'?'soon':'active');tr.append(st);const actions=element('td');const edit=element('button','Editar'),del=element('button','Excluir');edit.onclick=()=>openEditor(i);del.onclick=async()=>{if(!confirm('Excluir '+i.nome+'?'))return;try{await api('softwares/'+i.id,'DELETE');await load();notice('Software excluído.');}catch(e){notice(e.message);}};actions.append(edit,del);tr.append(actions);return tr;}));
  $('empty').textContent=visible.length?'':'Nenhum software encontrado.';
  const soon=items.filter(i=>status(i)==='A vencer').sort((a,b)=>a.renovacao.localeCompare(b.renovacao));
  $('upcoming').replaceChildren(...(soon.length?soon.map(i=>element('li',i.nome+' — '+dateLabel(i.renovacao))):[element('li','Nenhuma renovação nos próximos 30 dias.')]));
}
async function load(){items=(await api('softwares')).items;render();}
async function showUser(u){account=u;$('auth').hidden=!!u;$('workspace').hidden=!u;$('account').textContent=u?.name||'';if(u)await load();else{items=[];render();}}
$('switch').onclick=()=>{register=!register;$('auth-title').textContent=register?'Criar conta':'Entrar';$('switch').textContent=register?'Já tenho conta':'Criar conta';$('name-label').hidden=!register;$('auth-form').elements.name.required=register;$('auth-form').elements.password.autocomplete=register?'new-password':'current-password';};
$('auth-form').onsubmit=async e=>{e.preventDefault();const form=e.currentTarget,button=form.querySelector('[type=submit]');button.disabled=true;try{const r=await api('auth/'+(register?'register':'login'),'POST',Object.fromEntries(new FormData(form)));form.reset();await showUser(r.user);notice('Bem-vindo!');}catch(e){notice(e.message);}finally{button.disabled=false;}};
$('logout').onclick=async()=>{try{await api('auth/logout','POST');await showUser(null);notice('Sessão encerrada.');}catch(e){notice(e.message);}};
const sf=$('software-form');
function syncDate(){const lifetime=sf.elements.licenca.value==='Vitalícia';$('date-label').hidden=lifetime;sf.elements.renovacao.required=!lifetime;sf.elements.renovacao.disabled=lifetime;}
function openEditor(i){editing=i?.id||null;sf.reset();$('editor-title').textContent=i?'Editar software':'Novo software';if(i){for(const key of ['nome','versao','licenca','renovacao','responsavel'])sf.elements[key].value=i[key]||'';}else sf.elements.responsavel.value=account?.email||'';syncDate();$('editor').showModal();}
$('new').onclick=()=>openEditor(null);$('cancel').onclick=()=>$('editor').close();sf.elements.licenca.onchange=syncDate;
sf.onsubmit=async e=>{e.preventDefault();const btn=sf.querySelector('[type=submit]');btn.disabled=true;try{await api(editing?'softwares/'+editing:'softwares',editing?'PUT':'POST',Object.fromEntries(new FormData(sf)));$('editor').close();await load();notice('Software salvo.');}catch(e){notice(e.message);}finally{btn.disabled=false;}};
for(const id of ['search','filter','sort'])$(id).addEventListener('input',render);
function download(name,type,data){const url=URL.createObjectURL(new Blob([data],{type}));const a=element('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function csv(v){let s=String(v??'');if(/^[\s]*[=+@-]/.test(s)||/^[\t\r\n]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}
$('export').onclick=()=>download('inventario.csv','text/csv;charset=utf-8','\ufeff'+[['Software','Versão','Licença','Renovação','Responsável','Status'],...items.map(i=>[i.nome,i.versao,i.licenca,i.renovacao,i.responsavel,status(i)])].map(row=>row.map(csv).join(';')).join('\r\n'));
$('backup').onclick=()=>download('inventario.json','application/json',JSON.stringify(items,null,2));
$('import').onclick=async()=>{let legacy;try{legacy=JSON.parse(localStorage.getItem('inventario')||'[]');if(!Array.isArray(legacy))throw Error();}catch{notice('Dados antigos inválidos.');return;}if(!legacy.length){notice('Não há registros antigos neste navegador.');return;}if(!confirm('Importar '+legacy.length+' registros para sua conta atual? Os originais serão preservados.'))return;let ok=0,errors=0;for(const row of legacy){try{await api('softwares','POST',row);ok++;}catch{errors++;}}try{await load();}catch(e){notice(e.message);return;}notice(ok+' importados; '+errors+' não importados (duplicados ou inválidos).');};
try{document.documentElement.classList.toggle('dark',localStorage.getItem('theme')==='dark');}catch{}
$('theme').onclick=()=>{const dark=document.documentElement.classList.toggle('dark');try{localStorage.setItem('theme',dark?'dark':'light');}catch{}};
api('me').then(r=>showUser(r.user)).catch(()=>showUser(null));
