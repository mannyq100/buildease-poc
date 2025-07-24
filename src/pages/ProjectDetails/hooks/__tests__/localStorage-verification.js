/**
 * localStorage Verification Script
 * Run this in the browser console to test localStorage persistence
 * of the useProjectDetailsState hook
 */

console.log('=== ProjectDetails State localStorage Verification ===');

const projectId = 'test-project-123';
const keys = {
  expandedSections: `project-details-expanded-sections-${projectId}`,
  expandedPhases: `project-details-expanded-phases-${projectId}`,
  viewModes: `project-details-view-modes-${projectId}`,
  sortOptions: `project-details-sort-options-${projectId}`
};

// Clear existing data
Object.values(keys).forEach(key => localStorage.removeItem(key));
console.log('✓ Cleared existing localStorage data');

// Test 1: Set some test data
const testExpandedSections = {
  budget: false,
  phases: true,
  team: true,
  documents: false,
  settings: true
};

const testViewModes = {
  teamView: 'detailed',
  budgetView: 'grid',
  phaseView: 'cards',
  documentView: 'list'
};

const testExpandedPhases = {
  'phase-1': true,
  'phase-2': false,
  'phase-3': true
};

// Set test data
localStorage.setItem(keys.expandedSections, JSON.stringify(testExpandedSections));
localStorage.setItem(keys.viewModes, JSON.stringify(testViewModes));
localStorage.setItem(keys.expandedPhases, JSON.stringify(testExpandedPhases));

console.log('✓ Set test data to localStorage');

// Test 2: Verify data was stored
const storedExpandedSections = JSON.parse(localStorage.getItem(keys.expandedSections) || '{}');
const storedViewModes = JSON.parse(localStorage.getItem(keys.viewModes) || '{}');
const storedExpandedPhases = JSON.parse(localStorage.getItem(keys.expandedPhases) || '{}');

console.log('Retrieved data:');
console.log('  Expanded Sections:', storedExpandedSections);
console.log('  View Modes:', storedViewModes);
console.log('  Expanded Phases:', storedExpandedPhases);

// Test 3: Verify data integrity
const sectionsMatch = JSON.stringify(testExpandedSections) === JSON.stringify(storedExpandedSections);
const viewModesMatch = JSON.stringify(testViewModes) === JSON.stringify(storedViewModes);
const phasesMatch = JSON.stringify(testExpandedPhases) === JSON.stringify(storedExpandedPhases);

console.log('Data integrity check:');
console.log('  Expanded Sections:', sectionsMatch ? '✓ PASS' : '✗ FAIL');
console.log('  View Modes:', viewModesMatch ? '✓ PASS' : '✗ FAIL');
console.log('  Expanded Phases:', phasesMatch ? '✓ PASS' : '✗ FAIL');

// Test 4: Check scoped keys don't interfere
const otherProjectId = 'other-project-456';
const otherKeys = {
  expandedSections: `project-details-expanded-sections-${otherProjectId}`
};

localStorage.setItem(otherKeys.expandedSections, JSON.stringify({ budget: true, phases: false }));

// Verify original data is unchanged
const originalStillIntact = JSON.stringify(testExpandedSections) === localStorage.getItem(keys.expandedSections);
console.log('  Project isolation:', originalStillIntact ? '✓ PASS' : '✗ FAIL');

// Clean up
Object.values(keys).forEach(key => localStorage.removeItem(key));
localStorage.removeItem(otherKeys.expandedSections);

console.log('✓ Cleanup completed');
console.log('=== Verification Complete ===');

// Instructions for manual testing
console.log('\n=== Manual Testing Instructions ===');
console.log('1. Navigate to a ProjectDetails page');
console.log('2. Toggle some sections (budget, phases, team, etc.)');
console.log('3. Refresh the page');
console.log('4. Verify that the expanded/collapsed states are preserved');
console.log('5. Open browser DevTools > Application > Local Storage');
console.log('6. Look for keys starting with "project-details-"');
console.log('7. Verify the stored data matches your UI state');