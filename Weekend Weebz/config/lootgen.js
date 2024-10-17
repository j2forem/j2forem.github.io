// lootgen.js
import { collection, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';
import { db } from './firebase';  // Import the Firestore instance

// Function to search through each document's 'Items' subcollection by a specific field
export async function searchItemsByFieldInSubcollections(collectionName, fieldName, searchValue) {
    try {
        // Reference to the main collection (e.g., 'Armors')
        const mainCollectionRef = collection(db, collectionName);
        const mainSnapshot = await getDocs(mainCollectionRef);
        const items = [];

        // Log collection reference for debugging
        console.log('Main collection reference:', mainCollectionRef);
        console.log(`Looking for items in collection "${collectionName}" with ${fieldName} == ${searchValue}`);

        if (mainSnapshot.empty) {
            console.log(`No documents found in the ${collectionName} collection.`);
            return [];
        }

        // Iterate through each document in the main collection (e.g., 'Chain', 'Plate')
        for (const doc of mainSnapshot.docs) {
            const category = doc.id;
            console.log(`Searching in subcollection for category: ${category}`);

            const itemsSubCollectionRef = collection(db, `${collectionName}/${category}/Items`);
            const q = query(itemsSubCollectionRef, where(fieldName, '==', searchValue));
            const itemsSnapshot = await getDocs(q);

            itemsSnapshot.forEach(subDoc => {
                console.log('Found matching item:', subDoc.id, '=>', subDoc.data());
                items.push(subDoc.data());
            });
        }

        return items;
    } catch (error) {
        console.error('Error searching in Firestore:', error);
        throw error;
    }
}

