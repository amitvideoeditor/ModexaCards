import fs from 'fs';
const dir = './public/categories';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.svg'));

for (const file of files) {
  const filePath = `${dir}/${file}`;
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Remove stroke frame from glass rect
  content = content.replace(
    /stroke="rgba\(255,255,255,0\.35\)"\s*stroke-width="2"/g,
    ''
  );

  // 2. Remove pill label rect (y="212")
  content = content.replace(
    /\s*<!-- Pill Label -->\s*<rect[^>]*y="212"[^>]*\/>/g,
    ''
  );
  content = content.replace(
    /\s*<rect[^>]*y="212"[^>]*\/>/g,
    ''
  );

  // 3. Remove text elements
  content = content.replace(
    /\s*<text[^>]*>[\s\S]*?<\/text>/g,
    ''
  );

  // 4. Center stars group from (150, 78) to (150, 92)
  content = content.replace(
    /<g transform="translate\(150,\s*78\)">/g,
    '<g transform="translate(150, 92)">'
  );

  // 5. Center icon group from (150, 142) or (150, 144) or (150, 146) to (150, 166)
  content = content.replace(
    /<g transform="translate\(150,\s*14[246]\)">/g,
    '<g transform="translate(150, 166)">'
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Cleaned ${file}`);
}
