/* Human IA Soluciones: the small scripts of the site (7 Nov 2026). No library, no cookie, nothing stored, nothing sent.
   1. the two-minute quiz on Soluciones (ported from the crosslandai.com quiz; same questions, same points, same four results)
   2. "Copiar la dirección" on Empiece
   3. the factory film in a dialog on Nuestro trabajo
   4. the mobile menu closes when a link in it is chosen */
(function(){
"use strict";
var D=document;
function still(){return !!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)}

/* 1. quiz (prototype 7 Nov 18:45: no score; the first question asks if they want a course or training; the answers pick the service) */
(function(){
var R=D.getElementById('qz'),W=D.getElementById('qz-ow');if(!R||!W)return;
var T;try{T=JSON.parse(R.querySelector('.qz-strings').textContent)}catch(e){return}
var B=W.querySelector('.qz-open'),LAD=D.querySelector('#escalera .lad'),F=R.querySelector('.qz-f'),
ALL=[].slice.call(R.querySelectorAll('.qz-s')),S=[ALL[0]],N=1,RES=R.querySelector('.qz-r'),LV=[].slice.call(R.querySelectorAll('.qz-lv')),
BACK=R.querySelector('.qz-back'),MSG=R.querySelector('.qz-msg'),BAR=R.querySelector('.qz-bar i'),LIVE=R.querySelector('.qz-live'),
MAIL=R.querySelector('.qz-mail'),CS=R.querySelector('.qz-cs'),INTRO=R.querySelector('.qz-intro'),cur=0,ptr=0,tok=0,copyText='',QN=4;
function each(sel,f){[].forEach.call(R.querySelectorAll(sel),f)}
function fill(s,o){return s.replace(/\{(\w+)\}/g,function(m,k){return o[k]})}
function into(){var r=R.getBoundingClientRect();if(r.top<0||r.top>Math.max(140,innerHeight*0.2))R.scrollIntoView({behavior:still()?'auto':'smooth',block:'start'})}
function focusH(h){try{h.focus({preventScroll:true})}catch(e){h.focus()}}
function mark(s){[].forEach.call(s.querySelectorAll('.qz-a'),function(l){l.classList.toggle('on',l.querySelector('input').checked)})}
function picked(i){return S[i]&&S[i].querySelector('input:checked')}
function path(){var c=ALL[0].querySelector('input:checked');return c?c.value:''}
function active(){var p=path();S=ALL.filter(function(s,i){return i===0||(p&&s.getAttribute('data-path')===p)});N=S.length}
function show(i){
active();cur=i;tok++;MSG.textContent='';var res=i>=N&&N>1;F.hidden=res;RES.hidden=!res;INTRO.hidden=res;R.classList.toggle('qz-res',res);
if(res){result();return}
ALL.forEach(function(s){s.hidden=S[i]!==s});BACK.hidden=i===0;BAR.style.width=((i+1)/QN*100)+'%';
into();focusH(S[i].querySelector('.qz-q'));
}
function next(){var c=picked(cur);if(!c){MSG.textContent=T.pick;var f=S[cur].querySelector('input');if(f)f.focus();return}show(cur+1)}
function decide(){
var p=path(),v={},qa=[],ans=[];
S.forEach(function(s){var c=s.querySelector('input:checked'),at=c?c.parentNode.querySelector('.qz-at').textContent:'-';
v[s.getAttribute('data-k')]=c?c.value:'';qa.push([s.querySelector('.qz-qt').textContent,at]);ans.push(at)});
var key=p==='learn'?(v.how==='vivo'?'capacitacion':'cursos'):({auto:'automatizacion',soft:'software',datos:'datos',construya:'construya'}[v.goal]||'automatizacion');
var first=p==='learn'?T.level[v.level]:T.clarity[v.clarity];
return {key:key,first:first||'',qa:qa,ans:ans}}
function result(){
var d=decide(),el=null;LV.forEach(function(x){var on=x.getAttribute('data-key')===d.key;x.hidden=!on;if(on)el=x});
var ul=el.querySelector('.qz-why-l');ul.textContent='';
d.ans.forEach(function(a){var li=D.createElement('li');li.textContent=a;ul.appendChild(li)});
el.querySelector('.qz-first').textContent=d.first;el.querySelector('.qz-first').insertAdjacentElement('afterend',R.querySelector('.qz-callbox'));
var o={name:el.getAttribute('data-name')},L=[T.hello,'',T.intro,''];
d.qa.forEach(function(x,i){L.push((i+1)+'. '+x[0]);L.push('   '+x[1])});
L.push('',fill(T.rec,o),d.first,'',T.ask,T.company+' ',T.when+' ','',T.bye);
var subj=fill(T.subject,o);
MAIL.setAttribute('href','mailto:'+T.to+'?subject='+encodeURIComponent(subj)+'&body='+encodeURIComponent(L.join('\r\n')));
copyText=subj+'\n\n'+L.join('\n');CS.textContent='';LIVE.textContent='';
var msg=fill(T.live,o);setTimeout(function(){LIVE.textContent=msg},80);
var k=RES.querySelector('.qz-k');k.scrollIntoView({behavior:still()?'auto':'smooth',block:'start'});focusH(el.querySelector('.qz-rh'));
}
function open(){W.hidden=true;LAD.hidden=true;R.hidden=false;show(cur)}
function close(){R.hidden=true;LAD.hidden=false;W.hidden=false;B.focus();var r=B.getBoundingClientRect();if(r.top<0||r.bottom>innerHeight)B.scrollIntoView({block:'center'})}
W.hidden=false;
B.addEventListener('click',open);
/* the Home's quiz button and any link to #cuestionario open the first question directly (grade 8 Nov, item 4) */
function direct(){if(location.hash==='#cuestionario'&&R.hidden)open()}
direct();addEventListener('hashchange',direct);
each('.qz-exit',function(x){x.addEventListener('click',close)});
BACK.addEventListener('click',function(){if(cur>0)show(cur-1)});
R.querySelector('.qz-rback').addEventListener('click',function(){active();show(N-1)});
R.querySelector('.qz-again').addEventListener('click',function(){each('.qz-f input',function(x){x.checked=false});ALL.forEach(mark);show(0)});
F.addEventListener('submit',function(e){e.preventDefault();next()});
F.addEventListener('change',function(e){var s=e.target.closest&&e.target.closest('.qz-s');
if(s===ALL[0]){var p=path();ALL.forEach(function(x,i){if(i&&x.getAttribute('data-path')!==p){[].forEach.call(x.querySelectorAll('input'),function(r){r.checked=false});mark(x)}});active()}
if(s)mark(s);if(picked(cur))MSG.textContent=''});
F.addEventListener('pointerdown',function(){ptr=Date.now()},true);
F.addEventListener('keydown',function(){ptr=0},true);
/* a tap or click on an answer moves on by itself; the keyboard (arrows, Space) only chooses, and Enter or Next moves on */
F.addEventListener('click',function(e){var t=e.target;if(!t||t.type!=='radio'||!ptr||Date.now()-ptr>1500)return;ptr=0;
var i=cur,k=tok;setTimeout(function(){active();if(cur===i&&tok===k&&picked(i))show(i+1)},160)});
R.addEventListener('keydown',function(e){if(e.key==='Escape'){e.preventDefault();close()}});
R.querySelector('.qz-copy').addEventListener('click',function(){var s=copyText;
function fb(){var ta=D.createElement('textarea'),ok=false;ta.value=s;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.top='0';ta.style.left='0';ta.style.opacity='0';
D.body.appendChild(ta);ta.select();try{ok=D.execCommand('copy')}catch(x){}D.body.removeChild(ta);CS.textContent=ok?T.copied:T.nocopy}
if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(s).then(function(){CS.textContent=T.copied},fb);else fb()});
})();

/* 2. copy the address */
(function(){
var b=D.querySelector('[data-copy]');if(!b)return;
var m=D.querySelector('[data-copy-msg]');
b.addEventListener('click',function(){
var s=b.getAttribute('data-copy');
function ok(t){if(m)m.textContent=t}
function fb(){var ta=D.createElement('textarea'),r=false;ta.value=s;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.opacity='0';D.body.appendChild(ta);ta.select();try{r=D.execCommand('copy')}catch(x){}D.body.removeChild(ta);ok(r?'Dirección copiada.':'No se pudo copiar. Escríbala a mano: '+s)}
if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(s).then(function(){ok('Dirección copiada.')},fb);else fb();
});
})();

/* 3. the factory film */
(function(){
var dlg=D.getElementById('wv-dlg'),open=D.querySelector('[data-film]');if(!dlg||!open)return;
var v=dlg.querySelector('video'),x=dlg.querySelector('.wv-x');
open.addEventListener('click',function(){
if(dlg.showModal){dlg.showModal();v.preload='auto'}else{dlg.setAttribute('open','')}
});
function end(){try{v.pause()}catch(e){}if(dlg.close)dlg.close();else dlg.removeAttribute('open');open.focus()}
x.addEventListener('click',end);
dlg.addEventListener('close',function(){try{v.pause()}catch(e){}});
})();

/* 4. the mobile menu */
(function(){
var d=D.querySelector('details.mnav');if(!d)return;
d.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('.mpanel a'))d.removeAttribute('open')});
D.addEventListener('keydown',function(e){if(e.key==='Escape'&&d.hasAttribute('open')){d.removeAttribute('open');d.querySelector('summary').focus()}});
})();
})();

