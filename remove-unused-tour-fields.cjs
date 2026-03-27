// remove-unused-tour-fields.cjs
const fs = require('fs');

// ── 1. types.ts — hapus field dari TourDetails ────────────────────────────
console.log('🔧 Updating types.ts...');
const typesPath = 'types.ts';
let types = fs.readFileSync(typesPath, 'utf8');

// Hapus field dari interface
['  groupSize: string;\n', '  difficulty: "Easy" | "Moderate" | "Hard";\n', '  ageRestriction?: string;\n', '  meetingPoint: string;\n']
  .forEach(field => { types = types.replace(field, ''); });

fs.writeFileSync(typesPath, types, 'utf8');
console.log('✅ types.ts updated');

// ── 2. AddProduct.tsx ────────────────────────────────────────────────────
console.log('\n🔧 Updating AddProduct.tsx...');
const addPath = 'pages/agent/AddProduct.tsx';
let add = fs.readFileSync(addPath, 'utf8');

// Hapus dari state
['    groupSize: "",\n', '    difficulty: "Easy" as "Easy" | "Moderate" | "Hard",\n', '    ageRestriction: "",\n', '    meetingPoint: "",\n']
  .forEach(f => { add = add.replace(f, ''); });

// Hapus dari edit mode load
['                  groupSize: product.details.groupSize,\n', '                  difficulty: product.details.difficulty,\n', '                  ageRestriction: product.details.ageRestriction || "",\n', '                  meetingPoint: product.details.meetingPoint,\n']
  .forEach(f => { add = add.replace(f, ''); });

// Hapus dari buildDetails()
['        groupSize: tourDetails.groupSize || "Flexible",\n', '        difficulty: tourDetails.difficulty,\n', '        meetingPoint: tourDetails.meetingPoint,\n', '        ageRestriction: tourDetails.ageRestriction,\n']
  .forEach(f => { add = add.replace(f, ''); });

// Hapus form UI blocks
// Difficulty select
add = add.replace(
  /\s*<div>\s*\n\s*<label[^>]*>Difficulty<\/label>\s*\n\s*<select[^>]*>[\s\S]*?<\/select>\s*\n\s*<\/div>/,
  ''
);
// Group Size input
add = add.replace(
  /\s*<div>\s*\n\s*<label[^>]*>Group Size<\/label>\s*\n\s*<input[^>]*groupSize[^>]*\/>\s*\n\s*<\/div>/,
  ''
);
// Meeting Point input
add = add.replace(
  /\s*<div>\s*\n\s*<label[^>]*>Meeting Point<\/label>\s*\n\s*<input[^>]*meetingPoint[^>]*\/>\s*\n\s*<\/div>/,
  ''
);

fs.writeFileSync(addPath, add, 'utf8');
console.log('✅ AddProduct.tsx updated');

// Verify
console.log('\nVerify AddProduct — these should be EMPTY:');
['groupSize', 'difficulty', 'ageRestriction', 'meetingPoint'].forEach(field => {
  const matches = add.split('\n').filter(l => l.includes(field) && !l.trim().startsWith('//'));
  if (matches.length > 0) {
    console.log(`  ⚠️  ${field} still found at:`);
    matches.forEach(l => console.log(`     ${l.trim().substring(0, 80)}`));
  } else {
    console.log(`  ✅ ${field} removed`);
  }
});

// ── 3. Verify types.ts ────────────────────────────────────────────────────
console.log('\nVerify types.ts TourDetails:');
const tourStart = types.indexOf('export interface TourDetails');
const tourEnd = types.indexOf('}', tourStart) + 1;
console.log(types.substring(tourStart, tourEnd));
