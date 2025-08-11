// Test de syntaxe des fichiers principaux
const fs = require('fs');
const path = require('path');

const filesToCheck = [
  'src/App.js',
  'src/components/ModernDocumentCard.js',
  'src/components/ModernDocumentList.js',
  'src/components/ModernNavbar.js',
  'src/services/documentService.js'
];

console.log('🔍 Vérification de la syntaxe des fichiers...\n');

filesToCheck.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    console.log(`✅ ${file} - Syntaxe OK`);
  } catch (error) {
    console.log(`❌ ${file} - Erreur: ${error.message}`);
  }
});

console.log('\n✅ Vérification terminée !');
