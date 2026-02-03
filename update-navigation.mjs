import fs from 'fs';
import path from 'path';

const pagesDirectory = path.join(process.cwd(), 'src', 'pages');
const filesToUpdate = [
  'Adoption.tsx',
  'Health.tsx',
  'Valuation.tsx',
  'ProjectDetail.tsx',
  'Measurements.tsx',
  'Governance.tsx',
  'RegenerativeAgriculture.tsx',
  'Bioregions.tsx',
  'Outreach.tsx',
  'Security.tsx'
];

filesToUpdate.forEach(fileName => {
  const filePath = path.join(pagesDirectory, fileName);
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace import
    content = content.replace(
      "import Navigation from \"@/components/Navigation\"",
      "import EnterpriseHeader from \"@/components/EnterpriseHeader\""
    );
    
    // Replace component usage
    content = content.replace(/<Navigation \/>/g, "<EnterpriseHeader />");
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${fileName}`);
  }
});

console.log('All files updated successfully!');
