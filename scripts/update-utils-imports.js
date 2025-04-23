/**
 * Update utils imports script
 * This script updates imports from @/lib/utils to @/utils/core
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name using ES module approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the source directory
const SRC_DIR = path.join(__dirname, '../src');

// Map of imports that need to be updated
const IMPORT_MAP = {
  // Map each import to its new location
  'cn': '@/utils/core/ui',
  'darkModeDetector': '@/utils/core/ui',
  'getThemeColor': '@/utils/core/ui',
  
  'debounce': '@/utils/core/performance',
  'memoize': '@/utils/core/performance',
  'throttle': '@/utils/core/performance',
  'measurePerformance': '@/utils/core/performance',
  'delay': '@/utils/core/performance',
  
  // Date utils - assuming these come from the new date.ts
  'formatDate': '@/utils/core/date',
  'formatDateTime': '@/utils/core/date',
  'getDaysRemaining': '@/utils/core/date',
  'formatRelativeTime': '@/utils/core/date',
  'isDateInRange': '@/utils/core/date',
  'getMonthName': '@/utils/core/date',
  
  // Format utils
  'formatNumber': '@/utils/core/format',
  'formatCurrency': '@/utils/core/format',
  'formatPercent': '@/utils/core/format',
  'formatFileSize': '@/utils/core/format',
  'truncateText': '@/utils/core/format',
  
  // Error utils
  'handleError': '@/utils/core/error',
  'createErrorMessage': '@/utils/core/error',
  'logError': '@/utils/core/error',
  
  // Validation utils
  'validateEmail': '@/utils/core/validation',
  'validateRequired': '@/utils/core/validation',
  'validateLength': '@/utils/core/validation',
  'validatePhone': '@/utils/core/validation',
  'validateNumber': '@/utils/core/validation'
};

// Old import paths to find and replace
const OLD_IMPORT_PATHS = ['@/lib/utils', '@/utils'];

// Function to recursively walk through directories
function walkSync(dir, callback) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filepath = path.join(dir, file);
    const stats = fs.statSync(filepath);
    
    if (stats.isDirectory()) {
      walkSync(filepath, callback);
    } else if (stats.isFile() && (filepath.endsWith('.ts') || filepath.endsWith('.tsx'))) {
      callback(filepath);
    }
  });
}

// Function to process a file and update imports
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Skip processing if this is one of our new utility files
  if (filePath.includes('/utils/core/') || filePath.includes('/utils/domain/')) {
    return false;
  }
  
  // Process each old import path
  for (const oldPath of OLD_IMPORT_PATHS) {
    // Check for imports from the old path
    if (content.includes(`from '${oldPath}'`) || content.includes(`from "${oldPath}"`)) {
      console.log(`Processing: ${filePath}`);
      
      // Find and process import statements for the current old path
      const importRegex = new RegExp(`import\\s+\\{([^}]+)\\}\\s+from\\s+['"](${oldPath})['"];?`, 'g');
      
      // Extract all imports from this path
      let importMatches = [];
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        importMatches.push({
          fullMatch: match[0],
          importItems: match[1].split(',').map(item => item.trim()),
          oldPath: match[2]
        });
      }
      
      // Process each import statement
      for (const importMatch of importMatches) {
        // Group imports by new module path
        const newImportsByPath = {};
        const unknownImports = [];
        
        for (const item of importMatch.importItems) {
          // Handle aliased imports (e.g., 'cn as classNames')
          const [importName, alias] = item.split(' as ').map(part => part.trim());
          
          // Check if we know where this import should go
          if (importName in IMPORT_MAP) {
            const newPath = IMPORT_MAP[importName];
            if (!newImportsByPath[newPath]) {
              newImportsByPath[newPath] = [];
            }
            newImportsByPath[newPath].push(alias ? `${importName} as ${alias}` : importName);
          } else {
            // Keep track of imports we don't know how to handle
            unknownImports.push(item);
          }
        }
        
        // Start with the full content
        let newContent = content;
        
        // Replace the original import statement
        if (Object.keys(newImportsByPath).length > 0) {
          // If all imports have been mapped, remove the old import completely
          if (unknownImports.length === 0) {
            newContent = newContent.replace(importMatch.fullMatch, '');
          } else {
            // Otherwise, leave behind the unmapped imports
            const unknownImportStatement = `import { ${unknownImports.join(', ')} } from '${importMatch.oldPath}';`;
            newContent = newContent.replace(importMatch.fullMatch, unknownImportStatement);
          }
          
          // Create and add the new import statements
          const newImportStatements = Object.entries(newImportsByPath)
            .map(([newPath, imports]) => `import { ${imports.join(', ')} } from '${newPath}';`)
            .join('\n');
          
          // Add the new imports right after the last import or at the beginning
          if (newContent.includes('import ')) {
            const lastImportMatch = [...newContent.matchAll(/import [^;]+;/g)].pop();
            if (lastImportMatch) {
              const insertPos = lastImportMatch.index + lastImportMatch[0].length;
              newContent = newContent.slice(0, insertPos) + '\n' + newImportStatements + newContent.slice(insertPos);
            }
          } else {
            newContent = newImportStatements + '\n' + newContent;
          }
          
          // Update content and mark as modified
          content = newContent;
          modified = true;
        }
      }
    }
  }
  
  // Save the file if it was modified
  if (modified) {
    // Clean up any duplicate newlines that might have been introduced
    content = content.replace(/\n{3,}/g, '\n\n');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated imports in: ${filePath}`);
  }
  
  return modified;
}

// Main function
function updateImports() {
  console.log('Starting import update process...');
  let modifiedCount = 0;
  
  // Process all files in the src directory
  walkSync(SRC_DIR, filePath => {
    if (processFile(filePath)) {
      modifiedCount++;
    }
  });
  
  console.log(`\nImport update complete. Modified ${modifiedCount} files.`);
  console.log('Please review the changes and run your tests to ensure everything works correctly.');
}

// Run the update process
updateImports();
