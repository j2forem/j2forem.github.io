// cart_ui.js
console.log('cart_ui.js loaded successfully');
import { addToCart, removeFromCart, updateCartQuantity, reviewCart, clearCart } from './cart_main.js';

// Handle adding an item to the cart through the UI
document.getElementById('addItemBtn').addEventListener('click', () => {
  const itemName = document.getElementById('itemName').value;
  const itemPrice = parseFloat(document.getElementById('itemPrice').value);
  const itemWeight = parseFloat(document.getElementById('itemWeight').value);
  const itemDescription = document.getElementById('itemDescription').value;
  const itemQty = parseInt(document.getElementById('itemQty').value) || 1;  // Default to 1 if qty not specified

  const itemDetails = {
    itemName,
    price: itemPrice,
    weight: itemWeight,
    description: itemDescription,
    qty: itemQty
  };

  addToCart(itemDetails);  // Add the item to the cart
  reviewCart();  // Review cart and update UI
});

// Handle removing an item from the cart through the UI
document.getElementById('removeItemBtn').addEventListener('click', () => {
  const itemName = document.getElementById('removeItemName').value;
  removeFromCart(itemName);
  reviewCart();  // Update the cart display after removal
});

// Handle updating the quantity of an item in the cart
document.getElementById('updateQtyBtn').addEventListener('click', () => {
  const itemName = document.getElementById('updateItemName').value;
  const newQty = parseInt(document.getElementById('updateQty').value);
  updateCartQuantity(itemName, newQty);
  reviewCart();  // Update the cart display after quantity change
});

// Clear the cart (for example, after checkout)
document.getElementById('clearCartBtn').addEventListener('click', () => {
  clearCart();  // Clear the cart
  reviewCart();  // Update the cart display
});
