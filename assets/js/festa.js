/* Festa & Folia: seletor de temas, status de horário e pedido de balões (texto para copiar / ligar / e-mail).
   Não há WhatsApp confirmado da loja: contato por telefone (47) 3332-8605. Fogos: só informação, sem pedido. */
(function(){
  var NOMES={aniversario:'Aniversário',junina:'Festa junina',confeitaria:'Confeitaria',baloes:'Balões',brincadeira:'Brinquedos e fantasias'};
  var painel=document.getElementById('painel-temas'), nome=document.getElementById('tema-nome');
  var chips=document.querySelectorAll('.chip');
  function escolhe(t,rola){
    document.body.setAttribute('data-tema',t); painel.setAttribute('data-tema',t); nome.textContent=NOMES[t];
    chips.forEach(function(c){c.setAttribute('aria-pressed',String(c.dataset.tema===t));});
    painel.querySelectorAll('.painel').forEach(function(p){p.hidden=p.dataset.painel!==t;});
    if(rola){painel.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});painel.focus({preventScroll:true});}
  }
  chips.forEach(function(c){c.addEventListener('click',function(){escolhe(c.dataset.tema,true);});});
  escolhe('aniversario',false);

  var st=document.getElementById('status');
  function status(){
    var p={};new Intl.DateTimeFormat('en-US',{timeZone:'America/Sao_Paulo',weekday:'short',hour:'numeric',minute:'numeric',hourCycle:'h23'}).formatToParts(new Date()).forEach(function(x){p[x.type]=x.value;});
    var m=(+p.hour)*60+(+p.minute), d=p.weekday, aberto=false, t;
    if(['Mon','Tue','Wed','Thu','Fri'].indexOf(d)>=0&&m>=510&&m<1080){aberto=true;t='Aberto agora · até 18h';}
    else if(d==='Sat'&&m>=510&&m<720){aberto=true;t='Aberto agora · até 12h';}
    else t='Seg a sex até 18h · sáb até 12h';
    st.textContent=t; st.setAttribute('data-aberto',aberto?'sim':'nao');
  }
  if(st){status();setInterval(status,60000);}

  var f=document.getElementById('bal'); if(!f) return;
  var caixa=document.getElementById('b-erros'), saida=document.getElementById('b-saida'), pedido=document.getElementById('pedido');
  var el=function(id){return document.getElementById(id);};
  function hoje(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
  el('b-data').min=hoje();
  var C=['b-nome','b-data','b-hora','b-qtd','b-texto'];
  function valida(){
    var e={};
    if(!el('b-nome').value.trim())e['b-nome']='Informe seu nome.';
    var dv=el('b-data').value, dia=dv?new Date(dv+'T12:00:00').getDay():-1;
    if(!dv)e['b-data']='Escolha a data de retirada.';
    else if(dv<hoje())e['b-data']='Escolha uma data a partir de hoje.';
    else if(dia===0)e['b-data']='Aos domingos não há retirada. Escolha de segunda a sábado.';
    var h=el('b-hora').value;
    if(!h)e['b-hora']='Informe o horário de retirada.';
    else if(dia>0){var mm=(+h.slice(0,2))*60+(+h.slice(3,5)), fim=dia===6?720:1080;
      if(mm<510||mm>=fim)e['b-hora']=dia===6?'Sábado: entre 8h30 e 12h.':'Segunda a sexta: entre 8h30 e 18h.';}
    var q=Number(el('b-qtd').value); if(!el('b-qtd').value||!Number.isInteger(q)||q<1)e['b-qtd']='Informe a quantidade (1 ou mais).';
    if(!el('b-texto').value.trim())e['b-texto']='Escreva o texto do balão.';
    return e;
  }
  function mostra(e,foca){
    var itens=[];
    C.forEach(function(id){var x=e[id],er=el(id+'-erro');
      if(x)el(id).setAttribute('aria-invalid','true');else el(id).removeAttribute('aria-invalid');
      er.hidden=!x;er.textContent=x||'';if(x)itens.push('<li><a href="#'+id+'">'+x+'</a></li>');});
    if(!itens.length){caixa.hidden=true;return;}
    caixa.innerHTML='<p>Confira o pedido:</p><ul>'+itens.join('')+'</ul>';caixa.hidden=false;
    caixa.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(ev){ev.preventDefault();el(a.getAttribute('href').slice(1)).focus();});});
    if(foca)caixa.focus();
  }
  f.addEventListener('submit',function(ev){
    ev.preventDefault(); var e=valida(); mostra(e,true); if(Object.keys(e).length)return;
    var d=el('b-data').value.split('-');
    var txt='Pedido de balões personalizados\nNome: '+el('b-nome').value.trim()+'\nRetirada: '+d[2]+'/'+d[1]+'/'+d[0]+' às '+el('b-hora').value.replace(':','h')+
      '\nQuantidade: '+Number(el('b-qtd').value)+'\nTexto do balão: '+el('b-texto').value.trim()+'\nCores: '+(el('b-cores').value.trim()||'a combinar')+
      '\n(A encomenda só vale depois da confirmação da loja.)';
    saida.value=txt; pedido.hidden=false; el('copiado').textContent='';
    el('b-email').href='mailto:adm.festaefolia@gmail.com?subject='+encodeURIComponent('Pedido de balões personalizados')+'&body='+encodeURIComponent(txt);
    pedido.focus();
  });
  f.addEventListener('input',function(){if(!caixa.hidden)mostra(valida(),false);});
  el('copiar').addEventListener('click',function(){
    var aviso=el('copiado');
    function ok(){aviso.textContent='Texto copiado. Agora é só ligar e ler para a loja.';}
    function falha(){aviso.textContent='Não deu para copiar automaticamente: selecione o texto acima e copie.';}
    saida.focus();saida.select();
    var feito=false;try{feito=document.execCommand('copy');}catch(e){}
    if(feito)ok();else if(navigator.clipboard)navigator.clipboard.writeText(saida.value).then(ok,falha);else falha();
  });
})();
