// Initialize Firebase using the global `firebase` object provided by the CDN
const firebaseConfig = {
    apiKey: "AIzaSyAeSSRmlA-pYs_DOIGvgm4fdVZID6uFUIs",
    authDomain: "weekendweebz.firebaseapp.com",
    projectId: "weekendweebz",
    storageBucket: "weekendweebz.appspot.com",
    messagingSenderId: "389932072090",
    appId: "1:389932072090:web:c3775748a2b0b2a09b3323",
    measurementId: "G-VW5PN0R4ZD"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
  // Initialize Firebase Realtime Database
  const database = firebase.database();
  
  // Initialize currency data
  let currencyData = {
      Gold: 0,
      Silver: 0,
      Copper: 0,
      Platinum: 0,
      Electrum: 0
  };
  
  // Fetch loot data from Firebase and update the DOM
  function fetchLootData() {
      database.ref('loot').once('value').then((snapshot) => {
          if (snapshot.exists()) {
              currencyData = snapshot.val(); // Get data from Firebase
              updateDOM();  // Update the DOM with the fetched data
          } else {
              console.error('No data found in Firebase');
          }
      }).catch(function(error) {
          console.error('Error fetching data from Firebase:', error);
      });
  }
  
  // Update the DOM with the current currency data
  function updateDOM() {
      document.getElementById('gold-amount').innerText = currencyData.Gold;
      document.getElementById('silver-amount').innerText = currencyData.Silver;
      document.getElementById('copper-amount').innerText = currencyData.Copper;
      document.getElementById('platinum-amount').innerText = currencyData.Platinum;
      document.getElementById('electrum-amount').innerText = currencyData.Electrum;
  }
  
  // Handle currency updates (called when the "Update Currency" button is clicked)
  function updateCurrency() {
      const currencyType = document.getElementById('currency-type').value;
      const amount = parseInt(document.getElementById('amount').value);
  
      if (isNaN(amount) || amount === 0) {
          alert("Please enter a valid amount.");
          return;
      }
  
      modifyItemQuantity(currencyType, amount);
  }
  
  // Modify the item quantity and update both Firebase and the DOM
  function modifyItemQuantity(currencyType, amount) {
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
  
      // Push the updated value to Firebase
      database.ref('loot').set(currencyData).then(() => {
          console.log(`Successfully updated ${currencyType} to ${newAmount} in Firebase`);
      }).catch((error) => {
          console.error('Error updating data in Firebase:', error);
      });
  }
  
  // Load data from Firebase when the page loads
  document.addEventListener('DOMContentLoaded', function () {
      fetchLootData();
  });
  