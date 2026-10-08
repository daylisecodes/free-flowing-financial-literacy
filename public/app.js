const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
const pct = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
function value(id){const el=document.getElementById(id);return el?Number(el.value):NaN;}
function validNonNegative(...nums){return nums.every(n=>Number.isFinite(n)&&n>=0);}
function render(id,html,type='neutral'){const el=document.getElementById(id);if(!el)return;el.className=`result show ${type}`;el.innerHTML=html;}
function error(id,message){render(id,`<strong>Check the numbers:</strong> ${message}`,'error');}
function clearResult(id){const el=document.getElementById(id);if(el){el.className='result';el.innerHTML='';}}
function fill(sample){Object.entries(sample).forEach(([id,v])=>{const el=document.getElementById(id);if(el)el.value=v;});}

// Module progress is intentionally memory-only for the current page session.
const completed = new Set();
function updateProgress(){const count=completed.size;const label=document.getElementById('progress-count');const bar=document.getElementById('progress-bar');if(label)label.textContent=`${count} of 7`;if(bar)bar.style.width=`${count/7*100}%`;}
document.querySelectorAll('.module-complete').forEach(btn=>btn.addEventListener('click',()=>{const module=btn.dataset.module;completed.add(module);btn.textContent=`Module ${module} marked complete`;btn.disabled=true;const box=btn.closest('.module-complete-box')?.querySelector('.completion-message');if(box){box.className='completion-message show';box.textContent='Marked complete for this page session only. Refreshing the page resets this status.';}updateProgress();}));
updateProgress();

// Generic three-question module quizzes.
document.querySelectorAll('.module-quiz').forEach(quiz => {
  const button = quiz.querySelector('.quiz-check');
  if (!button) return;
  button.addEventListener('click', () => {
    const questions = [...quiz.querySelectorAll('.quiz-question')];
    let answered = 0;
    let correct = 0;
    questions.forEach(q => {
      const selected = q.querySelector('input[type="radio"]:checked');
      q.classList.remove('question-correct', 'question-incorrect');
      if (!selected) return;
      answered += 1;
      if (selected.value === q.dataset.correct) {
        correct += 1;
        q.classList.add('question-correct');
      } else {
        q.classList.add('question-incorrect');
      }
    });
    const box = quiz.querySelector('.quiz-summary');
    if (!box) return;
    box.className = 'quiz-summary show';
    if (answered < questions.length) {
      box.innerHTML = `<strong>Almost there.</strong> Answer all ${questions.length} questions, then check again.`;
      return;
    }
    const message = correct === questions.length
      ? 'Great job. You understand the main ideas in this module.'
      : 'Review the highlighted questions and try again. The goal is understanding, not a perfect first score.';
    box.innerHTML = `<strong>${correct} of ${questions.length} correct.</strong> ${message}`;
  });
});

// Module 1: cash flow.
const budgetForm=document.getElementById('budget-form');
budgetForm?.addEventListener('submit',e=>{e.preventDefault();const income=value('budget-income'),housing=value('budget-housing'),living=value('budget-living'),debt=value('budget-debt'),flex=value('budget-flex'),goals=value('budget-goals');if(!validNonNegative(income,housing,living,debt,flex,goals)||income===0)return error('budget-result','Enter non-negative amounts and an income greater than $0.');const out=housing+living+debt+flex+goals,remaining=income-out;render('budget-result',`<div class="result-grid"><span>Total modeled outflow<strong>${money.format(out)}</strong></span><span>Practice remainder<strong>${money.format(remaining)}</strong></span><span>Modeled outflow vs. income<strong>${pct.format(out/income*100)}%</strong></span><span>Remainder vs. income<strong>${pct.format(remaining/income*100)}%</strong></span></div><p>${remaining>=0?'The numbers entered leave some income unassigned in this simple monthly model.':'The modeled outflow is larger than modeled income. Use that as a prompt to review the numbers, timing, income, or expenses—not as a judgment about you.'}</p>`);});
document.getElementById('budget-example')?.addEventListener('click',()=>{fill({'budget-income':4200,'budget-housing':1650,'budget-living':900,'budget-debt':425,'budget-flex':500,'budget-goals':350});budgetForm?.requestSubmit();});
document.getElementById('budget-clear')?.addEventListener('click',()=>{budgetForm?.reset();clearResult('budget-result');});

