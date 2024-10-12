// lootsearch.js

let selectedCategory = 'Weapons';  // Default category

// Set the current category based on tab selection
function setCategory(category) {
    console.log('setCategory function triggered');  // Log when the function is triggered
    selectedCategory = category;  // Update the selected category
    console.log(`Category set to: ${selectedCategory}`);  // Log the selected category
    searchItems();  // Perform the search for the selected category
  }
  

// Search function to handle items search by category and name
function searchItems() {
  const searchTerm = document.getElementById('item-search').value.trim();

  if (searchTerm && selectedCategory) {
    handleSearch(selectedCategory, searchTerm);  // Pass selectedCategory as the collection name
  }
}

// Handle search logic for the selected category
async function handleSearch(category, searchTerm) {
  console.log(`Searching in category: ${category} for term: ${searchTerm}`);
  
  try {
    const { items } = await getItems(category, searchTerm);  // Fetch items from the correct collection
    displayResults(items);  // Display the results in the UI
  } catch (error) {
    console.error('Error fetching items:', error);
  }
}

// Display search results
function displayResults(items) {
  const resultsContainer = document.getElementById('results');
  if (!resultsContainer) {
    console.error("Results container not found");
    return;
  }

  resultsContainer.innerHTML = '';  // Clear previous results

  // If no items are found, show a message
  if (!items || items.length === 0) {
    resultsContainer.textContent = 'No items found.';
    return;
  }

  // Append each result to the results container
  items.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.textContent = `${item.name} - ${item.cost}`;  // Adjust fields as needed
    resultsContainer.appendChild(itemDiv);
  });
}

  

// Lazy loading functionality (Optional, depending on your use case)
window.addEventListener('scroll', async () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) { // Near bottom
    const category = document.getElementById('category-select').value;
    const searchTerm = document.getElementById('weapon-search').value.trim();
    const { items, last } = await getItems(category, searchTerm, 10, lastVisible);
    lastVisible = last;  // Keep track of the last item for pagination
    displayResults(items);
  }
});
