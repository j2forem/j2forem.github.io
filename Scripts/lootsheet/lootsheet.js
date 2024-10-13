// REMOVE this line if it exists in your file:
// import { getItems } from './firebase.js';  // No longer needed since getItems is global

let selectedCategory = 'Weapons';  // Default category

// Set the current category based on tab or dropdown selection
function setCategory(category) {
  console.log('Category switched to:', category);
  selectedCategory = category;  // Update the selected category
  searchItems();  // Perform the search for the new category
}
window.setCategory = setCategory;  // Expose globally


// Debounced search input handler
function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

// Main search handler (with category and search term)
async function searchItems() {
  const searchTerm = document.getElementById('search-input').value.trim();  // Input search term

  // Use the global getItems function to fetch data from Firestore
  try {
    const { items } = await window.getItems(selectedCategory, searchTerm);  // Fetch from Firestore
    displayResults(items);  // Display results in the UI
  } catch (error) {
    console.error('Error searching for items:', error);
  }
}

// Display search results (DOM manipulation)
function displayResults(items) {
  const resultsContainer = document.getElementById('results');
  resultsContainer.innerHTML = '';  // Clear previous results

  if (!items || items.length === 0) {
    resultsContainer.textContent = 'No items found.';
    return;
  }

  items.forEach(item => {
    const itemDiv = document.createElement('div');
    const cost = item.cost ? `${item.cost} gold` : 'Unknown cost';  // Check if cost exists
    itemDiv.textContent = `${item.name} - ${cost}`;  // Customize as needed
    resultsContainer.appendChild(itemDiv);
  });
}

// Attach event listeners after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Handle category tab clicks
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', (event) => {
      const category = event.target.getAttribute('data-category');  // Get the category from the data attribute
      setCategory(category);  // Switch the category
    });
  });

  // Debounced search input (attach to the search bar)
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(searchItems, 300));  // 300ms debounce
  }
});
