(function(){
'use strict';

var STEPS=[
  {key:'country',title:'Из какой страны привезти автомобиль?',opts:['Китай','Южная Корея','Япония']},
  {key:'type',title:'Какой автомобиль нужен?',opts:['Седан','Кроссовер','Внедорожник','Минивэн','Электромобиль','Пока не определился']},
  {key:'budget',title:'Какой бюджет на автомобиль?',opts:['до 2 млн ₽','2–4 млн ₽','4–7 млн ₽','от 7 млн ₽','Пока не знаю']}
];
var CONTACT=STEPS.length;      // шаг с контактами
var DONE=STEPS.length+1;       // экран «заявка принята»
var TOTAL=STEPS.length+1;

var state={country:'',type:'',budget:'',name:'',phone:'',via:'Telegram'};
var step=0;

function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}

/* ---------- расчётный лист ---------- */
function val(v){return v?'<dd>'+esc(v)+'</dd>':'<dd class="empty">выберите в расчёте</dd>';}
function sheetHTML(s,final){
  return ''+
  '<div class="sheet-head"><div><h3>Расчёт под ключ</h3><p>'+(final?'Менеджер пришлёт расчёт в '+esc(s.via)+'.':'Заполняется по вашим ответам.')+'</p></div>'+
  '<div class="stamp">Проверено</div></div>'+
  '<dl>'+
    '<div class="row"><dt>Страна</dt>'+val(s.country)+'</div>'+
    '<div class="row"><dt>Автомобиль</dt>'+val(s.type)+'</div>'+
    '<div class="row"><dt>Бюджет</dt>'+val(s.budget)+'</div>'+
  '</dl>'+
  '<p class="sub">Состав стоимости</p>'+
  '<dl>'+
    '<div class="row"><dt>Стоимость автомобиля</dt><dd class="empty">по расчёту</dd></div>'+
    '<div class="row"><dt>Доставка</dt><dd class="empty">по расчёту</dd></div>'+
    '<div class="row"><dt>Таможенные платежи</dt><dd class="empty">по расчёту</dd></div>'+
    '<div class="row"><dt>Оформление документов</dt><dd class="empty">по расчёту</dd></div>'+
    '<div class="row total"><dt>Итого под ключ</dt><dd class="empty">после расчёта</dd></div>'+
  '</dl>'+
  '<p class="fix">Итоговая сумма фиксируется в договоре до выкупа.</p>';
}
var heroSheet=document.getElementById('heroSheet');
var quizSheet=document.getElementById('quizSheet');
function paintHero(){heroSheet.innerHTML='<div class="sheet">'+sheetHTML({country:'',type:'',budget:'',via:''},false)+'</div>';}
function paintSheet(final){
  quizSheet.innerHTML='<div class="sheet pop">'+sheetHTML(state,final)+'</div>';
}

/* ---------- квиз ---------- */
var form=document.getElementById('quiz-form');

function head(n){
  var pct=Math.round(n/TOTAL*100);
  return '<div class="q-head"><span class="q-step">Шаг '+n+' из '+TOTAL+'</span><div class="q-bar" aria-hidden="true"><i style="width:'+pct+'%"></i></div></div>';
}

function renderQuestion(i){
  var s=STEPS[i],h=head(i+1);
  h+='<fieldset><legend id="q-title" tabindex="-1">'+esc(s.title)+'</legend><div class="q-opts">';
  s.opts.forEach(function(o){
    h+='<label class="opt"><input type="radio" name="'+s.key+'" value="'+esc(o)+'"'+(state[s.key]===o?' checked':'')+'><span>'+esc(o)+'</span></label>';
  });
  h+='</div></fieldset><div class="q-nav">'+
    (i>0?'<button class="q-back" type="button" data-back>Назад</button>':'<span></span>')+
    '<button class="btn btn-gold" type="button" data-next'+(state[s.key]?'':' disabled')+'>Далее</button></div>';
  form.innerHTML=h;
}

function renderContact(){
  var h=head(CONTACT+1);
  h+='<fieldset><legend id="q-title" tabindex="-1">Куда прислать расчёт?</legend>'+
    '<div class="q-field" id="f-name"><label for="in-name">Имя</label><input id="in-name" type="text" autocomplete="name" placeholder="Как к вам обращаться" value="'+esc(state.name)+'"><span class="msg">Укажите имя</span></div>'+
    '<div class="q-field" id="f-phone"><label for="in-phone">Телефон</label><input id="in-phone" type="tel" autocomplete="tel" placeholder="+7 (___) ___-__-__" value="'+esc(state.phone)+'"><span class="msg">Укажите телефон полностью</span></div>'+
    '<div class="q-field"><label>Как удобнее связаться</label><div class="via">';
  ['Telegram','WhatsApp','Звонок'].forEach(function(v){
    h+='<label class="opt"><input type="radio" name="via" value="'+v+'"'+(state.via===v?' checked':'')+'><span>'+v+'</span></label>';
  });
  h+='</div></div></fieldset>'+
    '<div class="q-nav"><button class="q-back" type="button" data-back>Назад</button>'+
    '<button class="btn btn-gold" type="submit">Получить расчёт</button></div>'+
    '<p class="legal">Нажимая на кнопку, вы соглашаетесь с политикой конфиденциальности.</p>';
  form.innerHTML=h;
}

function renderDone(){
  form.innerHTML=head(TOTAL)+
    '<div class="q-done"><h3 id="q-title" tabindex="-1">Заявка принята</h3>'+
    '<p>Менеджер свяжется с вами в '+esc(state.via==='Звонок'?'ближайшее время':state.via)+' и пришлёт расчёт под ключ.</p>'+
    '<p>Это демо: форма пока не подключена, данные никуда не отправляются. В рабочей версии заявка уходит в Bitrix24 и в Telegram.</p>'+
    '<button class="btn btn-line-light" type="button" data-again>Пройти заново</button></div>';
}

function show(n,focus){
  step=n;
  if(n<STEPS.length){renderQuestion(n);}
  else if(n===CONTACT){renderContact();}
  else{renderDone();}
  paintSheet(n===DONE);
  if(focus){var t=document.getElementById('q-title');if(t){t.focus({preventScroll:true});}}
}

form.addEventListener('change',function(e){
  var t=e.target;
  if(t.type!=='radio'){return;}
  state[t.name]=t.value;
  var next=form.querySelector('[data-next]');
  if(next){next.disabled=false;}
  paintSheet(false);
});
form.addEventListener('click',function(e){
  var b=e.target.closest('button');
  if(!b){return;}
  if(b.hasAttribute('data-next')&&state[STEPS[step].key]){show(step+1,true);}
  else if(b.hasAttribute('data-back')){show(step-1,true);}
  else if(b.hasAttribute('data-again')){state={country:'',type:'',budget:'',name:'',phone:'',via:'Telegram'};show(0,true);}
});
form.addEventListener('input',function(e){
  if(e.target.id==='in-name'){state.name=e.target.value;}
  if(e.target.id==='in-phone'){state.phone=e.target.value;}
});
form.addEventListener('submit',function(e){
  e.preventDefault();
  var okName=state.name.trim().length>0;
  var okPhone=state.phone.replace(/\D/g,'').length>=10;
  document.getElementById('f-name').classList.toggle('err',!okName);
  document.getElementById('f-phone').classList.toggle('err',!okPhone);
  if(!okName){document.getElementById('in-name').focus();return;}
  if(!okPhone){document.getElementById('in-phone').focus();return;}
  show(DONE,true);
});

/* ---------- подсказки для кнопок, которые в демо не подключены ---------- */
var toast=document.getElementById('toast'),tt;
function say(msg){toast.textContent=msg;toast.classList.add('on');clearTimeout(tt);tt=setTimeout(function(){toast.classList.remove('on');},2800);}
document.querySelectorAll('[data-soon]').forEach(function(a){
  a.addEventListener('click',function(e){
    e.preventDefault();
    say('«'+a.getAttribute('data-soon')+'» – в рабочей версии здесь будет живая ссылка.');
  });
});

paintHero();
show(0,false);
})();
