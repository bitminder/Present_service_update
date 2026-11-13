#!/usr/bin/env node
/* Dependency-free static QA for the GitHub Pages preview.
   Never removes noindex or changes the public company's DNS. */
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const errors = [];
const pages = fs.readdirSync(root).filter(f => f.endsWith(".html")).sort();
const checks = [];
const read = p => fs.readFileSync(path.join(root,p),"utf8");
const idsByPage = new Map();
for (const file of pages) {
  const html = read(file);
  idsByPage.set(file,new Set([...html.matchAll(/\bid=["']([^"']+)["']/g)].map(m=>m[1])));
}
for (const file of pages) {
  const html=read(file);
  const singleH1=[...html.matchAll(/<h1\b/g)].length===1;
  const title=/<title>[^<]+<\/title>/i.test(html);
  const description=/<meta\s+name=["']description["']/i.test(html);
  const language=/<html[^>]*lang=["']pl["']/i.test(html);
  const noindex=/<meta\s+name=["']robots["']\s+content=["']noindex,nofollow["']/i.test(html);
  const v2CSS=html.includes('href="./v2.css"');
  const verifiedLogo=html.includes('src="./assets/present-service-logo.png"');
  const googleFonts=!html.includes("fonts.googleapis.com");
  if(!singleH1) errors.push(file+": expected one h1");
  if(!title) errors.push(file+": missing title");
  if(!description) errors.push(file+": missing meta description");
  if(!language) errors.push(file+": missing Polish document language");
  if(!noindex) errors.push(file+": preview must remain noindex");
  if(!v2CSS) errors.push(file+": missing v2 stylesheet");
  if(!verifiedLogo) errors.push(file+": missing company logo");
  if(!googleFonts) errors.push(file+": external Google Fonts not removed");
  const attrs=[...html.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)].map(m=>m[1]);
  for(const value of attrs) {
    if(/^(https?:|mailto:|tel:|data:|javascript:)/.test(value))continue;
    const [link,anchor]=value.split("#",2);
    if(!link && anchor) {
      if(!idsByPage.get(file)?.has(anchor)) errors.push(file+": broken local anchor #"+anchor);
      continue;
    }
    if(!link)continue;
    const target=decodeURIComponent(link.split("?")[0]).replace(/^\.\//,"");
    if(!target)continue;
    if(!fs.existsSync(path.join(root,target)))errors.push(file+": missing asset "+target);
    if(anchor && target.endsWith(".html") && !idsByPage.get(target)?.has(anchor))errors.push(file+": broken cross-page anchor "+target+"#"+anchor);
  }
  checks.push({file,links:attrs.length,singleH1,title,description,language,noindex,v2CSS,verifiedLogo,googleFonts});
}
const js=read("app.js");
if(!js.includes('track("brief_completed")'))errors.push("app.js: missing anonymous brief event");
if(!js.includes("new FormData(form)"))errors.push("app.js: missing campaign form processing");
if(!js.includes("onlineEnabled"))errors.push("app.js: missing explicit online delivery gate");
const robots=read("robots.txt");
if(!/Disallow:\s*\//.test(robots)) errors.push("robots.txt must block indexing of preview");
console.log("QA pages:",pages.length,"checks:",checks);
if(errors.length){console.error("QA errors:\n"+errors.map(x=>" - "+x).join("\n"));process.exit(1)}
console.log("All static preview checks passed.");
