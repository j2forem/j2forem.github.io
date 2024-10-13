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
    const collectionRef = db.collection(category);
    const q = collectionRef
      .where('name', '>=', searchTerm)
      .where('name', '<=', searchTerm + '\uf8ff')
      .limit(10);

    const snapshot = await q.get();

    const items = snapshot.docs.map(doc => ({
      id: doc.id,  
      ...doc.data()  
    }));

    return { items };
  } catch (error) {
    console.error('Error fetching items from Firestore:', error);
    throw error;
  }
}

/**
 * New Function: Fetch party funds from 'PartyInventory/Currency' document
 */
async function fetchPartyFunds() {
  try {
    const currencyDoc = await db.collection('PartyInventory').doc('Currency').get();
    
    if (currencyDoc.exists) {
      const currencyData = currencyDoc.data();  // Get the data from the document
      return currencyData;  // Return currency data (Platinum, Gold, etc.)
    } else {
      console.log('No Currency document found in PartyInventory.');
      return null;
    }
  } catch (error) {
    console.error('Error fetching currency data:', error);
    return null;
  }
}

// Make functions globally accessible
window.getItems = getItems;
window.fetchPartyFunds = fetchPartyFunds;
