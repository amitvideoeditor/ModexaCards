import fs from 'fs';
const dir = './public/categories';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.svg'));
for (const f of files) {
  const content = fs.readFileSync(`${dir}/${f}`, 'utf8');
  const textMatches = [...content.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g)].map(m => m[1].trim());
  const hasStroke = content.includes('stroke="rgba(255,255,255,0.35)"');
  console.log(f, '=> Texts:', textMatches.join(' | '), '=> Frame:', hasStroke);
}
