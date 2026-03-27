// inject-triptype-ui.cjs
const fs = require('fs');
const path = 'pages/agent/AddProduct.tsx';
const lines = fs.readFileSync(path, 'utf8').split('\n');

const ANCHOR = '              <div className="space-y-6 animate-in fade-in">';
const TRIP_TYPE_UI = `              <div className="space-y-6 animate-in fade-in">
                {/* ── Trip Type ── */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    Trip Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { value: 'Open Trip' as const,    label: 'Open Trip',    desc: 'Min. 2 peserta', icon: '🌐' },
                      { value: 'Private Trip' as const, label: 'Private Trip', desc: 'Min. 1 peserta', icon: '🔒' },
                      { value: 'Group Trip' as const,   label: 'Group Trip',   desc: 'Min. 6 peserta', icon: '👥' },
                    ]).map(opt => (
                      <button key={opt.value} type="button"
                        onClick={() => setTourDetails({ ...tourDetails, tripType: opt.value })}
                        className={\`relative p-3 rounded-xl border-2 text-left transition-all \${
                          tourDetails.tripType === opt.value
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }\`}
                      >
                        {tourDetails.tripType === opt.value && (
                          <div className="absolute -top-2 -right-2 bg-primary-600 text-white rounded-full p-0.5 shadow-sm">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                        <span className="text-lg mb-1 block">{opt.icon}</span>
                        <p className={\`text-xs font-bold \${tourDetails.tripType === opt.value ? 'text-primary-700' : 'text-gray-800'}\`}>{opt.label}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-blue-600 bg-blue-50 rounded-lg px-3 py-2 mt-2 flex items-center gap-1.5">
                    <span>ℹ️</span>
                    {tourDetails.tripType === 'Open Trip' && 'Peserta dari berbagai grup bergabung. Minimum 2 peserta.'}
                    {tourDetails.tripType === 'Private Trip' && 'Paket eksklusif untuk satu grup/individu. Minimum 1 peserta.'}
                    {tourDetails.tripType === 'Group Trip' && 'Paket khusus grup besar. Minimum 6 peserta.'}
                  </p>
                </div>`;

let found = false;
const result = lines.map(line => {
  if (!found && line === ANCHOR) {
    found = true;
    return TRIP_TYPE_UI;
  }
  return line;
});

if (found) {
  fs.writeFileSync(path, result.join('\n'), 'utf8');
  console.log('✅ Trip Type UI injected!');
  console.log('\nVerify:');
  const check = fs.readFileSync(path, 'utf8');
  check.split('\n').forEach((l, i) => {
    if (l.includes('Trip Type') || l.includes('tripType') || l.includes('Open Trip')) {
      console.log(`  ${i+1}: ${l.trim().substring(0, 70)}`);
    }
  });
} else {
  console.log('⚠️ Anchor not found, trying line number approach...');
  // Inject after line 1304 (0-indexed: 1303)
  const content = fs.readFileSync(path, 'utf8');
  const parts = content.split('\n');
  // Find the isTour animate-in div
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].includes('space-y-6 animate-in fade-in') && i > 1290) {
      parts[i] = TRIP_TYPE_UI;
      fs.writeFileSync(path, parts.join('\n'), 'utf8');
      console.log(`✅ Injected at line ${i+1}`);
      break;
    }
  }
}
