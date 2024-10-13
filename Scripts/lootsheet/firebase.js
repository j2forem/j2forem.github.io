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

};

// Initialize Firebase app
firebase.initializeApp(firebaseConfig);

// Initialize Firestore instance
const db = firebase.firestore();

/**
 * Fetch party funds from the database.
 * @returns {Promise<Object>} Returns an object with coin values.
 */
async function fetchPartyFunds() {
  try {
    const doc = await db.collection('PartyInventory').doc('Currency').get();
    if (doc.exists) {
      return doc.data(); // {Platinum: X, Gold: Y, etc.}
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
 * Update party funds in the database.
 * @param {Object} updates - An object containing updated coin values.
 */
async function updatePartyFunds(updates) {
  try {
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
