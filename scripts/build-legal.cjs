// Legal copy is exported from the app by scripts/export-website-legal.cjs.
// After updating legal-data.json, run: node scripts/build-legal.cjs
const fs = require('node:fs');
const path = require('node:path');
const root = process.argv[2] || path.resolve(__dirname, '..');
const { documents, contactEmail } = JSON.parse(fs.readFileSync(path.join(root, 'legal-data.json'), 'utf8'));
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const navItems = [['terms', 'Terms'], ['privacy', 'Privacy'], ['delete-account', 'Delete account']];
const header = kind => `<header class="legal-header"><a href="/" class="legal-brand" aria-label="LifeTask home"><img src="assets/atelier-v6-20260910/lifetask-logo-v2.webp" width="48" height="48" alt="LifeTask"></a><nav aria-label="Legal pages">${navItems.map(([key,label]) => `<a href="/${key}.html"${key===kind?' aria-current="page"':''}>${label}</a>`).join('')}</nav></header>`;
const paragraph = value => `<p>${escape(value)}</p>`;
for (const document of documents) {
  const sections = document.sections.map((section,index) => `<section id="section-${index+1}" aria-labelledby="heading-${index+1}"><h2 id="heading-${index+1}">${escape(section.title)}</h2>${(section.paragraphs||[]).map(paragraph).join('')}${section.bullets?.length?`<ul>${section.bullets.map(item=>`<li>${escape(item)}</li>`).join('')}</ul>`:''}${(section.closingParagraphs||[]).map(paragraph).join('')}${section.links?.length?`<div class="document-links">${section.links.map(link=>`<a href="${escape(link.url.startsWith('/')?link.url+'.html':link.url)}">${escape(link.label)} <span aria-hidden="true">↗</span></a>`).join('')}</div>`:''}</section>`).join('\n');
  const toc = `<details class="legal-contents"><summary>On this page</summary><ol>${document.sections.map((section,index)=>`<li><a href="#section-${index+1}">${escape(section.title.replace(/^\d+\.\s*/,''))}</a></li>`).join('')}</ol></details>`;
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(document.title)} | LifeTask</title><meta name="description" content="${escape(document.description)}"><link rel="icon" href="assets/atelier-v6-20260910/lifetask-logo-v2.webp"><link rel="stylesheet" href="legal.css"></head>
<body><a class="skip-link" href="#document">Skip to document</a><div class="legal-shell">${header(document.kind)}<main id="document"><div class="legal-intro"><h1>${escape(document.title)}</h1><p class="legal-description">${escape(document.description)}</p><p class="legal-date">Effective and last updated: ${escape(document.updatedAt)}</p></div>${toc}<article>${sections}</article></main><footer class="legal-footer"><a href="/">← Back to LifeTask</a><a href="mailto:${escape(contactEmail)}">${escape(contactEmail)}</a><span>© ${new Date().getFullYear()} LifeTask</span></footer></div></body></html>\n`;
  fs.writeFileSync(path.join(root, document.kind+'.html'), html);
}
console.log(`Built ${documents.length} public legal pages.`);
