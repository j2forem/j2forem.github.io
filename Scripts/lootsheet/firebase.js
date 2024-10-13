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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();  // Ensure this is initialized

/**
 * Fetch party funds (Platinum, Gold, etc.) directly from the 'Currency' document.
 * @returns {Promise<Object>} Returns an object with coin values.
 */
async function fetchPartyFunds() {
  try {
    const doc = await db.collection('PartyInventory').doc('Currency').get();
    if (doc.exists) {
      return doc.data(); // Returns an object {Platinum: X, Gold: Y, Electrum: Z, ...}
    } else {
      console.error('No such document!');
      return null;
    }
  } catch (error) {
    console.error('Error fetching party funds:', error);
    throw error;
  }
}

/**
 * Update the fields in the 'Currency' document directly (e.g., Platinum, Gold).
 * @param {Object} updates - An object containing updated coin values.
 */
async function updatePartyFunds(updates) {
  try {
    // Update specific fields in the Currency document
    await db.collection('PartyInventory').doc('Currency').update(updates);
    console.log('Party funds updated successfully!');
  } catch (error) {
    console.error('Error updating party funds:', error);
    throw error;
  }
}

// Make these functions globally accessible
window.fetchPartyFunds = fetchPartyFunds;
window.updatePartyFunds = updatePartyFunds;
