// Firebase config (replace with your own Firebase project configuration)
const firebaseConfig = {
  apiKey: "AIzaSyAeSSRmlA-pYs_DOIGvgm4fdVZID6uFUIs",
  authDomain: "weekendweebz.firebaseapp.com",
  projectId: "weekendweebz",
  storageBucket: "weekendweebz.appspot.com",
  messagingSenderId: "389932072090",
  appId: "1:389932072090:web:104a13fc57762a449b3323",
  measurementId: "G-552DK30WLJ"
};

// Initialize Firebase app
firebase.initializeApp(firebaseConfig);

// Initialize Firestore instance
const db = firebase.firestore();

/**
 * Function to retrieve items from a specific Firestore collection based on category and search term
 * @param {string} category - Firestore collection name (e.g., 'Weapons', 'Armor')
 * @param {string} searchTerm - Search term to find items by name
 * @returns {Promise} - Returns a promise that resolves with the list of matching items
 */
async function getItems(category, searchTerm) {
  try {
    // Reference to the collection based on category
    const collectionRef = db.collection(category);

    // Create a query for items where the name matches the searchTerm (with partial matching support)
    const q = collectionRef
      .where('name', '>=', searchTerm)
      .where('name', '<=', searchTerm + '\uf8ff')
      .limit(10);

    // Execute the query and get the matching documents
    const snapshot = await q.get();

    // Process the snapshot and extract the items
    const items = snapshot.docs.map(doc => ({
      id: doc.id,  // Add the document ID to the item object
      ...doc.data()  // Spread the document data into the object
    }));

    return { items };  // Return the list of items
  } catch (error) {
    console.error('Error fetching items from Firestore:', error);
    throw error;
  }
}

// Make the function globally accessible
window.getItems = getItems;

