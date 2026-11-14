import { chromium } from "playwright";
import axe from "axe-core";

const base = process.env.BASE_URL || "https://bitminder.github.io/Present_service_update/";
const browser = await chromium.launch({ headless: true });
let passed = 0;
const failures = [];

async function run(name, fn) {
  try {
    await fn();
    passed += 1;
    console.log("PASS:", name);
  } catch (e) {
    failures.push({ name, message: String(e.stack || e) });
    console.error("FAIL:", name, String(e.message || e));
  }
}
function assert(value, description) {
  if (!value) throw new Error(description);
}
async function testPage(context, url) {
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("response", r => {
    if (r.status() >= 400 && r.url().startsWith(base)) errors.push("HTTP "+r.status()+" "+r.url());
  });
  const response = await page.goto(url, {waitUntil:"networkidle",timeout:45000});
  return {page,response,errors};
}

const widths = [1440, 768, 390, 320];
for(const width of widths){
  await run("Home loads & fits viewport at "+width+"px",async()=>{
    const context=await browser.newContext({viewport:{width,height:860},deviceScaleFactor:1});
    const {page,response,errors}=await testPage(context,base);
    assert(response && response.status()===200,"homepage HTTP status "+response?.status());
    assert(await page.locator("h1").count()===1,"expected exactly one h1");
    assert((await page.locator("h1").innerText()).includes("Baza danych"),"main message must prioritize data provision");
    assert(await page.locator("#dane").count()===1,"missing core audience-data section");
    assert(await page.locator("img.brand-official-logo").first().evaluate(img=>img.complete&&img.naturalWidth>0),"missing / broken company logo");
    assert((await page.locator('meta[name="robots"]').getAttribute("content"))?.includes("noindex"),"staging should be noindex");
    const dimensions=await page.evaluate(()=>({
      scrollWidth:document.documentElement.scrollWidth,
      clientWidth:document.documentElement.clientWidth,
      bodyWidth:document.body.scrollWidth
    }));
    if(dimensions.scrollWidth>width+2){
      const offenders=await page.evaluate(()=>[...document.querySelectorAll("body *")].map(el=>{
        const r=el.getBoundingClientRect();
        const styles=getComputedStyle(el);
        return {tag:el.tagName,id:el.id,classes:String(el.className||"").slice(0,100),
          right:Math.round(r.right),left:Math.round(r.left),width:Math.round(r.width),
          scrollWidth:el.scrollWidth,clientWidth:el.clientWidth,overflowX:styles.overflowX};
      }).filter(o=>o.right>window.innerWidth+1||o.left< -1)
        .sort((a,b)=>a.right-b.right).slice(0,30));
      console.error("OVERFLOW_DIAGNOSTIC",width,JSON.stringify(offenders));
    }
    assert(dimensions.scrollWidth<=width+2,"horizontal page overflow: "+JSON.stringify(dimensions));
    assert(errors.length===0,"console or network errors: "+errors.join("; "));
    await page.screenshot({path:"artifacts/home-"+width+".png",fullPage:true});
    await context.close();
  });
}

await run("Mobile menu opens, closes and follows links",async()=>{
  const context=await browser.newContext({viewport:{width:390,height:844}});
  const {page}=await testPage(context,base);
  const button=page.locator(".menu-toggle");
  assert(await button.isVisible(),"menu toggle not visible");
  await button.click();
  assert(await button.getAttribute("aria-expanded")==="true","menu did not open");
  assert(await page.locator("#primary-nav").isVisible(),"navigation not visible");
  await page.keyboard.press("Escape");
  assert(await button.getAttribute("aria-expanded")==="false","escape didn't close menu");
  await button.click();
  await page.locator('#primary-nav a[href="#dane"]').click();
  assert(await button.getAttribute("aria-expanded")==="false","menu remained open after navigation");
  await context.close();
});

await run("Campaign filter prevents missing region",async()=>{
  const context=await browser.newContext({viewport:{width:1440,height:900}});
  const {page}=await testPage(context,base);
  await page.locator("#channel").selectOption({label:"E-mailing"});
  await page.locator("#location").selectOption({label:"Wybrane województwa"});
  assert(await page.locator("#regions-field").isVisible(),"region field should be visible");
  await page.locator('[data-wizard-step="1"] [data-wizard-next]').click();
  assert(await page.locator('[data-wizard-step="1"]').isVisible(),"wizard should remain on audience step");
  assert(await page.locator("#campaign-form").isVisible(),"form should not submit without a region");
  assert(!(await page.locator("#brief-result").isVisible()),"result should be hidden when region is missing");
  await context.close();
});

