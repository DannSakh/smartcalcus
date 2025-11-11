function fmt(n){return n.toLocaleString('ru-RU',{maximumFractionDigits:2})}

function annuityPayment(S, r, n){
  const i = r/12/100;
  if(i===0) return S/n;
  return S * i / (1 - Math.pow(1+i, -n));
}

function calc(){
  const S = parseFloat(document.getElementById('amount').value||0);
  const n = parseInt(document.getElementById('months').value||0,10);
  const r = parseFloat(document.getElementById('rate').value||0);
  const type = document.getElementById('ptype').value;

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
  }else{ // diff
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

  document.getElementById('monthly').textContent = fmt(monthly);
  document.getElementById('overpay').textContent  = fmt(over);
  document.getElementById('totalpay').textContent = fmt(total);
  document.getElementById('rows').innerHTML = rows;
  document.getElementById('summary').classList.remove('hidden');
  document.getElementById('schedule').classList.remove('hidden');
}

document.getElementById('credit-form').addEventListener('submit', (e)=>{e.preventDefault(); calc();});
document.getElementById('reset').addEventListener('click', ()=>{
  document.getElementById('credit-form').reset();
  document.getElementById('summary').classList.add('hidden');
  document.getElementById('schedule').classList.add('hidden');
});
