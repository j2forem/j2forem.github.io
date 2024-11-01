import { db } from '../../config/firebase.js';
import { getDocs, collection, query, where } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';
import { renderItems } from '../ui/merchantUI.js';

export let currentCategory = '';

export function selectCategory(category) {
    currentCategory = category; // This should work if `currentCategory` is imported correctly
    console.log(`Selected category: ${category}`);

    // Show the search bar when a category is selected
    document.getElementById('merchantSearchBar').classList.remove('hidden');

    // Clear previous search results
    document.getElementById('merchantItemsDisplay').innerHTML = '';

    // Fetch and display the items for the selected category
    fetchItemsForCategory(category);
}

export async function fetchItemsForCategory(category) {
    try {
        console.log(`Fetching items for category: ${category}`);
        const itemsCollection = collection(db, category);
        const querySnapshot = await getDocs(itemsCollection);
        const items = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            isMagical: doc.data().isMagical || false,
            customizable: doc.data().customizable || false // Optional field indicating if it can have custom fields
        }));

        console.log(`Fetched ${items.length} items for category: ${category}`);
        renderItems(items); // Ensure `renderItems` is correctly defined in `merchantUI.js`
    } catch (error) {
        console.error('Error fetching items for category:', error);
    }
}

export async function searchItemsInCategory(category, queryText) {
    console.log(`Searching for "${queryText}" in category: ${category}`);

    try {
        const normalizedQuery = queryText.toLowerCase();
        const itemsCollection = collection(db, category);

        const itemsQuery = query(
            itemsCollection,
            where('name_lowercase', '>=', normalizedQuery),
            where('name_lowercase', '<=', normalizedQuery + '\uf8ff')
        );

        const querySnapshot = await getDocs(itemsQuery);
        const filteredItems = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log(`Found ${filteredItems.length} items matching "${queryText}" in category: ${category}`);

        // Render the filtered items
        renderItems(filteredItems);
    } catch (error) {
        console.error('Error fetching items:', error);
    }
}

