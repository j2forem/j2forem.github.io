import { doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';
import { db } from './firebase.js';  // Assuming 'firebase' exports the db instance

// Fetch party funds
export async function fetchPartyFunds() {
    const docRef = doc(db, 'PartyInventory', 'Currency');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        console.error('No such document!');
        return null;
    }
}

// Update party funds
export async function updatePartyFunds(updates) {
    try {
        const docRef = doc(db, 'PartyInventory', 'Currency');
        console.log("Attempting to update Firestore with:", updates);
        await updateDoc(docRef, updates);
        console.log('Party funds updated successfully!');
    } catch (error) {
        console.error('Error updating party funds:', error);
    }
}
