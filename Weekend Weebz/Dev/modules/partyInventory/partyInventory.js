import { db } from '../../../config/firebase.js';
import { collection, getDocs,doc, deleteDoc } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

// Updated search function with displayAllUnidentified flag
async function searchPartyLoot(displayAllUnidentified = false) {
    const searchInput = document.getElementById("search-party-loot").value.trim().toLowerCase();
    const lootResultsContainer = document.getElementById("party-search-results");
    lootResultsContainer.innerHTML = "<p>Searching...</p>";

    try {
        const lootCollection = collection(db, 'PartyInventory');
        const lootSnapshot = await getDocs(lootCollection);
        const lootItems = lootSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Filter items based on the `displayAllUnidentified` flag
        const filteredItems = lootItems.filter(item => {
            // Show all magical, unidentified items if the flag is true
            if (displayAllUnidentified) {
                return item.isMagical && !item.isIdentified;
            }

            // Otherwise, filter by the search term if provided
            const matchesSearch = item.keywords && item.keywords.some(keyword => keyword.toLowerCase().includes(searchInput));
            return matchesSearch;
        });

        // Display results
        if (filteredItems.length === 0) {
            lootResultsContainer.innerHTML = "<p>No items matched your search.</p>";
        } else {
            lootResultsContainer.innerHTML = filteredItems.map(item => `
                <div class="loot-item">
                    <h4>${item.name}</h4>
                    <p>Description: ${item.description || 'No description available'}</p>
                    <p>Quantity: ${item.quantity || 1}</p>
                    <p>Value: ${item.price ? formatPriceInDenominations(item.price) : 'Not available'}</p>
                    ${item.isMagical ? `<p>Magical: Yes</p>` : ''}
                    ${item.isIdentified ? `<p>Identified: Yes</p>` : `<p>Identified: No</p>`}
                    ${item.magicalDescription ? `<p>Magical Description: ${item.magicalDescription}</p>` : ''}
                    ${item.magicalEffects ? `<p>Magical Effects: ${item.magicalEffects}</p>` : ''}
                    ${item.locationLooted ? `<p>Location Looted: ${item.locationLooted}</p>` : ''}
                    ${item.timestamp ? `<p>Looted On: ${item.timestamp.toDate().toLocaleDateString()}</p>` : ''}
                    <button onclick="removeItemFromPartyInventory('${item.id}')">Remove Item</button>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error("Error searching party loot:", error);
        lootResultsContainer.innerHTML = "<p>Error loading loot. Please try again.</p>";
    }
}




async function removeItemFromPartyInventory(itemId) {
    if (!confirm("Are you sure you want to remove this item?")) {
        return; // Exit if the user cancels the action
    }

    try {
        const itemRef = doc(db, 'PartyInventory', itemId); // Get the document reference by item ID
        await deleteDoc(itemRef); // Delete the document from Firestore
        alert("Item removed successfully!");
        
        // Refresh the loot display
        searchPartyLoot(); // Call the search function to refresh the list
    } catch (error) {
        console.error("Error removing item from Party Inventory:", error);
        alert("Failed to remove item. Please try again.");
    }
}

// Attach the function to the global scope
window.removeItemFromPartyInventory = removeItemFromPartyInventory;

// Attach the searchPartyLoot function to the global scope
window.searchPartyLoot = searchPartyLoot;

// Helper function to format price in denominations
function formatPriceInDenominations(copperValue) {
    const gold = Math.floor(copperValue / 100);
    copperValue %= 100;
    const silver = Math.floor(copperValue / 10);
    const copper = copperValue % 10;

    let result = [];
    if (gold > 0) result.push(`${gold} gold`);
    if (silver > 0) result.push(`${silver} silver`);
    if (copper > 0 || result.length === 0) result.push(`${copper} copper`);
    
    return result.join(", ");
}

document.addEventListener("DOMContentLoaded", () => {
    // Log to check if the button is accessible
    const magicalUnidentifiedButton = document.getElementById("show-magical-unidentified");
    console.log("Magical Unidentified Button:", magicalUnidentifiedButton); // Check if button is found
    
    if (magicalUnidentifiedButton) {
        magicalUnidentifiedButton.addEventListener("click", () => {
            console.log("Button clicked!"); // Confirm click is registered
            searchPartyLoot(true); // Call function with magical/unidentified filter
        });
    } else {
        console.error("Error: 'Show Magical, Unidentified Items' button not found in the DOM.");
    }

    const searchButton = document.getElementById("search-party-button");
    console.log("Search Party Button:", searchButton); // Check if button is found
    
    if (searchButton) {
        searchButton.addEventListener("click", () => {
            console.log("Search button clicked!"); // Confirm click is registered
            searchPartyLoot(false); // Call function with keyword-based search
        });
    } else {
        console.error("Error: 'Search Party Loot' button not found in the DOM.");
    }
});
