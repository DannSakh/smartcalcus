
function fmt(n){return n.toLocaleString('ru-RU',{maximumFractionDigits:2})}
function byId(id){return document.getElementById(id)}

// Credit
function annuityPayment(S, r, n){
  const i = r/12/100; if(i===0) return S/n;
  return S * i / (1 - Math.pow(1+i, -n));
}
function renderCredit(){
  const form = byId('credit-form'); if(!form) return;
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const S = parseFloat(byId('amount').value||0);
    const n = parseInt(byId('months').value||0,10);
    const r = parseFloat(byId('rate').value||0);
    const type = byId('ptype').value;
    if(!(S>0 && n>0 && r>=0)) return;
    let rows=''; let total=0, over=0, monthly=0, balance=S;
    if(type==='annuity'){
      monthly = annuityPayment(S,r,n);
      for(let m=1;m<=n;m++){
        const i = balance*(r/12/100);
        const principal = monthly - i;
        balance = Math.max(0, balance - principal);
        total += monthly; over += i;
        rows += `<tr><td>${m}</td><td>${fmt(monthly)}</td><td>${fmt(i)}</td><td>${fmt(principal)}</td><td>${fmt(balance)}</td></tr>`;
      }
    }else{
      const principalBase = S/n;
      for(let m=1;m<=n;m++){
        const i = balance*(r/12/100);
        const p = principalBase + i;
        balance = Math.max(0, balance - principalBase);
        total += p; over += i;
        if(m===1) monthly = p;
        rows += `<tr><td>${m}</td><td>${fmt(p)}</td><td>${fmt(i)}</td><td>${fmt(principalBase)}</td><td>${fmt(balance)}</td></tr>`;
      }
    }
    byId('monthly').textContent = fmt(monthly);
    byId('overpay').textContent  = fmt(over);
    byId('totalpay').textContent = fmt(total);
    byId('rows').innerHTML = rows;
    byId('summary').classList.remove('hidden');
    byId('schedule').classList.remove('hidden');
  });
}

// Mortgage with partial prepayment
function renderMortgage(){
  const form = byId('mortgage-form'); if(!form) return;
  form.addEventListener('submit',(e)=>{
    e.preventDefault();
    const S = parseFloat(byId('m_amount').value||0);
    const years = parseInt(byId('m_years').value||0,10);
    const n = years*12;
    const r = parseFloat(byId('m_rate').value||0);
    const preMonth = parseInt(byId('m_premonth').value||0,10);
    const preAmt = parseFloat(byId('m_preamount').value||0);
    const reduce = byId('m_reduce').value;
    const i = r/12/100;
    const a0 = annuityPayment(S,r,n);
    let balance = S, rowsBefore='', rowsAfter='';
    for(let m=1;m<=Math.min(preMonth-1,n);m++){
      const interest = balance*i;
      const principal = a0 - interest;
      balance -= principal;
      rowsBefore += `<tr><td>${m}</td><td>${fmt(a0)}</td><td>${fmt(interest)}</td><td>${fmt(principal)}</td><td>${fmt(balance)}</td></tr>`;
    }
    if(preMonth>0 && preAmt>0){ balance = Math.max(0, balance - preAmt); }
    if(reduce==='term'){
      let m = preMonth;
      while(balance>0 && m<=n+600){
        const interest = balance*i;
        const principal = Math.min(a0 - interest, balance);
        balance -= principal;
        rowsAfter += `<tr><td>${m}</td><td>${fmt(a0)}</td><td>${fmt(interest)}</td><td>${fmt(principal)}</td><td>${fmt(balance)}</td></tr>`;
        m++;
      }
      byId('m_newpay').textContent = fmt(a0);
      byId('m_newterm').textContent = (m-1) + ' мес.';
    }else{
      const remainingMonths = n - (preMonth-1);
      const newPay = annuityPayment(balance, r, remainingMonths);
      for(let m=preMonth;m<=n;m++){
        const interest = balance*i;
        const principal = Math.min(newPay - interest, balance);
        balance -= principal;
        rowsAfter += `<tr><td>${m}</td><td>${fmt(newPay)}</td><td>${fmt(interest)}</td><td>${fmt(principal)}</td><td>${fmt(balance)}</td></tr>`;
      }
      byId('m_newpay').textContent = fmt(newPay);
      byId('m_newterm').textContent = n + ' мес.';
    }
    byId('m_rows_before').innerHTML = rowsBefore || '<tr><td colspan="5" style="text-align:center">Досрочного погашения в первый месяц — график до него отсутствует.</td></tr>';
    byId('m_rows_after').innerHTML = rowsAfter;
    byId('m_results').classList.remove('hidden');
  });
}

// Currency (CBR JSON)
async function loadRates(){
  const out = byId('rate_info'); if(!out) return;
  try{
    const res = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
    const data = await res.json();
    const map = {"RUB":1};
    for(const k in data.Valute){
      const v = data.Valute[k];
      map[k] = v.Value / v.Nominal;
    }
    window._rates = map;
    out.textContent = 'Курсы обновлены: ' + new Date(data.Timestamp || data.Date).toLocaleString('ru-RU');
  }catch(e){
    out.textContent = 'Не удалось загрузить курсы ЦБ РФ (офлайн режим).';
    window._rates = {"RUB":1,"USD":90,"EUR":100,"GBP":115,"KZT":0.19,"CNY":12.5,"AED":24.5};
  }
}
function renderCurrency(){
  const form = byId('cur-form'); if(!form) return;
  loadRates();
  form.addEventListener('submit',(e)=>{
    e.preventDefault();
    const amt = parseFloat(byId('cur_amount').value||0);
    const from = byId('cur_from').value;
    const to = byId('cur_to').value;
    const map = window._rates || {};
    if(!(amt>0 && map[from] && map[to])) return;
    const rub = amt * map[from];
    const out = rub / map[to];
    byId('cur_result').textContent = fmt(out) + ' ' + to;
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  renderCredit(); renderMortgage(); renderCurrency();
});
