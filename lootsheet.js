// No imports, because Firebase is loaded via the global firebase object

// Ensure Firebase is initialized via the global object
const db = firebase.firestore();  // Firestore instance

// Initialize currency data
let currencyData = {
  Gold: 0,
  Silver: 0,
  Copper: 0,
  Platinum: 0,
  Electrum: 0
};

// Fetch loot data from Firestore and update the DOM
function fetchLootData() {
  const docRef = db.collection("loot").doc("currency");

  docRef.get().then((doc) => {
    if (doc.exists) {
      currencyData = doc.data();  // Get data from Firestore
      updateDOM();  // Update the DOM with the fetched data
    } else {
      console.error("No data found in Firestore");
    }
  }).catch(function (error) {
    console.error("Error fetching data from Firestore:", error);
  });
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
function modifyItemQuantity(currencyType, amount) {
  const currentAmount = currencyData[currencyType];
  const newAmount = currentAmount + amount;

  if (newAmount < 0) {
    alert("You cannot have a negative amount of currency.");
    return;
  }

  console.log(`Updating ${currencyType} from ${currentAmount} to ${newAmount}`); //console logging

  // Update the DOM
  document.getElementById(`${currencyType.toLowerCase()}-amount`).innerText = newAmount;

  // Update the internal data structure
  currencyData[currencyType] = newAmount;

  // Push the updated value to Firestore
  db.collection("loot").doc("currency").set(currencyData).then(() => {
    console.log(`Successfully updated ${currencyType} to ${newAmount} in Firestore`);
  }).catch((error) => {
    console.error("Error updating data in Firestore:", error);
  });
}

// Load data from Firestore when the page loads
document.addEventListener("DOMContentLoaded", function () {
  fetchLootData();
});
