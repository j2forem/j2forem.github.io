// main.js


import { collection, query, where, getDocs }from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';  // Import the helper function
import {db} from '../../config/firebase.js';

// Run a simple hardcoded query to ensure Firestore is working
async function testSimpleQuery() {
    const itemsSubCollectionRef = collection(db, 'Armors/Chain/Items');  // Hardcoded path
    const q = query(itemsSubCollectionRef, where('name', '==', 'Chain Mail'));  // Hardcoded query

    try {
        const querySnapshot = await getDocs(q);  // Execute the query
        console.log('Query Snapshot:', querySnapshot.docs.map(doc => doc.data()));

        // Display the query results
        querySnapshot.forEach(doc => {
            console.log('Found item:', doc.data());  // Log each result
        });

        if (querySnapshot.empty) {
            console.log('No matching documents.');
        }
    } catch (error) {
        console.error('Error executing query:', error);  // Handle any errors
    }
}

// Call this function when the window loads
window.onload = function() {
    testSimpleQuery();
};