/* the return calculator: the numbers are the visitor's own, computed here, never stored and never sent */
(function(){
var F=document.getElementById('roi-calc');if(!F)return;F.hidden=false;
var N=document.getElementById('roi-n'),H=document.getElementById('roi-h'),C=document.getElementById('roi-c'),P=document.getElementById('roi-p'),O=F.querySelector('.roi-out');
var fmt=new Intl.NumberFormat('es-CO',{maximumFractionDigits:1});
function peso(v){return '$ '+new Intl.NumberFormat('es-CO',{maximumFractionDigits:0}).format(Math.round(v))}
function num(e){var v=parseFloat(String(e.value).replace(',','.'));return isFinite(v)&&v>=0?v:NaN}
function show(){
var n=num(N),h=num(H),c=num(C),p=num(P);
if(isNaN(n)||isNaN(h)||isNaN(c)){O.innerHTML='<p class="roi-empty">Escriba sus números y verá la cuenta aquí.</p>';return}
var wh=n*h,wc=wh*c,yc=wc*52,out='<p>Hoy esa tarea le cuesta <b>'+peso(wc)+'</b> por semana, o <b>'+peso(yc)+'</b> al año (52 semanas): '+fmt.format(wh)+' horas por semana.</p>';
if(!isNaN(p)&&p>0){var q=Math.min(p,100);out+='<p>Con la parte que usted indicó (<b>'+fmt.format(q)+' %</b>), recuperaría <b>'+fmt.format(wh*q/100)+' horas</b> por semana, o <b>'+peso(yc*q/100)+'</b> al año.</p>'}
O.innerHTML=out}
F.addEventListener('input',show);F.addEventListener('submit',function(e){e.preventDefault()});
})();
