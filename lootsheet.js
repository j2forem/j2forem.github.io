console.log("Lootsheet.js loaded successfully");

// Global function declaration to ensure it's accessible globally
window.updateCurrency = function() {
  const currencyType = document.getElementById("currency-type").value;
  const amount = parseInt(document.getElementById("amount").value);

  if (isNaN(amount) || amount === 0) {
    alert("Please enter a valid amount.");
    return;
  }

  modifyItemQuantity(currencyType, amount);
}

// No imports, because Firebase is loaded via the global firebase object

// Remove this line from lootsheet.js
// const db = firebase.firestore();   // This is already initialized in the HTML file


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
  const docRef = db.collection("loot").doc("Currency");

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
  db.collection("loot").doc("Currency").set(currencyData).then(() => {
    console.log(`Successfully updated ${currencyType} to ${newAmount} in Firestore`);
  }).catch((error) => {
    console.error("Error updating data in Firestore:", error);
  });
}

// Function to add a new weapon to Firestore
function addWeapon() {
    const name = document.getElementById("weapon-name").value;
    const cost = document.getElementById("weapon-cost").value;
    const weight = document.getElementById("weapon-weight").value;
    const size = document.getElementById("weapon-size").value;
    const type = document.getElementById("weapon-type").value;
    const speed = document.getElementById("weapon-speed").value;
    const damageSM = document.getElementById("weapon-damage-sm").value;
    const damageL = document.getElementById("weapon-damage-l").value;
  
    // Create a weapon object to add to Firestore
    const weapon = {
      name: name,
      cost: cost,
      weight: weight,
      size: size,
      type: type,
      speed: speed,
      damageSM: damageSM,
      damageL: damageL
    };
  
    // Add weapon to Firestore
    db.collection("weapons").add(weapon).then(() => {
      console.log("Weapon added successfully!");
      // Clear the form after submission
      document.getElementById("weapon-form").reset();
    }).catch((error) => {
      console.error("Error adding weapon: ", error);
    });
  }
  
// Function to search weapons from Firestore based on name
function searchWeapons() {
    const searchQuery = document.getElementById("weapon-search").value.toLowerCase();
    const weaponList = document.getElementById("weapon-list");
    
    // Clear the current list
    weaponList.innerHTML = '';
  
    // Query Firestore for weapons that match the search query
    db.collection("weapons").where("name", ">=", searchQuery).where("name", "<=", searchQuery + "\uf8ff")
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          weaponList.innerHTML = '<p>No matching weapons found.</p>';
          return;
        }
  
        // Display each matching weapon
        querySnapshot.forEach((doc) => {
          const weapon = doc.data();
          const weaponItem = `
            <div class="weapon-item">
              <h4>${weapon.name}</h4>
              <p>Cost: ${weapon.cost}</p>
              <p>Weight: ${weapon.weight} lbs</p>
              <p>Size: ${weapon.size}</p>
              <p>Type: ${weapon.type}</p>
              <p>Speed Factor: ${weapon.speed}</p>
              <p>Damage (S-M): ${weapon.damageSM}</p>
              <p>Damage (L): ${weapon.damageL}</p>
            </div>
          `;
          weaponList.innerHTML += weaponItem;
        });
      })
      .catch((error) => {
        console.error("Error fetching weapons: ", error);
      });
  }
  
// Load data from Firestore when the page loads
document.addEventListener("DOMContentLoaded", function () {
  fetchLootData();
});
