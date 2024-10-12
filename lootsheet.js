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

// Initialize currency data
let currencyData = {
  Gold: 0,
  Silver: 0,
  Copper: 0,
  Platinum: 0,
  Electrum: 0
};

// Fetch loot data from Firestore with loading state
function fetchLootData() {
    document.getElementById("tab-content").innerHTML = "<p>Loading currency data...</p>";
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

// Modify the item quantity and update both Firestore and the DOM
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

  // Push the updated value to Firestore
  db.collection("loot").doc("Currency").set(currencyData).then(() => {
    console.log(`Successfully updated ${currencyType} to ${newAmount} in Firestore`);
  }).catch((error) => {
    console.error("Error updating data in Firestore:", error);
  });
}

// Add a new weapon to Firestore
function addWeapon() {
  const name = document.getElementById("weapon-name").value;
  const cost = document.getElementById("weapon-cost").value;
  const weight = document.getElementById("weapon-weight").value;
  const size = document.getElementById("weapon-size").value;
  const type = document.getElementById("weapon-type").value;
  const speed = document.getElementById("weapon-speed").value;
  const damageSM = document.getElementById("weapon-damage-sm").value;
  const damageL = document.getElementById("weapon-damage-l").value;

  // Create a weapon object
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
    document.getElementById("weapon-form").reset();  // Clear form
  }).catch((error) => {
    console.error("Error adding weapon: ", error);
  });
}

// Search weapons from cached data
let weaponCache = [];  // Cache to store weapons

function cacheWeaponsFromFirestore() {
  db.collection('weapons').get().then(querySnapshot => {
    weaponCache = [];
    querySnapshot.forEach(doc => {
      weaponCache.push(doc.data());
    });
    console.log('Weapons cached:', weaponCache);
  }).catch(error => {
    console.error('Error caching weapons:', error);
  });
}

// Search function from cached weapons
function searchWeapons() {
  const searchQuery = document.getElementById("weapon-search").value.toLowerCase();
  const weaponResults = document.getElementById("weapon-results");

  // Clear previous search results
  weaponResults.innerHTML = '';

  // Filter weapons from the cache
  const filteredWeapons = weaponCache.filter(weapon => 
    weapon.name.toLowerCase().includes(searchQuery)
  );

  // Handle no results case
  if (filteredWeapons.length === 0) {
    weaponResults.innerHTML = "<p>No matching weapons found.</p>";
    return;
  }

  // Create results table
  let resultsTable = `<table border="1">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Cost</th>
                            <th>Weight</th>
                            <th>Size</th>
                            <th>Type</th>
                            <th>Speed</th>
                            <th>Damage (S-M)</th>
                            <th>Damage (L)</th>
                          </tr>
                        </thead>
                        <tbody>`;

  // Add filtered weapons to the table
  filteredWeapons.forEach((weapon) => {
    resultsTable += `
      <tr>
        <td>${weapon.name}</td>
        <td>${weapon.cost}</td>
        <td>${weapon.weight}</td>
        <td>${weapon.size}</td>
        <td>${weapon.type}</td>
        <td>${weapon.speed}</td>
        <td>${weapon.damageSM}</td>
        <td>${weapon.damageL}</td>
      </tr>
    `;
  });

  resultsTable += '</tbody></table>';
  weaponResults.innerHTML = resultsTable;
}

// Load data from Firestore when the page loads
document.addEventListener("DOMContentLoaded", function () {
  fetchLootData();
  cacheWeaponsFromFirestore();  // Cache weapons when page loads
});

// Handle tab switching
function showTab(tabId) {
  const tabs = document.querySelectorAll('.tab');
  const tabContent = document.getElementById('tab-content');

  // Remove 'active-tab' class from all tabs
  tabs.forEach(tab => tab.classList.remove('active-tab'));

  // Set the clicked tab as active
  document.querySelector(`[onclick="showTab('${tabId}')"]`).classList.add('active-tab');

  // Load dynamic content based on the tab selected
  loadTabContent(tabId);
}

function loadTabContent(tabId) {
  const tabContent = document.getElementById('tab-content');
  tabContent.innerHTML = '';  // Clear previous content

  switch (tabId) {
    case 'money':
      tabContent.innerHTML = `
        <h2>Money Management</h2>
        <p>Select an option to deposit or retrieve currency.</p>
        <button onclick="loadMoneyAction('deposit')">Deposit</button>
        <button onclick="loadMoneyAction('retrieve')">Retrieve</button>
      `;
      break;
    case 'weapons':
      tabContent.innerHTML = `
        <h2>Manage Weapons</h2>
        <input type="text" id="weapon-search" placeholder="Search weapons" onkeyup="searchWeapons()" />
        <div id="weapon-results"></div>
      `;
      break;
    // Add cases for other tabs like armor, potions, etc.
    default:
      tabContent.innerHTML = `<h2>Select a category to manage your inventory</h2>`;
  }
}
