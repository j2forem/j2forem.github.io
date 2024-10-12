// lootsearch.js

import { getItems } from './firebase.js';  // Ensure your firebase.js file contains Firestore setup

let timeout = null;
let lastVisible = null;  // For lazy loading
let searchCount = 0;
const searchLimit = 5;  // Max 5 searches per minute
const resetTime = 60000; // 1 minute in milliseconds

// Reset search count every minute
function resetSearchCount() {
  setTimeout(() => searchCount = 0, resetTime);
}

// Debounce function to limit how often search is triggered
function debounce(fn, delay) {
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

// Caching results in local storage
function cacheResults(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Retrieve cached results
function getCachedResults(key) {
  const cachedData = localStorage.getItem(key);
  return cachedData ? JSON.parse(cachedData) : null;
}

// Handle search logic
async function handleSearch(category, searchTerm) {
  const cacheKey = `${category}-${searchTerm}`;
  const cached = getCachedResults(cacheKey);

  if (cached) {
    console.log('Using cached results', cached);
    displayResults(cached);
  } else if (searchCount < searchLimit) {
    searchCount++;
    const { items } = await getItems(category, searchTerm);  // Fetch items from Firestore
    cacheResults(cacheKey, items);
    displayResults(items);

    if (searchCount === 1) resetSearchCount();  // Start rate limit reset timer
  } else {
    console.log('Search limit exceeded. Try again later.');
  }
}

// Display search results
function displayResults(items) {
  const resultsContainer = document.getElementById('results');
  resultsContainer.innerHTML = '';  // Clear previous results
  items.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.textContent = `${item.name} - ${item.value} gold`;
    resultsContainer.appendChild(itemDiv);
  });
}

// Debounced search input
document.getElementById('search-input').addEventListener('input', debounce((event) => {
  const category = document.getElementById('category-select').value;
  const searchTerm = event.target.value.trim();
  handleSearch(category, searchTerm);
}, 300));

// Lazy loading functionality
window.addEventListener('scroll', async () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) { // Near bottom
    const category = document.getElementById('category-select').value;
    const searchTerm = document.getElementById('search-input').value.trim();
    const { items, last } = await getItems(category, searchTerm, 10, lastVisible);
    lastVisible = last;  // Keep track of the last item for pagination
    displayResults(items);
  }
});