await run("Advanced campaign plan creates correct brief",async()=>{
  const context=await browser.newContext({viewport:{width:1440,height:900}});
  const {page,errors}=await testPage(context,base);
  assert(await page.locator('[data-wizard-step="1"]').isVisible(),"first wizard step should be visible");
  await page.locator("#channel").selectOption({label:"Direct mail"});
  await page.locator("#family-stage").selectOption({label:"0–6 miesięcy"});
  await page.locator("#child-count").selectOption({label:"2 dzieci"});
  await page.locator("#parent-age").selectOption({label:"25–34 lata"});
  await page.locator("#location").selectOption({label:"Wybrane województwa"});
  await page.locator('input[name="voivodeship"][value="Mazowieckie"]').check();
  await page.locator('input[name="voivodeship"][value="Wielkopolskie"]').check();
  await page.locator('[data-wizard-step="1"] [data-wizard-next]').click();
  assert(await page.locator('[data-wizard-step="2"]').isVisible(),"second wizard step should be visible");
  await page.locator("#brand-name").fill("Firma testowa XYZ");
  await page.locator("#cooperation-model").selectOption({label:"Dane do kampanii prowadzonej przez naszą firmę"});
  await page.locator("#requested-volume").selectOption({label:"10 000–50 000"});
  await page.locator("#campaign-date").fill("2027-01");
  await page.locator("#campaign-budget").selectOption({label:"5 000–15 000 PLN"});
  await page.locator("#campaign-goal").fill("Testowa kampania dla rodziców.");
  await page.locator('[data-wizard-step="2"] [data-wizard-next]').click();
  assert(await page.locator('[data-wizard-step="3"]').isVisible(),"third wizard step should be visible");
  assert((await page.locator("#wizard-summary").innerText()).includes("Mazowieckie"),"wizard summary is missing selected region");
  assert((await page.locator("#wizard-summary").innerText()).includes("10 000–50 000"),"wizard summary is missing segment volume");
  await page.locator("#contact-name").fill("Jan Testowy");
  await page.locator("#contact-email").fill("jan@example.org");
  await page.locator("#privacy-confirm").check();
  await page.locator('#campaign-form button[type="submit"]').click();
  assert(await page.locator("#brief-result").isVisible(),"result missing");
  assert(!(await page.locator("#campaign-form").isVisible()),"form still visible");
  const brief=await page.locator("#brief-preview").inputValue();
  for(const fragment of ["Firma testowa XYZ","Direct mail","Dane do kampanii prowadzonej przez naszą firmę","10 000–50 000","0–6 miesięcy","2 dzieci","25–34 lata","Mazowieckie","Wielkopolskie","2027-01","5 000–15 000 PLN","Testowa kampania","Jan Testowy","jan@example.org"]) {
    assert(brief.includes(fragment),"brief missing "+fragment);
  }
  const href=await page.locator("#send-email").getAttribute("href");
  assert(href.startsWith("mailto:marketing@present-service.pl"),"expected mailto fallback");
  assert(!(await page.locator("#online-contact").isVisible()),"direct send should be disabled without configured backend");
  assert(errors.length===0,"runtime errors "+errors.join("; "));
  await page.locator("#edit-brief").click();
  assert(await page.locator("#campaign-form").isVisible(),"edit should restore form");
  assert(await page.locator('[data-wizard-step="3"]').isVisible(),"edit should restore contact wizard step");
  await context.close();
});

