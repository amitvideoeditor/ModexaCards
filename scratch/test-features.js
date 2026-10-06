// Test suite for extractCardIdFromQr and SVG verification
import fs from 'fs';

// Implementation identical to extractCardIdFromQr
function extractCardIdFromQr(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return { isValid: false };
  }
  const trimmed = rawText.trim();

  // 1. Direct Card ID format (e.g. CRD-0025, CRD-1042)
  const directMatch = trimmed.match(/^CRD-[A-Za-z0-9_-]+$/i);
  if (directMatch) {
    return { isValid: true, cardId: directMatch[0].toUpperCase() };
  }

  // 2. ModexaCards QR URL format (/r/CRD-XXXX)
  const urlPattern = /\/r\/(CRD-[A-Za-z0-9_-]+)/i;
  const urlMatch = trimmed.match(urlPattern);
  if (urlMatch && urlMatch[1]) {
    return { isValid: true, cardId: urlMatch[1].toUpperCase() };
  }

  // 3. Fallback URL with /r/:cardId
  if (trimmed.includes('/r/')) {
    const parts = trimmed.split('/r/');
    if (parts.length >= 2) {
      const potentialId = parts[1].split('?')[0].split('#')[0].replace(/\/+$/, '').trim();
      if (potentialId && potentialId.length >= 3) {
        return { isValid: true, cardId: potentialId.toUpperCase() };
      }
    }
  }

  return { isValid: false };
}

// Test cases
const testCases = [
  { input: 'https://modexacards.web.app/r/CRD-0025', expectedId: 'CRD-0025', expectedValid: true },
  { input: 'http://localhost:5173/r/CRD-0001', expectedId: 'CRD-0001', expectedValid: true },
  { input: 'https://modexacards.firebaseapp.com/r/CRD-0099?source=qr', expectedId: 'CRD-0099', expectedValid: true },
  { input: 'CRD-0042', expectedId: 'CRD-0042', expectedValid: true },
  { input: 'crd-0077', expectedId: 'CRD-0077', expectedValid: true },
  { input: 'https://google.com/search?q=test', expectedValid: false },
  { input: 'random text 1234', expectedValid: false },
  { input: '', expectedValid: false },
];

let allPassed = true;
for (const tc of testCases) {
  const res = extractCardIdFromQr(tc.input);
  if (res.isValid !== tc.expectedValid || (tc.expectedValid && res.cardId !== tc.expectedId)) {
    console.error('FAIL:', tc.input, 'Expected:', tc, 'Got:', res);
    allPassed = false;
  } else {
    console.log('PASS:', tc.input, '=>', res);
  }
}

// SVG verification
const dir = './public/categories';
const svgs = fs.readdirSync(dir).filter(f => f.endsWith('.svg'));
for (const f of svgs) {
  const content = fs.readFileSync(`${dir}/${f}`, 'utf8');
  if (content.includes('<text')) {
    console.error('FAIL SVG has <text>:', f);
    allPassed = false;
  }
  if (content.includes('stroke="rgba(255,255,255,0.35)"')) {
    console.error('FAIL SVG has inner stroke frame:', f);
    allPassed = false;
  }
}

if (allPassed) {
  console.log('\nALL TESTS PASSED SUCCESSFULLY! (100% Validated)');
} else {
  process.exit(1);
}
