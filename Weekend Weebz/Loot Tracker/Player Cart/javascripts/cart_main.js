// cart_main.js

console.log('cart_main.js loaded successfully');

// Initialize an empty cart array
let cart = [];

// Function to add an item to the cart
export function addToCart(itemDetails) {
  const { itemName, price, weight, description, qty = 1 } = itemDetails;

  // Check if the item already exists in the cart (to update the quantity)
  const existingItem = cart.find(cartItem => cartItem.itemName === itemName);

  if (existingItem) {
    // If the item already exists, update the quantity
    existingItem.qty += qty;
    console.log(`Updated ${itemName} quantity to ${existingItem.qty}`);
  } else {
    // Add the new item with all details to the cart
    cart.push({
      itemName,
      price,
      weight,
      description,
      qty
    });
    console.log(`Added to cart: ${itemName}, Qty: ${qty}, Price: ${price} gold`);
  }
}

// Function to remove an item from the cart
export function removeFromCart(itemName) {
  const index = cart.findIndex(cartItem => cartItem.itemName === itemName);
  if (index !== -1) {
    cart.splice(index, 1);  // Remove the item
    console.log(`Removed from cart: ${itemName}`);
  } else {
    console.log(`Item not found in cart: ${itemName}`);
  }
}

// Function to update the quantity of an item in the cart
export function updateCartQuantity(itemName, newQty) {
  const cartItem = cart.find(cartItem => cartItem.itemName === itemName);
  if (cartItem) {
    cartItem.qty = newQty;
    console.log(`Updated ${itemName} quantity to ${newQty}`);
  } else {
    console.log(`Item not found in cart: ${itemName}`);
  }
}

// Function to review cart and calculate the total price and weight
export function reviewCart() {
  let totalCost = 0;
  let totalWeight = 0;

  cart.forEach(cartItem => {
    const itemCost = cartItem.price * cartItem.qty;
    const itemWeight = cartItem.weight * cartItem.qty;
    
    totalCost += itemCost;
    totalWeight += itemWeight;

    console.log(`Item: ${cartItem.itemName}, Qty: ${cartItem.qty}, Price: ${cartItem.price} gold each, Total: ${itemCost} gold`);
  });

  console.log(`Total cart cost: ${totalCost} gold`);
  console.log(`Total cart weight: ${totalWeight} lbs`);
  return { totalCost, totalWeight };
}

// Function to clear the cart (e.g., after checkout)
export function clearCart() {
  cart = [];  // Reset the cart array
  console.log('Cart has been cleared.');
}

// Function to return the full cart (useful for placing items in PartyInventory)
export function getCartItems() {
  return cart;  // Return the current state of the cart
}