await run("Fictional audience examples fill the brief safely",async()=>{
  const context=await browser.newContext({viewport:{width:390,height:844}});
  const {page,errors}=await testPage(context,base);
  assert(await page.locator("[data-demo-example]").count()===3,"expected three demo presets");
  assert((await page.locator("#przykladowe-segmenty").innerText()).includes("Dane demonstracyjne"),"fictional figures must be disclosed near the cards");
  await page.locator('[data-demo-example="1"]').click();
  assert(await page.locator("#channel").inputValue()==="Direct mail","first sample channel not applied");
  assert(await page.locator("#family-stage").inputValue()==="0–6 miesięcy","first sample stage not applied");
  assert(await page.locator('#regions-field input[value="Mazowieckie"]').isChecked(),"first sample region not selected");
  assert(await page.locator("#requested-volume").inputValue()==="10 000–50 000","first sample volume missing");
  assert(await page.locator("#wizard-demo-active").isVisible(),"sample warning not shown");
  assert(await page.locator("#contact-email").inputValue()==="","example must not invent contact email");
  assert(!(await page.locator("#privacy-confirm").isChecked()),"example must never provide consent");
  await page.locator('[data-demo-example="2"]').click();
  assert(await page.locator("#channel").inputValue()==="E-mailing","second sample channel not applied");
  assert(await page.locator('#regions-field input[value="Wielkopolskie"]').isChecked(),"second sample region not checked");
  assert(!(await page.locator('#regions-field input[value="Mazowieckie"]').isChecked()),"prior sample region should be cleared");
  await page.locator('[data-demo-example="3"]').click();
  assert(await page.locator("#channel").inputValue()==="Mobile marketing","third sample channel not applied");
  assert(await page.locator('#regions-field input[value="Małopolskie"]').isChecked(),"third sample Malopolskie missing");
  assert(await page.locator('#regions-field input[value="Śląskie"]').isChecked(),"third sample Slaskie missing");
  assert(errors.length===0,"sample handling triggered runtime errors: "+errors.join("; "));
  await context.close();
});

await run("Downloadable example specification contains no personal records",async()=>{
  const context=await browser.newContext();
  const page=await context.newPage();
  const response=await page.request.get(base+"assets/specyfikacja-demo.csv");
  assert(response.status()===200,"demo CSV not accessible");
  const csv=await response.text();
  assert(csv.includes("FIKCYJNY PRZYKŁAD") && csv.includes("DEMO-003"),"demo CSV disclaimer missing");
  assert(!csv.includes("@") && !/\\b(?:\\+48|[0-9]{9,})\\b/.test(csv),"CSV appears to contain individual contact records");
  const rows=csv.trim().split("\n").map(row=>row.split(";").length);
  assert(rows.every(n=>n===9),"CSV columns are inconsistent: "+rows);
  await context.close();
});

await run("Service landing links preselect the channel",async()=>{
  const context=await browser.newContext({viewport:{width:1200,height:900}});
  const {page}=await testPage(context,base+"?kanal=E-mailing#brief");
  assert(await page.locator("#channel").inputValue()==="E-mailing","channel not preselected");
  await context.close();
});

await run("All service landing pages load with branding",async()=>{
  const context=await browser.newContext({viewport:{width:390,height:844}});
  const pages=["baza-danych-rodzin.html","direct-mail.html","emailing.html","mobile-marketing.html","mamaklub-sampling.html","segmentacja-danych.html","zastosowania-danych.html","informacje-o-danych.html"];
  for(const p of pages) {
    const {page,response,errors}=await testPage(context,base+p);
    assert(response.status()===200,p+" HTTP "+response.status());
    assert(await page.locator("h1").count()===1,p+" missing one h1");
    assert(await page.locator("img.brand-official-logo").first().evaluate(img=>img.complete&&img.naturalWidth>0),p+" missing company logo");
    const width=await page.evaluate(()=>document.documentElement.scrollWidth);
    assert(width<=392,p+" horizontal overflow "+width);
    assert(errors.length===0,p+" console/network errors "+errors.join("; "));
    await page.close();
  }
  await context.close();
});

await run("WCAG 2.2 AA automated accessibility smoke test",async()=>{
  const context=await browser.newContext({viewport:{width:1440,height:900}});
  const allViolations=[];
  for(const url of [base,base+"baza-danych-rodzin.html",base+"direct-mail.html",base+"emailing.html",base+"mobile-marketing.html",base+"mamaklub-sampling.html",base+"segmentacja-danych.html",base+"zastosowania-danych.html",base+"informacje-o-danych.html"]){
    const {page}=await testPage(context,url);
    await page.addScriptTag({content:axe.source});
    const audit=await page.evaluate(async()=>await window.axe.run(document,{
      runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21a","wcag21aa","wcag22aa"]}
    }));
    const summary=audit.violations.map(v=>({
      id:v.id,impact:v.impact,description:v.description,
      nodes:v.nodes.slice(0,4).map(n=>({html:n.html.slice(0,220),failureSummary:n.failureSummary}))
    }));
    console.log("AXE_RESULTS",url,JSON.stringify(summary));
    if(audit.violations.length)allViolations.push({url,summary});
    await page.close();
  }
  assert(allViolations.length===0,"Accessibility issues detected: "+JSON.stringify(allViolations));
  await context.close();
});
await browser.close();
console.log("SUMMARY",JSON.stringify({passed,failed:failures.length,failures}));
if(failures.length)process.exit(1);
