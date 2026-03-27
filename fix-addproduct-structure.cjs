// fix-addproduct-structure.cjs
// Fix JSX structure: Duration grid hanya punya 1 item, perlu ditutup dengan benar
const fs = require('fs');
const path = 'pages/agent/AddProduct.tsx';
let content = fs.readFileSync(path, 'utf8');

// Cari dan fix broken grid structure
// Pattern rusak:
//   <div className="grid grid-cols-2 gap-6">
//     <div>
//       <label>Duration</label>
//       <input ... />
//     </div>
//     </div>      ← extra closing div dari grid
//   </div>        ← ini jadi orphan

const BROKEN = `                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Duration</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white" placeholder="e.g. 3 Days" value={tourDetails.duration} onChange={(e) => setTourDetails({ ...tourDetails, duration: e.target.value })} />
                  </div>
                  </div>
                </div>`;

const FIXED = `                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Duration</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white" placeholder="e.g. 3 Days" value={tourDetails.duration} onChange={(e) => setTourDetails({ ...tourDetails, duration: e.target.value })} />
                  </div>
                </div>`;

if (content.includes(BROKEN)) {
  content = content.replace(BROKEN, FIXED);
  fs.writeFileSync(path, content, 'utf8');
  console.log('✅ Fixed broken grid structure');
} else {
  console.log('⚠️  Pattern not found exactly, checking manually...');
  // Find lines with the issue
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('tourDetails.duration') && lines[i].includes('onChange')) {
      console.log(`Duration input at line ${i+1}`);
      console.log('Context:');
      for (let j = Math.max(0, i-3); j <= Math.min(lines.length-1, i+5); j++) {
        console.log(`  ${j+1}: ${lines[j]}`);
      }
    }
  }
}
