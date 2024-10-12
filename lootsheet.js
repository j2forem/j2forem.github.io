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
  
    // Query Firestore for weapons that match the search query and limit the results to 10
    db.collection("weapons")
      .where("name", ">=", searchQuery)
      .where("name", "<=", searchQuery + "\uf8ff")
      .limit(10) // Limiting the search to 10 results
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          weaponList.innerHTML = '<p>No matching weapons found.</p>';
          return;
        }
  
        // Display each matching weapon
        querySnapshot.forEach((doc) => {
          const weapon = doc.data();
  
          // Use optional chaining and default values to handle missing fields
          const name = weapon.name || 'Unknown Name';
          const cost = weapon.cost || 'N/A';
          const weight = weapon.weight || 'N/A';
          const size = weapon.size || 'N/A';
          const type = weapon.type || 'N/A';
          const speed = weapon.speed || 'N/A';
          const damageSM = weapon.damageSM || 'N/A';
          const damageL = weapon.damageL || 'N/A';
  
          // Create a weapon display item, showing N/A for missing fields
          const weaponItem = `
            <div class="weapon-item">
              <h4>${name}</h4>
              <p>Cost: ${cost}</p>
              <p>Weight: ${weight} lbs</p>
              <p>Size: ${size}</p>
              <p>Type: ${type}</p>
              <p>Speed Factor: ${speed}</p>
              <p>Damage (S-M): ${damageSM}</p>
              <p>Damage (L): ${damageL}</p>
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

// Function to handle tab switching and load dynamic content
function showTab(tabId) {
    const tabs = document.querySelectorAll('.tab');
    const tabContent = document.getElementById('tab-content');
  
    // Remove 'active-tab' class from all tabs
    tabs.forEach(tab => tab.classList.remove('active-tab'));
  
    // Set the clicked tab as active
    document.querySelector(`[onclick="showTab('${tabId}')"]`).classList.add('active-tab');
  
    // Load content based on the selected tab
    loadTabContent(tabId);
  }
  
  // Function to load dynamic content based on the selected tab
  function loadTabContent(tabId) {
    const tabContent = document.getElementById('tab-content');
  
    // Clear previous content
    tabContent.innerHTML = '';
  
    // Load dynamic content based on the tab selected
    switch (tabId) {
      case 'money':
        tabContent.innerHTML = `
          <h2>Money Management</h2>
          <p>Select an option to deposit or retrieve currency.</p>
          <button onclick="loadMoneyAction('deposit')">Deposit</button>
          <button onclick="loadMoneyAction('retrieve')">Retrieve</button>
        `;
        default:
            tabContent.innerHTML = `<h2>Select a category to manage your inventory</h2>`;
        break;
  
      case 'weapons':
        tabContent.innerHTML = `
          <h2>Manage Weapons</h2>
          <p>Select an option to add or retrieve weapons.</p>
          <button onclick="loadWeaponsAction('deposit')">Deposit</button>
          <button onclick="loadWeaponsAction('retrieve')">Retrieve</button>
        `;
        
        break;
  
      case 'armor':
        tabContent.innerHTML = `
          <h2>Manage Armor</h2>
          <p>Select an option to add or retrieve armor.</p>
          <button onclick="loadArmorAction('deposit')">Deposit</button>
          <button onclick="loadArmorAction('retrieve')">Retrieve</button>
        `;
      
        break;
  
      case 'potions':
        tabContent.innerHTML = `
          <h2>Manage Potions</h2>
          <p>Select an option to add or retrieve potions.</p>
          <button onclick="loadPotionsAction('deposit')">Deposit</button>
          <button onclick="loadPotionsAction('retrieve')">Retrieve</button>
        `;
      
        break;
  
      case 'scrolls':
        tabContent.innerHTML = `
          <h2>Manage Scrolls</h2>
          <p>Select an option to add or retrieve scrolls.</p>
          <button onclick="loadScrollsAction('deposit')">Deposit</button>
          <button onclick="loadScrollsAction('retrieve')">Retrieve</button>
        `;
  
        break;
  
      case 'gems':
        tabContent.innerHTML = `
          <h2>Manage Gems</h2>
          <p>Select an option to add or retrieve gems.</p>
          <button onclick="loadGemsAction('deposit')">Deposit</button>
          <button onclick="loadGemsAction('retrieve')">Retrieve</button>
        `;

        break;
  
      case 'magicalitems':
        tabContent.innerHTML = `
          <h2>Manage Magical Items</h2>
          <p>Select an option to add or retrieve magical items.</p>
          <button onclick="loadMagicalItemsAction('deposit')">Deposit</button>
          <button onclick="loadMagicalItemsAction('retrieve')">Retrieve</button>
        `;

        break;
  
      case 'unidentifieditems':
        tabContent.innerHTML = `
          <h2>Manage Unidentified Items</h2>
          <p>Select an option to add or retrieve unidentified items.</p>
          <button onclick="loadUnidentifiedItemsAction('deposit')">Deposit</button>
          <button onclick="loadUnidentifiedItemsAction('retrieve')">Retrieve</button>
        `;

        break;
  

    }
  }
  
  // Function to manually query and load the group loot from the database
function loadGroupLoot() {
    const lootTableBody = document.getElementById("group-loot-body");
    lootTableBody.innerHTML = ''; // Clear any existing table content
  
    // Example Firestore query (adjust to your actual DB setup)
    db.collection("groupLoot").get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        const lootItem = doc.data();
        const row = `
          <tr>
            <td>${lootItem.name}</td>
            <td>${lootItem.cost}</td>
            <td>${lootItem.weight}</td>
            <td><button onclick="removeFromGroupLoot('${doc.id}')">Remove</button></td>
          </tr>
        `;
        lootTableBody.innerHTML += row;
      });
    }).catch(error => {
      console.error("Error fetching group loot: ", error);
    });
  }
  
// Function to load predefined items (weapons) from Firestore
function loadWeaponsStore() {
  db.collection("Weapons") // Your Firestore collection name
      .get() // Fetch all documents in the collection
      .then((querySnapshot) => {
          const tableBody = document.getElementById("weapons-store-body");

          // Clear any existing rows
          tableBody.innerHTML = '';

          // Loop through each document and display its data
          querySnapshot.forEach((doc) => {
              const weapon = doc.data();
              const row = `
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
              tableBody.innerHTML += row;
          });
      })
      .catch((error) => {
          console.error("Error fetching weapons from Firestore:", error);
      });
}


  function showTab(tabId) {
    const tabs = document.querySelectorAll('.tab');
    const tabContent = document.getElementById('tab-content');
  
    // Clear previous content
    tabContent.innerHTML = '';
  
    // Remove 'active-tab' class from all tabs
    tabs.forEach(tab => tab.classList.remove('active-tab'));
  
    // Set the clicked tab as active
    document.querySelector(`[onclick="showTab('${tabId}')"]`).classList.add('active-tab');
  
    // Load content based on the selected tab
    switch (tabId) {
      case 'weapons':
        tabContent.innerHTML = `
          <h2>Weapons Store</h2>
          <table id="weapons-store" border="1">
            <thead>
              <tr>
                <th>Name</th>
                <th>Cost</th>
                <th>Weight (lbs)</th>
                <th>Size</th>
                <th>Type</th>
                <th>Speed Factor</th>
                <th>Damage (S-M)</th>
                <th>Damage (L)</th>
              </tr>
            </thead>
            <tbody id="weapons-store-body">
              <!-- Weapons data will be loaded here dynamically -->
            </tbody>
          </table>
        `;
        loadWeaponsStore(); // Call the function to load the weapons data
        break;
  
      // Add other cases for other tabs if needed...
      
      default:
        tabContent.innerHTML = `<h2>Select a category to manage your inventory</h2>`;
    }
  }

  function uploadWeaponsToFirestore() {
    console.log("Starting weapon upload...");
    weapons.forEach(weapon => {
      console.log("Weapon object:", weapon); // Log the entire weapon object for debugging
  
      // Check if the weapon has a valid Item (name) before querying Firestore
      if (!weapon.Item) {
        console.error("Weapon name (Item) is undefined for one of the items:", weapon);
        return; // Skip this weapon if the Item (name) is undefined
      }
  
      console.log(`Checking weapon: ${weapon.Item}`);
      
      // Check if the weapon already exists before adding
      db.collection("Weapons").where("name", "==", weapon.Item).get().then((snapshot) => {
        if (snapshot.empty) {
          console.log(`Uploading: ${weapon.Item}`);
          db.collection("Weapons").add({
            name: weapon.Item,
            cost: weapon["Cost"] || "N/A",
            weight: weapon["Weight (lbs.)"] || 0,
            size: weapon.Size || "N/A",
            type: weapon.Type || "N/A",
            speed: weapon["Speed Factor"] || "N/A",
            damageSM: weapon["S-M Dmg"] || "N/A",
            damageL: weapon["L Dmg"] || "N/A",
            source: weapon.Source || "N/A"
          }).then(() => {
            console.log(`${weapon.Item} has been added to Firestore!`);
          }).catch((error) => {
            console.error("Error adding weapon:", error);
          });
        } else {
          console.log(`${weapon.Item} already exists in Firestore.`);
        }
      }).catch((error) => {
        console.error("Error checking Firestore for existing weapon:", error);
      });
    });
  }
  
  // Function to search for weapons by name and display them
