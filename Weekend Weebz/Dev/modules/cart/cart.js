import { addCoins, subtractCoins,getNumberOfCoins,calculateTotalCopper } from '../wallet/wallet.js';
import { handlePayment,updateRemainingBalance } from '../payments/payments.js';
import { db } from '../../../config/firebase.js';
import { collection, query, addDoc, doc, where, getDocs,getDoc,Timestamp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';
import { coinValues } from '../../config.js';

export const uuidv4 = uuid.v4;
export let cart = [];

export function toggleMode() {
    // Retrieve the current mode from localStorage, or default to true (Loot Mode) if not set
    let isLootMode = localStorage.getItem("isLootMode") === "true";

    // Toggle the mode
    isLootMode = !isLootMode;

    // Save the updated mode to localStorage
    localStorage.setItem("isLootMode", isLootMode.toString());

    console.log("toggleMode called - New isLootMode:", isLootMode); // Log to confirm the toggled state

    // Immediately update the button text and display based on the new mode
    updateToggleButton();
}
// Function to update the toggle button and display based on the current mode from localStorage
function updateToggleButton() {
    const toggleButton = document.getElementById("mode-toggle-button");
    const currentModeDisplay = document.getElementById("current-mode");

    // Retrieve the mode from localStorage as a Boolean
    const isLootMode = localStorage.getItem("isLootMode") === "true";

    if (toggleButton && currentModeDisplay) {
        toggleButton.textContent = isLootMode ? "Switch to Merchant Mode" : "Switch to Loot Mode";
        currentModeDisplay.textContent = `Current Mode: ${isLootMode ? "Loot" : "Merchant"}`;
    } else {
        console.error("Toggle button or current mode display not found in the DOM");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded. Initializing toggle button...");

    // Set initial button state based on isLootMode from localStorage
    updateToggleButton();

    // Attach the toggleMode function to the button
    const toggleButton = document.getElementById("mode-toggle-button");
    if (toggleButton) {
        console.log("Attaching click event listener to mode-toggle-button");
        toggleButton.addEventListener("click", () => {
            console.log("Mode toggle button clicked");
            toggleMode();
        });
    } else {
        console.error("mode-toggle-button not found in the DOM");
    }
});







// Helper function to format price in denominations (gold, silver, copper only)
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

export function addItemToCart(
    name, description, price, keywords = [], 
    weight = 0, isMagical = false, 
    isIdentified = false, magicalDescription = '', 
    magicalEffects = '', locationLooted = '', itemId = null,
    quantity = 1 // Set default quantity,
) {
    // Retrieve the current mode directly from localStorage
    const isLootMode = localStorage.getItem("isLootMode") === "true";

    const item = {
        id: uuidv4(),
        sourceId: itemId,
        name,
        description,
        price,
        quantity,
        totalPrice: price * quantity,
        keywords,
        weight,
        isMagical,
        isIdentified,
        magicalDescription,
        magicalEffects,
        locationLooted,
        isLoot: isLootMode // Store the current mode as part of the item
    };

    // Debug: Confirm that keywords and other fields are stored in the cart
    console.log("Item added to cart:", item);

    cart.push(item);
    updateCartDisplay();
}
// Calculate total cart price
function calculateTotalCartPrice() {
    return cart.reduce((total, item) => total + item.totalPrice, 0);
}

// Function to remove an item from the cart by its ID
export function removeItemFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    updateCartDisplay(); // Refresh cart display after removal
}

// Attach removeItemFromCart to the global scope
window.removeItemFromCart = removeItemFromCart;

