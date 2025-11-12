
function fmt(n){return n.toLocaleString('ru-RU',{maximumFractionDigits:2})}
function byId(id){return document.getElementById(id)}
function annuityPayment(S, r, n){const i=r/12/100; return i===0? S/n : S*i/(1-Math.pow(1+i,-n));}
function initCredit(){const f=byId('credit-form'); if(!f) return;
  f.addEventListener('submit',e=>{e.preventDefault();
    const S=parseFloat(byId('amount').value||0), n=parseInt(byId('months').value||0,10), r=parseFloat(byId('rate').value||0), t=byId('ptype').value;
    if(!(S>0&&n>0&&r>=0)) return; let rows='',total=0,over=0,monthly=0,b=S;
    if(t==='annuity'){monthly=annuityPayment(S,r,n); for(let m=1;m<=n;m++){const i=b*(r/12/100),p=monthly-i;b=Math.max(0,b-p);total+=monthly;over+=i;rows+=`<tr><td>${m}</td><td>${fmt(monthly)}</td><td>${fmt(i)}</td><td>${fmt(p)}</td><td>${fmt(b)}</td></tr>`;}}
    else{const base=S/n; for(let m=1;m<=n;m++){const i=b*(r/12/100),p=base+i;b=Math.max(0,b-base);total+=p;over+=i;if(m===1)monthly=p;rows+=`<tr><td>${m}</td><td>${fmt(p)}</td><td>${fmt(i)}</td><td>${fmt(base)}</td><td>${fmt(b)}</td></tr>`;}}
    byId('monthly').textContent=fmt(monthly); byId('overpay').textContent=fmt(over); byId('totalpay').textContent=fmt(total);
    byId('rows').innerHTML=rows; byId('summary').classList.remove('hidden'); byId('schedule').classList.remove('hidden');
  });}
function initMortgage(){const f=byId('mortgage-form'); if(!f) return;
  f.addEventListener('submit',e=>{e.preventDefault();
    const S=parseFloat(byId('m_amount').value||0), years=parseInt(byId('m_years').value||0,10), n=years*12, r=parseFloat(byId('m_rate').value||0),
          preM=parseInt(byId('m_premonth').value||0,10), preA=parseFloat(byId('m_preamount').value||0), red=byId('m_reduce').value, i=r/12/100;
    const a0=annuityPayment(S,r,n); let b=S, before='', after='';
    for(let m=1;m<=Math.min(preM-1,n);m++){const inr=b*i,pr=a0-inr;b-=pr;before+=`<tr><td>${m}</td><td>${fmt(a0)}</td><td>${fmt(inr)}</td><td>${fmt(pr)}</td><td>${fmt(b)}</td></tr>`;}
    if(preM>0&&preA>0) b=Math.max(0,b-preA);
    if(red==='term'){let m=preM; while(b>0&&m<=n+600){const inr=b*i,pr=Math.min(a0-inr,b);b-=pr;after+=`<tr><td>${m}</td><td>${fmt(a0)}</td><td>${fmt(inr)}</td><td>${fmt(pr)}</td><td>${fmt(b)}</td></tr>`; m++;}
      byId('m_newpay').textContent=fmt(a0); byId('m_newterm').textContent=(m-1)+' мес.';
    }else{const rem=n-(preM-1), newPay=annuityPayment(b,r,rem);
      for(let m=preM;m<=n;m++){const inr=b*i,pr=Math.min(newPay-inr,b);b-=pr;after+=`<tr><td>${m}</td><td>${fmt(newPay)}</td><td>${fmt(inr)}</td><td>${fmt(pr)}</td><td>${fmt(b)}</td></tr>`;}
      byId('m_newpay').textContent=fmt(newPay); byId('m_newterm').textContent=n+' мес.';
    }
    byId('m_rows_before').innerHTML=before||'<tr><td colspan="5" style="text-align:center">Досрочного погашения в первый месяц — график до него отсутствует.</td></tr>';
    byId('m_rows_after').innerHTML=after; byId('m_results').classList.remove('hidden');
  });}
async function loadRates(){const out=byId('rate_info'); if(!out) return;
  try{const res=await fetch('https://www.cbr-xml-daily.ru/daily_json.js'); const data=await res.json(); const map={"RUB":1};
    for(const k in data.Valute){const v=data.Valute[k]; map[k]=v.Value/v.Nominal;} window._rates=map;
    out.textContent='Курсы обновлены: '+new Date(data.Timestamp||data.Date).toLocaleString('ru-RU');
  }catch(e){out.textContent='Не удалось загрузить курсы ЦБ РФ (офлайн режим).'; window._rates={"RUB":1,"USD":90,"EUR":100,"GBP":115,"KZT":0.19,"CNY":12.5,"AED":24.5};}}
function initCurrency(){const f=byId('cur-form'); if(!f) return; loadRates();
  f.addEventListener('submit',e=>{e.preventDefault(); const amt=parseFloat(byId('cur_amount').value||0), fr=byId('cur_from').value, to=byId('cur_to').value, m=window._rates||{};
    if(!(amt>0&&m[fr]&&m[to])) return; const rub=amt*m[fr], out=rub/m[to]; byId('cur_result').textContent=fmt(out)+' '+to;});}
document.addEventListener('DOMContentLoaded',()=>{initCredit();initMortgage();initCurrency();});