function searchWeapons() {
  const searchQuery = document.getElementById("weapon-search").value.toLowerCase();
  const weaponList = document.getElementById("weapon-list");

  // Clear the current list
  weaponList.innerHTML = '';

  // Query Firestore for weapons that match the search query
  db.collection("Weapons")
      .where("name", ">=", searchQuery)
      .where("name", "<=", searchQuery + "\uf8ff") // To ensure case-insensitive search
      .limit(10) // Limit the number of results to 10
      .get()
      .then((querySnapshot) => {
          if (querySnapshot.empty) {
              weaponList.innerHTML = '<p>No matching weapons found.</p>';
              return;
          }

          // Iterate through results and display them
          querySnapshot.forEach((doc) => {
              const weapon = doc.data();
              const weaponItem = `
                  <div class="weapon-item">
                      <h4>${weapon.name}</h4>
                      <p>Cost: ${weapon.cost || 'N/A'}</p>
                      <p>Weight: ${weapon.weight || 'N/A'} lbs</p>
                      <p>Size: ${weapon.size || 'N/A'}</p>
                      <p>Type: ${weapon.type || 'N/A'}</p>
                      <p>Speed Factor: ${weapon.speed || 'N/A'}</p>
                      <p>Damage (S-M): ${weapon.damageSM || 'N/A'}</p>
                      <p>Damage (L): ${weapon.damageL || 'N/A'}</p>
                      <p>Source: ${weapon.source || 'N/A'}</p>
                  </div>
              `;
              weaponList.innerHTML += weaponItem;
          });
      })
      .catch((error) => {
          console.error("Error fetching weapons: ", error);
          weaponList.innerHTML = '<p>Error fetching weapons.</p>';
      });
}

  
  