function updateCartDisplay() {
    const cartContainer = document.getElementById("cart-container");
    if (!cartContainer) {
        console.warn("Cart display element not found on this page. Skipping updateCartDisplay.");
        return;
    }

    cartContainer.innerHTML = ""; // Clear previous content

    cart.forEach(item => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "cart-item";
        
        itemDiv.innerHTML = `
            <h4>${item.name} (${item.description || ''})</h4>
            <p>Price: 
                <input type="text" class="item-price" data-id="${item.id}" value="${formatPriceInDenominations(item.price)}">
            </p>
            <p>Quantity: 
                <input type="number" class="item-quantity" data-id="${item.id}" value="${item.quantity}" min="1">
            </p>
            <p>Description: 
                <input type="text" class="item-description" data-id="${item.id}" value="${item.description}">
            </p>
            <p>
                <label><input type="checkbox" class="is-magical-toggle" data-id="${item.id}" ${item.isMagical ? 'checked' : ''}> Magical</label>
                <label><input type="checkbox" class="is-identified-toggle" data-id="${item.id}" ${item.isIdentified ? 'checked' : ''}> Identified</label>
            </p>
            ${item.isMagical ? `
                <p>Magical Description:
                    <input type="text" class="magical-description" data-id="${item.id}" value="${item.magicalDescription}">
                </p>
            ` : ''}
            ${item.isIdentified ? `
                <p>Magical Effects:
                    <input type="text" class="magical-effects" data-id="${item.id}" value="${item.magicalEffects}">
                </p>
            ` : ''}
            <p>Total Price: <span class="item-total-price">${formatPriceInDenominations(item.totalPrice)}</span></p>
            <button onclick="removeItemFromCart('${item.id}')">Remove</button>
        `;
        cartContainer.appendChild(itemDiv);
    });

    // Attach event listeners for each field without re-rendering everything
    document.querySelectorAll(".item-price").forEach(input => {
        input.addEventListener("change", updateItemPrice);
    });
    document.querySelectorAll(".item-quantity").forEach(input => {
        input.addEventListener("input", updateItemQuantity);
    });
    document.querySelectorAll(".item-description").forEach(input => {
        input.addEventListener("input", updateItemDescription);
    });
    document.querySelectorAll(".is-magical-toggle").forEach(toggle => {
        toggle.addEventListener("change", toggleIsMagical);
    });
    document.querySelectorAll(".is-identified-toggle").forEach(toggle => {
        toggle.addEventListener("change", toggleIsIdentified);
    });
    document.querySelectorAll(".magical-description").forEach(input => {
        input.addEventListener("input", updateMagicalDescription);
    });
    document.querySelectorAll(".magical-effects").forEach(input => {
        input.addEventListener("input", updateMagicalEffects);
    });

    // Update the cart summary and the payment section
    updateCartSummary();
    updatePaymentSection();
}

function updateCartSummary() {
    const cartSummary = document.getElementById("cart-summary");
    const totalCartPrice = calculateTotalCartPrice();
    
    cartSummary.innerHTML = `Total Items: ${cart.length} | Total Price: ${formatPriceInDenominations(totalCartPrice)}`;

    // Update remaining balance in the payment section
    const paymentRemaining = document.getElementById("remaining-balance");
    if (paymentRemaining) {
        paymentRemaining.textContent = `Remaining: ${formatPriceInDenominations(totalCartPrice)}`;
    }
}



