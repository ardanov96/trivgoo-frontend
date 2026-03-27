// audit-hardcode.cjs
// Scan semua TSX public pages untuk teks hardcode yang belum pakai t()
// Hasilnya dikelompokkan per file dengan konteks barisnya
const fs = require('fs');

function walkDir(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const item of fs.readdirSync(dir)) {
    const full = dir + '/' + item;
    const stat = fs.statSync(full);
    if (stat.isDirectory() && !['node_modules','.git','admin','agent'].includes(item)) {
      results.push(...walkDir(full));
    } else if (item.endsWith('.tsx')) {
      results.push(full);
    }
  }
  return results;
}

// Pola JSX text yang hardcode (bukan di dalam t(), className, import, komentar)
const ID_PATTERNS = [
  // Kata bahasa Indonesia umum
  /[>{\s]["']([^"'<>{}\n]{3,}(?:kami|Kami|anda|Anda|kamu|Kamu|saya|Saya|tidak|Tidak|dengan|Dengan|untuk|Untuk|dari|Dari|atau|Atau|dan|Dan|yang|Yang|ini|Ini|itu|Itu|nya|kan|lah|pun)[^"'<>{}\n]*)["']/,
  // Teks JSX langsung (antara tag)
  />([A-Z][a-z]+ [a-zA-Z ]{5,})</,
];

const EN_PATTERNS = [
  // Kata bahasa Inggris umum dalam UI
  /["'>]([A-Z][a-z]+(?: [A-Za-z]+){1,6})["'<]/,
];

// Pattern yang jelas hardcode dalam JSX
const HARDCODE_PATTERNS = [
  // String di antara tag JSX: >Teks hardcode<
  { regex: />([A-Za-z][^<>{}\n]{4,})</g, type: 'JSX_TEXT' },
  // String literal yang bukan className/key/type/placeholder yang sudah di-t()
  { regex: /(?:placeholder|title|label|value|text)=["']([^"']{5,})["']/g, type: 'ATTR' },
];

const IGNORE_PATTERNS = [
  /^\s*\/\//,           // comment
  /import /,            // import statement
  /className/,          // className
  /t\(/,                // already translated
  /console\./,          // console log
  /^\s*\*\s/,           // JSDoc
  /https?:\/\//,        // URL
  /^\s*<\//,            // closing tag
  /[{}<>]/,             // JSX expression
  /^[0-9.,:/\-+%]+$/,   // numbers/symbols only
];

function isIndonesian(text) {
  const idWords = ['kami','kamu','anda','saya','tidak','dengan','untuk','dari','atau','dan','yang','ini','itu','nya','kan','lah','pun','ada','pada','ke','di','jika','saat','akan','bisa','harus','sudah','belum','juga','lagi','masih','lebih','sangat','semua','setiap','setelah','sebelum','karena','ketika','namun','tetapi','bahwa','oleh','antara','dalam','keluar','masuk','tutup','buka','simpan','hapus','ubah','cari','lihat','kirim','buat','tambah','daftar','masuk','keluar','halaman','produk','pesanan','pembayaran','akun','profil','nama','email','telepon','kata','sandi','konfirmasi'];
  const lower = text.toLowerCase();
  return idWords.some(w => lower.includes(w));
}

function isEnglish(text) {
  const enWords = ['the','and','or','for','with','from','that','this','these','those','your','our','their','have','has','will','can','should','would','could','please','enter','select','choose','click','submit','cancel','confirm','save','delete','edit','search','view','back','next','home','login','logout','register','account','profile','email','phone','password','booking','payment','order','product','cart','wishlist','explore','contact','help','about','terms','privacy'];
  const lower = text.toLowerCase();
  return enWords.some(w => {
    const idx = lower.indexOf(w);
    if (idx === -1) return false;
    // Word boundary check
    const before = idx === 0 || /\W/.test(lower[idx-1]);
    const after = idx + w.length >= lower.length || /\W/.test(lower[idx + w.length]);
    return before && after;
  });
}

const files = walkDir('pages');
const report = { id: [], en: [], mixed: [], unknown: [] };
let totalHardcode = 0;

for (const filepath of files) {
  const content = fs.readFileSync(filepath, 'utf8');
  const lines = content.split('\n');
  const fileHardcode = [];

  lines.forEach((line, lineIdx) => {
    // Skip lines that are clearly not UI text
    if (IGNORE_PATTERNS.some(p => p.test(line))) return;
    if (line.includes("t('") || line.includes('t("')) return; // already translated
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) return;
    if (line.trim().startsWith('import')) return;

    // Find JSX text content: text between > and <
    const jsxTextMatch = line.match(/>([A-Za-zA-Z][^<>{}\n\t]{4,})</);
    if (jsxTextMatch) {
      const text = jsxTextMatch[1].trim();
      if (text.length < 4) return;
      if (/^[\d\s.,:/\-+%]+$/.test(text)) return; // numbers only
      if (text.startsWith('{') || text.endsWith('}')) return; // JSX expr

      fileHardcode.push({
        line: lineIdx + 1,
        text: text.substring(0, 80),
        lang: isIndonesian(text) ? 'ID' : isEnglish(text) ? 'EN' : '??',
        context: line.trim().substring(0, 100),
      });
    }

    // Find string literals in JSX attributes (placeholder, etc) that aren't translated
    const attrMatch = line.match(/(?:placeholder|aria-label)=["']([^"']{5,})["']/);
    if (attrMatch && !line.includes("t('")) {
      const text = attrMatch[1].trim();
      fileHardcode.push({
        line: lineIdx + 1,
        text: text.substring(0, 80),
        lang: isIndonesian(text) ? 'ID' : isEnglish(text) ? 'EN' : '??',
        context: line.trim().substring(0, 100),
        type: 'PLACEHOLDER',
      });
    }
  });

  if (fileHardcode.length > 0) {
    totalHardcode += fileHardcode.length;
    const idCount = fileHardcode.filter(h => h.lang === 'ID').length;
    const enCount = fileHardcode.filter(h => h.lang === 'EN').length;

    report[idCount > enCount ? 'id' : enCount > idCount ? 'en' : 'mixed'].push({
      file: filepath,
      items: fileHardcode,
      idCount,
      enCount,
    });
  }
}

// Write report
const lines = [
  '# Hardcoded Text Audit Report',
  `Generated: ${new Date().toISOString()}`,
  `Total hardcoded strings found: ${totalHardcode}`,
  '',
  '---',
  '',
];

const allFiles = [...report.id, ...report.en, ...report.mixed, ...report.unknown]
  .sort((a, b) => (b.idCount + b.enCount) - (a.idCount + a.enCount));

for (const f of allFiles) {
  lines.push(`## ${f.file}`);
  lines.push(`ID: ${f.idCount} | EN: ${f.enCount} | Total: ${f.items.length}`);
  lines.push('');
  for (const item of f.items.slice(0, 20)) { // max 20 per file
    lines.push(`  Line ${item.line} [${item.lang}]: ${item.text}`);
  }
  if (f.items.length > 20) {
    lines.push(`  ... and ${f.items.length - 20} more`);
  }
  lines.push('');
}

fs.writeFileSync('hardcode-audit.txt', lines.join('\n'), 'utf8');
console.log(`✅ Audit complete! Found ${totalHardcode} hardcoded strings`);
console.log(`   Files with mostly ID text: ${report.id.length}`);
console.log(`   Files with mostly EN text: ${report.en.length}`);
console.log(`   Files with mixed text:     ${report.mixed.length}`);
console.log('\n📄 Full report saved to: hardcode-audit.txt');
console.log('\nTop 10 files with most hardcode:');
allFiles.slice(0, 10).forEach((f, i) => {
  console.log(`  ${i+1}. ${f.file} (ID:${f.idCount} EN:${f.enCount})`);
});
