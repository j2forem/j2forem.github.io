// firebase.js

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, limit, startAfter } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth'; 

// Firebase config (replace with your own)
const firebaseConfig = {
  apiKey: "AIzaSyAeSSRmlA-pYs_DOIGvgm4fdVZID6uFUIs",
  authDomain: "weekendweebz.firebaseapp.com",
  projectId: "weekendweebz",
  storageBucket: "weekendweebz.appspot.com",
  messagingSenderId: "389932072090",
  appId: "1:389932072090:web:104a13fc57762a449b3323",
  measurementId: "G-552DK30WLJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Sign in anonymously
signInAnonymously(auth).then(() => {
  console.log('Signed in anonymously');
}).catch(error => {
  console.error('Error signing in:', error);
});

// Firestore function to fetch items
export const getItems = async (category, searchTerm = '', itemsPerPage = 10, lastVisible = null) => {
  const itemsCollection = collection(db, category);

  let q;
  if (searchTerm) {
    q = query(itemsCollection, where('name', '>=', searchTerm), where('name', '<=', searchTerm + '\uf8ff'), limit(itemsPerPage));
  } else {
    q = query(itemsCollection, limit(itemsPerPage));
  }

  if (lastVisible) {
    q = query(q, startAfter(lastVisible));
  }

  const querySnapshot = await getDocs(q);
  const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Return both items and the last visible document for pagination (lazy loading)
  const last = querySnapshot.docs[querySnapshot.docs.length - 1];
  return { items, last };
};

// loot-search.js

import { getItems } from './firebase.json';

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
