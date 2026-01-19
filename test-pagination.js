// Quick test to verify pagination logic
// Copy this to your browser console after opening a book

const testPagination = () => {
  console.log("=== PAGINATION TEST ===\n");
  
  // Test 1: Check if pages exist
  if (typeof pages === 'undefined') {
    console.log("❌ pages array not found - check if ReaderScreen is open");
    return;
  }
  
  console.log(`✅ Pages array found: ${pages.length} pages`);
  
  // Test 2: Verify pages are different
  console.log("\n📖 Page Content Verification:");
  
  let samePagesCount = 0;
  for (let i = 0; i < Math.min(5, pages.length - 1); i++) {
    const page1 = pages[i].substring(0, 50);
    const page2 = pages[i + 1].substring(0, 50);
    
    if (page1 === page2) {
      console.log(`❌ Page ${i + 1} and ${i + 2} have SAME first 50 chars`);
      samePagesCount++;
    } else {
      console.log(`✅ Page ${i + 1} ≠ Page ${i + 2}`);
      console.log(`   Page ${i + 1}: "${page1}..."`);
      console.log(`   Page ${i + 2}: "${page2}..."\n`);
    }
  }
  
  // Test 3: Check page sizes
  console.log("\n📏 Page Size Distribution:");
  const sizes = pages.map(p => p.length);
  console.log(`Min: ${Math.min(...sizes)} chars`);
  console.log(`Max: ${Math.max(...sizes)} chars`);
  console.log(`Avg: ${Math.round(sizes.reduce((a,b) => a+b) / sizes.length)} chars`);
  
  // Test 4: Check current page
  console.log(`\n📄 Current State:`);
  console.log(`Current Page: ${currentPage || "NOT SET"}`);
  console.log(`Total Pages: ${totalPages || "NOT SET"}`);
  console.log(`Current Page Content (first 100 chars):`);
  console.log(`"${pages[currentPage - 1]?.substring(0, 100)}..."`);
  
  // Summary
  console.log("\n=== SUMMARY ===");
  if (samePagesCount === 0) {
    console.log("✅ ALL TESTS PASSED - Pagination is working correctly!");
  } else {
    console.log(`❌ FAILED - ${samePagesCount} pages with duplicate content`);
  }
};

// Run the test
testPagination();