async function updatePaymentSection() {
    const paymentSection = document.getElementById("cart-payment-section");
    const isLootMode = localStorage.getItem("isLootMode") === "true";

    if (!paymentSection) {
        console.warn("Payment section not found in the DOM.");
        return;
    }

    if (isLootMode) {
        paymentSection.innerHTML = `
            <p>Loot Mode: No payment required for items.</p>
            <button onclick="finalizePayment()">Add to Inventory</button>
        `;
    } else {
        const totalCartPrice = calculateTotalCartPrice();

        // Get the player's wallet data from Firestore (as copper values)
        const walletDocRef = doc(db, 'PartyInventory', 'Currency');
        const walletSnap = await getDoc(walletDocRef);
        
        if (walletSnap.exists()) {
            const walletData = walletSnap.data();

            // Calculate the number of each type of coin based on copper values
            const playerCoins = getNumberOfCoins(walletData);

            // Calculate the weight for each type of coin
            const coinWeights = {
                platinum: playerCoins.platinum * 0.02,
                gold: playerCoins.gold * 0.02,
                electrum: playerCoins.electrum * 0.02,
                silver: playerCoins.silver * 0.02,
                copper: playerCoins.copper * 0.02
            };

            paymentSection.innerHTML = `
                <h3>Pay for Total Cart</h3>
                <p>Total Price: ${formatPriceInDenominations(totalCartPrice)}</p>
                <div class="coin-balance-section">
                    ${Object.keys(playerCoins).map(coin => `
                        <div>
                            <label>${capitalize(coin)} (Balance: ${playerCoins[coin]}, Weight: ${coinWeights[coin].toFixed(2)} lbs)</label>
                            <input type="number" min="0" max="${playerCoins[coin]}" placeholder="0" class="coin-input" data-coin="${coin}">
                        </div>
                    `).join('')}
                </div>
                <p id="remaining-balance">Remaining: ${formatPriceInDenominations(totalCartPrice)}</p>
                <button onclick="finalizePayment()">Finalize Payment</button>
            `;

            // Add event listeners to coin inputs to handle payment calculations
            document.querySelectorAll(".coin-input").forEach(input => {
                input.addEventListener("input", handleCoinInput);
            });
        } else {
            console.error("Error: Wallet data not found.");
        }
    }
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function handleCoinInput() {
    const totalCartPrice = calculateTotalCartPrice();

    // Retrieve entered coin amounts
    const coinInputs = {
        platinum: parseInt(document.querySelector(".coin-input[data-coin='platinum']").value) || 0,
        gold: parseInt(document.querySelector(".coin-input[data-coin='gold']").value) || 0,
        electrum: parseInt(document.querySelector(".coin-input[data-coin='electrum']").value) || 0,
        silver: parseInt(document.querySelector(".coin-input[data-coin='silver']").value) || 0,
        copper: parseInt(document.querySelector(".coin-input[data-coin='copper']").value) || 0,
    };

    // Convert entered amounts into copper
    const totalPaidInCopper = calculateTotalCopper(coinInputs);
    const remainingBalance = totalCartPrice - totalPaidInCopper;

    // Update remaining balance display
    document.getElementById("remaining-balance").textContent = `Remaining: ${formatPriceInDenominations(remainingBalance)}`;
}

export async function finalizePayment() {
    const isLootMode = localStorage.getItem("isLootMode") === "true";

    if (isLootMode) {
        alert("Loot Mode: No payment required. Items will be added to inventory directly.");
        await writeToPartyInventory();
        cart.length = 0;
        updateCartDisplay();
    } else {
        const totalCartPrice = calculateTotalCartPrice();

        // Collect coin input values for each denomination
        const coinInputs = {
            platinum: parseInt(document.querySelector(".coin-input[data-coin='platinum']").value) || 0,
            gold: parseInt(document.querySelector(".coin-input[data-coin='gold']").value) || 0,
            electrum: parseInt(document.querySelector(".coin-input[data-coin='electrum']").value) || 0,
            silver: parseInt(document.querySelector(".coin-input[data-coin='silver']").value) || 0,
            copper: parseInt(document.querySelector(".coin-input[data-coin='copper']").value) || 0,
        };

        const totalPaidInCopper = calculateTotalCopper(coinInputs);
        const remainingBalance = totalCartPrice - totalPaidInCopper;

        if (remainingBalance > 0) {
            alert(`Insufficient payment. You still owe ${formatPriceInDenominations(remainingBalance)}.`);
            return;
        }

        // Deduct coins based on user input
        for (const [coinType, amount] of Object.entries(coinInputs)) {
            if (amount > 0) {
                await subtractCoins(coinType, amount * coinValues[coinType]);
            }
        }

        alert("Payment finalized successfully!");
        await writeToPartyInventory();
        cart.length = 0;
        updateCartDisplay();
    }
}


async function writeToPartyInventory() {
    try {
        const inventoryRef = collection(db, 'PartyInventory');

        for (const item of cart) {
            console.log("Writing to PartyInventory:", item); // Debugging output to confirm item data

            // Handling timestamp with debug log
            let timestampValue;
            if (item.timestamp instanceof Date) {
                timestampValue = Timestamp.fromDate(item.timestamp);
            } else {
                timestampValue = Timestamp.now();
            }
            console.log("Timestamp being written:", timestampValue); // Log the timestamp

            for (const item of cart) {
                await addDoc(inventoryRef, {
                    name: item.name,
                    description: item.description,
                    price: item.price,
                    quantity: item.quantity,
                    isMagical: item.isMagical,
                    isIdentified: item.isIdentified,
                    magicalDescription: item.magicalDescription,
                    magicalEffects: item.magicalEffects,
                    locationLooted: item.locationLooted,
                    keywords: item.keywords,
                    timestamp: Timestamp.now(),
                    isLoot: item.isLoot
                });
            }}
    
            alert("Items successfully added to Party Inventory!");
        } catch (error) {
            console.error("Error writing to Party Inventory:", error);
            alert("Failed to add items to Party Inventory.");
        }
    }
// Attach finalizePayment to the window object for global access
window.finalizePayment = finalizePayment;

function updateItemPrice(event) {
    const itemId = event.target.getAttribute("data-id");
    const priceInput = event.target.value;

    const item = cart.find(i => i.id === itemId);
    if (!item) return;

    // Construct a coins object to pass to calculateTotalCopper
    const [amount, denomination] = priceInput.toLowerCase().split(" ");
    const coins = { copper: 0, silver: 0, electrum: 0, gold: 0, platinum: 0 };
    coins[denomination] = parseInt(amount, 10) || 0;

    // Convert to copper and update the item’s price and total price
    item.price = calculateTotalCopper(coins);  // Convert entered denomination to copper
    item.totalPrice = item.price * item.quantity;

    // Update displayed total price within this cart item
    const itemTotalPriceElement = event.target.closest('.cart-item').querySelector('.item-total-price');
    itemTotalPriceElement.textContent = formatPriceInDenominations(item.totalPrice);

    // Update cart summary to reflect new total price
    updateCartSummary();
}


// Update item quantity in the cart when edited without re-rendering the entire cart
function updateItemQuantity(event) {
    const itemId = event.target.getAttribute("data-id");
    const newQuantity = parseInt(event.target.value, 10) || 1;

    const item = cart.find(i => i.id === itemId);
    if (!item) return;

    // Update item quantity and recalculate total price for this item
    item.quantity = newQuantity;
    item.totalPrice = item.price * item.quantity;

    // Update displayed total price directly within this cart item
    const itemTotalPriceElement = event.target.closest('.cart-item').querySelector('.item-total-price');
    itemTotalPriceElement.textContent = formatPriceInDenominations(item.totalPrice);

    // Update the cart summary total price
    updateCartSummary();
}



// Update the description of an item in the cart without re-rendering the entire cart
function updateItemDescription(event) {
    const itemId = event.target.getAttribute("data-id");
    const newDescription = event.target.value;

    const item = cart.find(i => i.id === itemId);
    if (item) {
        item.description = newDescription;
    }
}

// Toggle the isMagical property and control visibility of isIdentified checkbox
function toggleIsMagical(event) {
    const itemId = event.target.getAttribute("data-id");
    const item = cart.find(i => i.id === itemId);

    if (item) {
        item.isMagical = event.target.checked;

        // Hide isIdentified if isMagical is unchecked
        const identifiedCheckbox = event.target.closest('.cart-item').querySelector('.is-identified-toggle');
        if (item.isMagical) {
            identifiedCheckbox.parentElement.style.display = "block";
        } else {
            identifiedCheckbox.checked = false; // Uncheck if hidden
            item.isIdentified = false;          // Ensure item is set as not identified
            identifiedCheckbox.parentElement.style.display = "none";
            item.magicalEffects = "";           // Clear effects if no longer magical
            item.magicalDescription = "";       // Clear magical description if not magical
        }
    }

    updateCartDisplay();
}

// Toggle the isIdentified property
function toggleIsIdentified(event) {
    const itemId = event.target.getAttribute("data-id");
    const item = cart.find(i => i.id === itemId);

    if (item && item.isMagical) { // Only allow toggle if item is magical
        item.isIdentified = event.target.checked;
        if (!item.isIdentified) {
            item.magicalEffects = ""; // Clear magical effects if not identified
        }
    }

    updateCartDisplay();
}

// Update the magical description only if marked as magical
function updateMagicalDescription(event) {
    const itemId = event.target.getAttribute("data-id");
    const newMagicalDescription = event.target.value;

    const item = cart.find(i => i.id === itemId);
    if (item && item.isMagical) {
        item.magicalDescription = newMagicalDescription;
    }
}


// Update the magical effects of an item if it’s marked as identified without re-rendering
function updateMagicalEffects(event) {
    const itemId = event.target.getAttribute("data-id");
    const newMagicalEffects = event.target.value;

    const item = cart.find(i => i.id === itemId);
    if (item && item.isIdentified) {
        item.magicalEffects = newMagicalEffects;
    }
}

// Update the locationLooted field for an item in Loot mode without re-rendering
function updateLocationLooted(event) {
    const itemId = event.target.getAttribute("data-id");
    const newLocationLooted = event.target.value;

    const item = cart.find(i => i.id === itemId);
    if (item && isLootMode) {
        item.locationLooted = newLocationLooted;
    }
}







