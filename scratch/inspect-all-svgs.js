import fs from 'fs';
const dir = './public/categories';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.svg'));
for (const f of files) {
  const content = fs.readFileSync(`${dir}/${f}`, 'utf8');
  console.log('--- ' + f + ' ---');
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  lines.forEach(l => {
    if (l.includes('<g transform') || l.includes('<rect') || l.includes('<text')) {
      console.log('  ', l);
    }
  });
}