// Module 2: saving.
const savingsForm=document.getElementById('savings-form');
savingsForm?.addEventListener('submit',e=>{e.preventDefault();const expenses=value('save-expenses'),months=value('save-months'),current=value('save-current'),monthly=value('save-monthly');if(!validNonNegative(expenses,current,monthly)||!Number.isFinite(months)||months<1||months>24)return error('savings-result','Use non-negative dollar amounts and choose 1–24 months for the target you want to model.');const target=expenses*months,gap=Math.max(0,target-current),time=gap===0?0:monthly>0?Math.ceil(gap/monthly):null;render('savings-result',`<div class="result-grid"><span>Your chosen practice target<strong>${money.format(target)}</strong></span><span>Amount already modeled<strong>${money.format(current)}</strong></span><span>Remaining gap<strong>${money.format(gap)}</strong></span><span>Simple months at entered contribution<strong>${time===null?'—':time}</strong></span></div><p>${gap===0?'The amount already set aside meets or exceeds the target you chose for this exercise.':time===null?'Enter a monthly contribution above $0 if you want a simple time estimate.':`At ${money.format(monthly)} per month, simple arithmetic closes the modeled gap in about <strong>${time} month${time===1?'':'s'}</strong>. This is not a recommendation or prediction.`}</p>`);});
document.getElementById('savings-example')?.addEventListener('click',()=>{fill({'save-expenses':2400,'save-months':3,'save-current':1500,'save-monthly':300});savingsForm?.requestSubmit();});
document.getElementById('savings-clear')?.addEventListener('click',()=>{savingsForm?.reset();clearResult('savings-result');});

// Module 3: DTI.
const dtiForm=document.getElementById('dti-form');
dtiForm?.addEventListener('submit',e=>{e.preventDefault();const income=value('dti-income'),debt=value('dti-debt');if(!validNonNegative(income,debt)||income===0)return error('dti-result','Gross monthly income must be greater than $0 and debt payments cannot be negative.');const dti=debt/income*100;render('dti-result',`<div class="result-grid"><span>Monthly debt entered<strong>${money.format(debt)}</strong></span><span>Gross monthly income<strong>${money.format(income)}</strong></span><span>Educational DTI arithmetic<strong>${pct.format(dti)}%</strong></span></div><p>DTI is monthly debt payments divided by gross monthly income. This site does not label the result qualifying or non-qualifying because lender and product requirements vary.</p>`);});
document.getElementById('dti-example')?.addEventListener('click',()=>{fill({'dti-income':6000,'dti-debt':1500});dtiForm?.requestSubmit();});
document.getElementById('dti-clear')?.addEventListener('click',()=>{dtiForm?.reset();clearResult('dti-result');});

// Module 4: home-learning tools.
const homeChecklist=document.getElementById('home-checklist');
homeChecklist?.addEventListener('change',()=>{const total=homeChecklist.querySelectorAll('input').length,checked=homeChecklist.querySelectorAll('input:checked').length;const out=document.getElementById('home-checklist-result');if(out)out.textContent=`${checked} of ${total} education checkpoints selected. This is not a readiness or approval score.`;});
const homeForm=document.getElementById('home-form');
homeForm?.addEventListener('submit',e=>{e.preventDefault();const price=value('home-price'),downPct=value('home-down');if(!validNonNegative(price,downPct)||price===0||downPct>100)return error('home-result','Enter a home price greater than $0 and a down-payment percentage between 0 and 100.');const down=price*downPct/100,closeLow=price*.02,closeHigh=price*.05;render('home-result',`<div class="result-grid"><span>Modeled down payment<strong>${money.format(down)}</strong></span><span>Rough 2% closing-cost illustration<strong>${money.format(closeLow)}</strong></span><span>Rough 5% closing-cost illustration<strong>${money.format(closeHigh)}</strong></span><span>Illustrative upfront range<strong>${money.format(down+closeLow)} – ${money.format(down+closeHigh)}</strong></span></div><p>Closing costs are only a rough CFPB early-planning range here and do not include every possible cash need. Actual transaction costs vary. A real lender's disclosures are what matter for a specific loan.</p>`);});
document.getElementById('home-example')?.addEventListener('click',()=>{fill({'home-price':350000,'home-down':5});homeForm?.requestSubmit();});
document.getElementById('home-clear')?.addEventListener('click',()=>{homeForm?.reset();clearResult('home-result');});
const equityForm=document.getElementById('equity-form');
equityForm?.addEventListener('submit',e=>{e.preventDefault();const home=value('equity-value'),owed=value('equity-owed');if(!validNonNegative(home,owed))return error('equity-result','Enter non-negative hypothetical amounts.');const simple=home-owed;render('equity-result',`<div class="result-grid"><span>Simple value-minus-debt difference<strong>${money.format(simple)}</strong></span></div><p>This is only a basic equity illustration. It is not an appraisal, sale-proceeds estimate, borrowing limit, tax calculation, or statement of cash you could necessarily access.</p>`);});

