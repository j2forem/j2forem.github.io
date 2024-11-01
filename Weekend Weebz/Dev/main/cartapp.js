import { db } from '../../config/firebase.js';
import { doc, getDoc, setDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';
import { renderCartItems,generateUniqueId } from '../ui/cartUI.js';
import { adjustPartyFunds } from './walletapp.js';
import { renderPaymentInfo } from '../ui/paymentUI.js';

export const cartState = {
    items: []
};


export function addToCart(item, quantity = 1) {
    console.log('Adding item to cart with price parsing:', item, 'Quantity:', quantity);

    if (quantity <= 0) {
        console.error('Quantity must be positive.');
        return;
    }

    // Parse the price as a float to ensure it can handle decimals
    const parsedPrice = parseFloat(item.price);
    if (isNaN(parsedPrice)) {
        console.error(`Invalid price for item: ${item.name}, received: ${item.price}`);
        return;
    }

    // Update the item object with the parsed price
    item.price = parsedPrice;

    // Add the item to the cart
    const newItem = {
        ...item,
        quantity: quantity,
    };
    cartState.items.push(newItem);
    console.log(`Added new item ${item.name} to the cart with parsed price.`);

    renderCartItems();
    renderPaymentInfo();
}




export function saveItemDetails(itemId) {
    const itemIndex = cartState.items.findIndex(item => generateUniqueId(item) === itemId);
    if (itemIndex >= 0) {
        const item = cartState.items[itemIndex];
        item.name = document.getElementById(`itemName-${itemId}`).value;
        item.price = parseFloat(document.getElementById(`itemPrice-${itemId}`).value);
        item.quantity = parseInt(document.getElementById(`itemQuantity-${itemId}`).value, 10);
        item.isMagical = document.getElementById(`isMagical-${itemId}`).checked;
        item.magicalDescription = document.getElementById(`magicalDescription-${itemId}`).value;
        item.isIdentified = document.getElementById(`isIdentified-${itemId}`).checked;
        item.magicalStats = document.getElementById(`magicalStats-${itemId}`).value;
        item.lootLocation = document.getElementById(`lootLocation-${itemId}`).value;
        item.loottimestamp = document.getElementById(`lootTimestampDisplay-${itemId}`).textContent;

        console.log(`Saved details for item: ${item.name}`);
        renderCartItems();
    }
}

// Function to remove an item from the cart
export function removeFromCart(itemId) {
    const initialLength = cartState.items.length;
    cartState.items = cartState.items.filter(item => generateUniqueId(item) !== itemId);

    if (cartState.items.length === initialLength) {
        console.error(`Item with ID: ${itemId} not found in cart.`);
    } else {
        console.log(`Removed item with ID: ${itemId} from the cart.`);
    }

    renderCartItems();
    renderPaymentInfo(); // Update payment info after removing an item
}

// Function to calculate the total amount owed based on cart items
export function calculateCartTotal() {
    return cartState.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
}



export async function finalizeCart(context) {
    try {
        // Create a temporary object to group similar items before saving to Firestore
        const groupedItems = {};

        // Group items before saving to the database
        for (const cartItem of cartState.items) {
            // Generate a base identifier for grouping
            const baseId = cartItem.isMagical
                ? generateUniqueId(cartItem) // Use unique ID for magical items
                : cartItem.id; // Use simple ID for non-magical items

            // If the item is non-magical and already exists in the groupedItems object, sum their quantities
            if (!cartItem.isMagical && groupedItems[baseId]) {
                groupedItems[baseId].quantity += cartItem.quantity;
            } else {
                // Otherwise, add the item as a new entry
                groupedItems[baseId] = {
                    ...cartItem
                };
            }
        }

        // Now save groupedItems to Firestore
        for (const [itemKey, itemData] of Object.entries(groupedItems)) {
            const itemRef = doc(db, 'PartyInventory', itemKey);
            const itemSnapshot = await getDoc(itemRef);

            if (itemSnapshot.exists()) {
                // If the item already exists in the inventory, update its quantity
                const existingData = itemSnapshot.data();
                const newQuantity = existingData.quantity + itemData.quantity;
                await updateDoc(itemRef, { quantity: newQuantity });
                console.log(`Updated ${itemData.name} quantity to ${newQuantity}.`);
            } else {
                // If it's a new item, add it to the inventory with its properties
                await setDoc(itemRef, itemData);
                console.log(`Added new item ${itemData.name} to inventory.`);
            }
        }

        // Adjust party funds if context is 'purchase'
        if (context === 'purchase') {
            const deductedCoins = calculateDeductedCoins(); // Define this function as per your needs
            await adjustPartyFunds(deductedCoins);
            console.log('Adjusted party funds for purchase.');
        } else if (context === 'loot') {
            console.log('Items added without adjusting funds, as this is a loot action.');
        }

        // Clear the cart after finalizing
        cartState.items = [];
        renderCartItems();
        console.log('Cart finalized.');
    } catch (error) {
        console.error('Error finalizing cart:', error);
    }
}
