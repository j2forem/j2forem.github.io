import { getItems } from './firebase.js';  // Import getItems function from firebase.js

let selectedCategory = 'Weapons';  // Default category

// Set the current category based on tab or dropdown selection
function setCategory(category) {
  console.log('Category switched to:', category);
  selectedCategory = category;  // Update the selected category
  searchItems();  // Perform the search for the new category
}
window.setCategory = setCategory;


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

  // Check if search term is empty, and prevent unnecessary queries
  if (!searchTerm) {
    console.log('No search term provided.');
    return;
  }

  // Use the getItems function from firebase.js to fetch data from Firestore
  try {
    const { items } = await getItems(selectedCategory, searchTerm);  // Fetch from Firestore
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

// Wait for the DOM to fully load before attaching event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Debounced search input (attach to the search bar)
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(searchItems, 300));  // 300ms debounce
  }
});
