// Import Firestore functions (if using npm, or make sure the CDN version is correctly loaded)
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "firebase/firestore"; 

// Initialize Firebase using the modular Firebase SDK
const firebaseConfig = {
  apiKey: "AIzaSyAeSSRmlA-pYs_DOIGvgm4fdVZID6uFUIs",
  authDomain: "weekendweebz.firebaseapp.com",
  projectId: "weekendweebz",
  storageBucket: "weekendweebz.appspot.com",
  messagingSenderId: "389932072090",
  appId: "1:389932072090:web:c3775748a2b0b2a09b3323",
  measurementId: "G-552DK30WLJ"
};

// Initialize Firebase app and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize currency data
let currencyData = {
  Gold: 0,
  Silver: 0,
  Copper: 0,
  Platinum: 0,
  Electrum: 0
};

// Fetch loot data from Firestore and update the DOM
async function fetchLootData() {
  const docRef = doc(db, "loot", "currency");  // Specify the document to fetch
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    currencyData = docSnap.data();  // Get data from Firestore
    updateDOM();  // Update the DOM with the fetched data
  } else {
    console.error("No data found in Firestore");
  }
}

// Update the DOM with the current currency data
function updateDOM() {
  document.getElementById("gold-amount").innerText = currencyData.Gold;
  document.getElementById("silver-amount").innerText = currencyData.Silver;
  document.getElementById("copper-amount").innerText = currencyData.Copper;
  document.getElementById("platinum-amount").innerText = currencyData.Platinum;
  document.getElementById("electrum-amount").innerText = currencyData.Electrum;
}

// Handle currency updates (called when the "Update Currency" button is clicked)
function updateCurrency() {
  const currencyType = document.getElementById("currency-type").value;
  const amount = parseInt(document.getElementById("amount").value);

  if (isNaN(amount) || amount === 0) {
    alert("Please enter a valid amount.");
    return;
  }

  modifyItemQuantity(currencyType, amount);
}

// Modify the item quantity and update both Firestore and the DOM
async function modifyItemQuantity(currencyType, amount) {
  const currentAmount = currencyData[currencyType];
  const newAmount = currentAmount + amount;

  if (newAmount < 0) {
    alert("You cannot have a negative amount of currency.");
    return;
  }

  // Update the DOM
  document.getElementById(`${currencyType.toLowerCase()}-amount`).innerText = newAmount;

  // Update the internal data structure
  currencyData[currencyType] = newAmount;

  // Push the updated value to Firestore
  try {
    const currencyRef = doc(db, "loot", "currency");
    await updateDoc(currencyRef, {
      [currencyType]: newAmount
    });
    console.log(`Successfully updated ${currencyType} to ${newAmount} in Firestore`);
  } catch (error) {
    console.error("Error updating data in Firestore:", error);
  }
}

// Load data from Firestore when the page loads
document.addEventListener("DOMContentLoaded", function () {
  fetchLootData();
});
