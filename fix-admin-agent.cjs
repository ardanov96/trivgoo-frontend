// fix-admin-agent.cjs
// Hapus useLangNavigate import dan deklarasi dari semua admin & agent pages
// Admin/agent tidak perlu i18n translation
const fs = require('fs');

function walkDir(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const item of fs.readdirSync(dir)) {
    const full = dir + '/' + item;
    const stat = fs.statSync(full);
    if (stat.isDirectory() && !['node_modules', '.git'].includes(item)) {
      results.push(...walkDir(full));
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      results.push(full);
    }
  }
  return results;
}

// Target: semua file di pages/admin/ dan pages/agent/
const adminFiles = walkDir('pages/admin');
const agentFiles = walkDir('pages/agent');
const allFiles   = [...adminFiles, ...agentFiles];

console.log(`\n🔧 Processing ${allFiles.length} admin/agent files...\n`);

let fixedCount = 0;

for (const filepath of allFiles) {
  let content = fs.readFileSync(filepath, 'utf8');
  const original = content;

  // 1. Hapus import useLangNavigate
  content = content.replace(
    /^import \{ useLangNavigate \} from '[^']+';?\s*\n/gm, ''
  );
  content = content.replace(
    /^import \{ useLangNavigate \} from "[^"]+";?\s*\n/gm, ''
  );

  // 2. Hapus deklarasi const { langPath } = useLangNavigate();
  content = content.replace(
    /\s*const \{ langPath(?:, langNavigate)? \} = useLangNavigate\(\);\s*\n/g, '\n'
  );
  content = content.replace(
    /\s*const \{ langNavigate(?:, langPath)? \} = useLangNavigate\(\);\s*\n/g, '\n'
  );
  content = content.replace(
    /\s*const \{ langNavigate \} = useLangNavigate\(\);\s*\n/g, '\n'
  );
  content = content.replace(
    /\s*const \{ langPath \} = useLangNavigate\(\);\s*\n/g, '\n'
  );

  // 3. Ganti langNavigate('/path') dengan navigate('/path')
  //    Cek dulu apakah ada useNavigate yang bisa dipakai
  if (content.includes('langNavigate(') && !content.includes('langNavigate is not defined')) {
    // Ganti langNavigate dengan navigate
    content = content.replace(/langNavigate\(/g, 'navigate(');
    
    // Pastikan useNavigate sudah diimport
    if (!content.includes('useNavigate')) {
      content = content.replace(
        /from 'react-router-dom'/,
        "from 'react-router-dom'"
      );
      // Add useNavigate to react-router-dom import
      content = content.replace(
        /import \{([^}]+)\} from 'react-router-dom'/,
        (match, imports) => {
          if (!imports.includes('useNavigate')) {
            return `import {${imports}, useNavigate } from 'react-router-dom'`;
          }
          return match;
        }
      );
    }
    
    // Pastikan const navigate = useNavigate() ada di komponen
    if (!content.includes('const navigate = useNavigate()') && 
        !content.includes('const navigate=useNavigate()')) {
      // Inject after component declaration
      content = content.replace(
        /(const \w+[^=]*=\s*\([^)]*\)\s*=>\s*\{)\n/,
        '$1\n  const navigate = useNavigate();\n'
      );
    }
  }

  // 4. Ganti langPath('/path') dengan '/path' (admin/agent tidak perlu prefix lang)
  content = content.replace(/langPath\((['"`][^'"`]+['"`])\)/g, '$1');
  content = content.replace(/langPath\(`([^`]+)`\)/g, '`$1`');

  // 5. Hapus import useTranslation jika tidak dipakai
  if (!content.includes('useTranslation') || 
      (!content.includes("const { t }") && content.includes("from 'react-i18next'"))) {
    // Check if useTranslation is actually used
    const withoutImport = content.replace(/import \{ useTranslation \}[^\n]+\n/, '');
    if (!withoutImport.includes('useTranslation') && !withoutImport.includes('const { t }')) {
      content = content.replace(/import \{ useTranslation \} from 'react-i18next';\s*\n/g, '');
    }
  }

  // 6. Hapus const { t } = useTranslation() jika tidak ada t() calls
  if (content.includes("const { t } = useTranslation()")) {
    // Count t() usage (excluding const { t } declaration)
    const withoutDecl = content.replace(/const \{ t \} = useTranslation\(\);/, '');
    const tUsageCount = (withoutDecl.match(/\bt\(/g) || []).length;
    if (tUsageCount === 0) {
      content = content.replace(/\s*const \{ t \} = useTranslation\(\);\s*\n/, '\n');
      content = content.replace(/import \{ useTranslation \} from 'react-i18next';\s*\n/g, '');
    }
  }

  // Clean up multiple empty lines
  content = content.replace(/\n{3,}/g, '\n\n');

  if (content !== original) {
    fs.writeFileSync(filepath, content, 'utf8');
    fixedCount++;
    console.log(`✅ CLEANED: ${filepath}`);
  }
}

console.log(`\n✨ Done! Cleaned ${fixedCount} files.`);
console.log('\nVerify no more useLangNavigate in admin/agent:');
console.log('grep -rn "useLangNavigate" pages/admin pages/agent');
