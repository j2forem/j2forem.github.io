// Import necessary Firestore functions
import { db } from '../../../config/firebase.js';
import { collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';
import { updateRemainingBalance } from '../payments/payments.js';
import { addItemToCart, cart,uuidv4 } from '../cart/cart.js';
import { getNumberOfCoins } from '../wallet/wallet.js';

// search.js

let selectedCollection = ""; // This will store the selected collection name
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("query");
    const category = urlParams.get("category");

    // Populate the search input and category dropdown with URL parameters
    if (category) {
        const collectionDropdown = document.getElementById("collection-dropdown");
        collectionDropdown.value = category;
    }

    if (query) {
        const searchInput = document.getElementById("search-input");
        searchInput.value = query;  // Populate the search field
    }

    // Execute search if both query and category are available
    if (query && category) {
        searchItems(query);  // Call searchItems with the search term
    }
});

function formatCoins(copperValue) {
    if (copperValue < 10) {
        // Display in copper if less than 10 copper
        return `${copperValue} copper`;
    } else if (copperValue < 100) {
        // Display in silver if between 10 and 99 copper
        const silver = Math.floor(copperValue / 10);
        const remainingCopper = copperValue % 10;
        return remainingCopper > 0 ? `${silver} silver, ${remainingCopper} copper` : `${silver} silver`;
    } else {
        // Display in gold if 100 copper or more
        const gold = Math.floor(copperValue / 100);
        const remainingCopper = copperValue % 100;
        
        // Further breakdown remaining copper into silver and copper, if applicable
        const silver = Math.floor(remainingCopper / 10);
        const copperLeft = remainingCopper % 10;

        // Construct the final display string based on which parts are non-zero
        let result = `${gold} gold`;
        if (silver > 0) result += `, ${silver} silver`;
        if (copperLeft > 0) result += `, ${copperLeft} copper`;
        
        return result;
    }
}


// Function to format weight values
function formatWeight(ozValue) {
    const lbs = Math.floor(ozValue / 16);
    const remainingOz = ozValue % 16;
    return remainingOz > 0 ? `${lbs} lbs, ${remainingOz} oz` : `${lbs} lbs`;
}

// Function to search items in the selected collection
export async function searchItems(searchTerm) {
    const selectedCollection = document.getElementById("collection-dropdown").value;
    if (!selectedCollection) {
        alert("Please select a category first.");
        return;
    }

    const itemsRef = collection(db, selectedCollection);
    const searchResults = [];
    const lowerCaseTerm = searchTerm.toLowerCase();

    // Query for tag matches
    const tagQuery = query(itemsRef, where("keywords", "array-contains", lowerCaseTerm));
    const tagSnapshot = await getDocs(tagQuery);
    
    tagSnapshot.forEach((doc) => {
        searchResults.push({ id: doc.id, ...doc.data() });
    });

    // Query for name match using `name_lowercase`
    const nameQuery = query(itemsRef, where("name_lowercase", "==", lowerCaseTerm));
    const nameSnapshot = await getDocs(nameQuery);

    nameSnapshot.forEach((doc) => {
        // Avoid duplicate entries if an item matches both name and tags
        if (!searchResults.some(result => result.id === doc.id)) {
            searchResults.push({ id: doc.id, ...doc.data() });
        }
    });

    displayResults(searchResults);
}

function displayResults(items) {
    const resultsContainer = document.getElementById("search-results");
    resultsContainer.innerHTML = ""; // Clear previous results

    if (items.length === 0) {
        resultsContainer.innerHTML = "<p>No items found.</p>";
        return;
    }

    items.forEach(item => {
        const formattedPrice = formatCoins(item.price);
        const formattedWeight = formatWeight(item.weight);

        const itemDiv = document.createElement("div");
        itemDiv.className = "item";
        itemDiv.innerHTML = `
            <h3>${item.name}</h3>
            <p>Tags: ${item.keywords.join(", ")}</p>
            <p>Weight: ${formattedWeight}</p>
            <p>Price: ${formattedPrice}</p>
        `;

        // Add button to add item to cart with all relevant fields
        const addToCartButton = document.createElement("button");
        addToCartButton.textContent = "Add to Cart";
        addToCartButton.addEventListener("click", () => {
            // Debug: Confirm that keywords and other data are correctly populated here
            console.log("Adding to cart:", item);

            addItemToCart(
                item.name,
                item.description || '',
                item.price || 0,
                item.keywords || [],
                item.weight || 0,
                item.isMagical || false,
                item.isIdentified || false,
                item.magicalDescription || '',
                item.magicalEffects || '',
                item.locationLooted || '',
                item.id
            );
        });

        itemDiv.appendChild(addToCartButton); 
        resultsContainer.appendChild(itemDiv);
    });
}

export { displayResults };

// Event listener to trigger search on button click
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("search-button").addEventListener("click", () => {
        const searchTerm = document.getElementById("search-input").value.trim();
        if (searchTerm) {
            searchItems(searchTerm);
        } else {
            alert("Please enter a search term.");
        }
    });
});

function setupCoinInputs() {
    document.querySelectorAll(".coin-input").forEach(input => {
        input.addEventListener("input", (event) => {
            const platinumInput = parseInt(document.getElementById("platinum-input").value) || 0;
            const goldInput = parseInt(document.getElementById("gold-input").value) || 0;
            const electrumInput = parseInt(document.getElementById("electrum-input").value) || 0;
            const silverInput = parseInt(document.getElementById("silver-input").value) || 0;
            const copperInput = parseInt(document.getElementById("copper-input").value) || 0;

            const priceInCopper = 1500; // Example item price, replace with dynamic price in actual code
            updateRemainingBalance(priceInCopper, platinumInput, goldInput, electrumInput, silverInput, copperInput);
        });
    });
}

setupCoinInputs();