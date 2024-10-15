// firebase.js

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js';
import { getFirestore, doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js';

// Your Firebase configuration object (replace with your actual config)
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
export const db = getFirestore(app);

// Fetch party funds from Firestore
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


// Update party funds in Firestore
export async function updatePartyFunds(updates) {
  try {
    const docRef = doc(db, 'PartyInventory', 'Currency');
    console.log("Attempting to update Firestore with:", updates);  // Log before update
    await updateDoc(docRef, updates);
    console.log('Party funds updated successfully!');
  } catch (error) {
    console.error('Error updating party funds:', error);
  }
}