// Module 5: investing math.
const growthForm=document.getElementById('growth-form');
growthForm?.addEventListener('submit',e=>{e.preventDefault();const start=value('growth-start'),monthly=value('growth-monthly'),rate=value('growth-rate'),years=value('growth-years');if(!validNonNegative(start,monthly)||!Number.isFinite(rate)||!Number.isFinite(years)||years<1||years>60||rate<-100||rate>100)return error('growth-result','Use non-negative starting/contribution amounts, 1–60 years, and a hypothetical rate between -100% and 100%.');const months=Math.round(years*12),monthlyRate=rate/100/12;let balance=start;for(let i=0;i<months;i++)balance=balance*(1+monthlyRate)+monthly;const contributed=start+monthly*months;render('growth-result',`<div class="result-grid"><span>Total money modeled as contributed<strong>${money.format(contributed)}</strong></span><span>Hypothetical ending math result<strong>${money.format(balance)}</strong></span></div><p>This assumes the same rate every month for the entire period. Real investments do not behave that way; returns vary, losses occur, and fees, taxes, inflation, and timing can change outcomes.</p>`);});
document.getElementById('growth-example')?.addEventListener('click',()=>{fill({'growth-start':1000,'growth-monthly':100,'growth-rate':5,'growth-years':10});growthForm?.requestSubmit();});
document.getElementById('growth-clear')?.addEventListener('click',()=>{growthForm?.reset();clearResult('growth-result');});
const feeForm=document.getElementById('fee-form');
feeForm?.addEventListener('submit',e=>{e.preventDefault();const start=value('fee-start'),gross=value('fee-return'),fee=value('fee-rate'),years=value('fee-years');if(!validNonNegative(start,fee)||!Number.isFinite(gross)||!Number.isFinite(years)||years<1||years>60||gross<-100||gross>100||fee>20)return error('fee-result','Use a non-negative balance, 1–60 years, a gross rate between -100% and 100%, and a fee from 0% to 20%.');let noFee=start,withFee=start;const grossMonthly=gross/100/12,netMonthly=(gross-fee)/100/12;for(let i=0;i<years*12;i++){noFee*=1+grossMonthly;withFee*=1+netMonthly;}render('fee-result',`<div class="result-grid"><span>Simplified result with no modeled fee<strong>${money.format(noFee)}</strong></span><span>Simplified result after subtracting fee from annual rate<strong>${money.format(withFee)}</strong></span><span>Difference in this illustration<strong>${money.format(noFee-withFee)}</strong></span></div><p>This is deliberately simplified. Real fees can be assessed in different ways, and real returns fluctuate. It demonstrates only that costs can compound over time.</p>`);});

// Module 6: scam scenarios.
document.querySelectorAll('.scenario-answer').forEach(btn=>btn.addEventListener('click',()=>{const box=btn.parentElement?.querySelector('.scenario-feedback');if(box){box.className='scenario-feedback show';box.textContent=btn.dataset.message||'';}}));

// Module 7: stewardship check-in.
document.getElementById('stewardship-review')?.addEventListener('click',()=>{const list=document.getElementById('stewardship-checklist');const total=list?.querySelectorAll('input').length||0,checked=list?.querySelectorAll('input:checked').length||0;let message='Use the unchecked items as questions to explore before a major decision.';if(checked===total)message='You selected every reflection item. That does not guarantee a good outcome; it only shows that you paused to consider these preparation questions.';else if(checked===0)message='Nothing is wrong with starting at zero. Choose one question you want to understand better before moving forward.';render('stewardship-result',`<div class="result-grid"><span>Reflection items selected<strong>${checked} of ${total}</strong></span></div><p>${message}</p>`);});
