#!/usr/bin/env node
/* Creates a gated production export without modifying the GitHub preview.
   Never deploy unless legal information, company claims and domain are approved. */
import fs from "node:fs";
import path from "node:path";

const url=process.env.SITE_URL;
const approved=process.env.CONFIRM_PUBLICATION==="YES"
  &&process.env.APPROVED_PRIVACY_POLICY==="YES"
  &&process.env.APPROVED_DATA_CLAIMS==="YES";
if(!approved){
  console.error("Production export blocked: publication, privacy, and company-claims approvals required.");
  process.exit(1);
}
let base;
try{
  base=new URL(url);
  if(base.protocol!=="https:" || base.pathname!=="/" || /github\.io$/i.test(base.hostname))throw Error();
}catch{
  console.error("SITE_URL must be a production HTTPS domain, e.g. https://www.present-service.pl/");
  process.exit(1);
}
const privacyPage=fs.readFileSync("informacje-o-danych.html","utf8");
if(/nie stanowi pełnej polityki prywatności|Wersja demonstracyjna|Treść jest informacją projektową/i.test(privacyPage)){
  console.error("Production export blocked: replace the demonstrational legal notice with the company's approved privacy policy.");
  process.exit(1);
}
const target=path.join(process.cwd(),"dist");
fs.rmSync(target,{recursive:true,force:true});
fs.mkdirSync(target,{recursive:true});
const originals=fs.readdirSync(process.cwd()).filter(name=>/\.(html|css|js|svg|png|webmanifest)$/.test(name));
const pages=originals.filter(name=>name.endsWith(".html"));
for(const f of originals){
  if(f.endsWith(".html"))continue;
  fs.copyFileSync(path.join(process.cwd(),f),path.join(target,f));
}
if(fs.existsSync("assets"))fs.cpSync("assets",path.join(target,"assets"),{recursive:true});
fs.writeFileSync(path.join(target,".nojekyll"),"");
const company={
  "@context":"https://schema.org","@type":"Organization",
  "name":"Present-Service Sp. z o.o. Sp. k.",
  "url":base.toString(),
  "email":"biuro@present-service.pl",
  "telephone":"+48 61 813 15 14",
  "address":{"@type":"PostalAddress","streetAddress":"ul. Armii Poznań 2","postalCode":"62-030","addressLocality":"Luboń","addressCountry":"PL"}
};
for(const page of pages){
  let html=fs.readFileSync(page,"utf8");
  html=html.replace(/<meta\s+name="robots"\s+content="noindex,nofollow"\s*\/?\s*>/gi,'<meta name="robots" content="index,follow">');
  const canonical=new URL(page==="index.html"?"":page,base).href;
  const seo='<link rel="canonical" href="'+canonical+'">\n  <meta property="og:url" content="'+canonical+'">';
  html=html.replace("</head>","  "+seo+"\n</head>");
  if(page==="index.html"){
    const schema='<script type="application/ld+json">'+JSON.stringify(company).replace(/</g,"\\u003c")+'</script>';
    html=html.replace("</head>","  "+schema+"\n</head>");
  }
  html=html.replace("Nowa wersja strony — podgląd projektu","").replace("Podgląd projektu — nie jest stroną produkcyjną","");
  fs.writeFileSync(path.join(target,page),html);
}
const sitemap='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  +pages.map(p=>'<url><loc>'+new URL(p==="index.html"?"":p,base).href+'</loc></url>').join("\n")
  +'\n</urlset>\n';
fs.writeFileSync(path.join(target,"sitemap.xml"),sitemap);
fs.writeFileSync(path.join(target,"robots.txt"),"User-agent: *\nAllow: /\nSitemap: "+new URL("sitemap.xml",base).href+"\n");
console.log("Production export:",target,"site:",base.toString(),"pages:",pages.length);
console.log("Before deployment: verify hosting redirects, approved privacy policy and mail service.");
