// main.js
// Log to verify that main.js is loaded
console.log('main.js is loaded');
import { toggleMode, finalizePayment } from './modules/cart/cart.js';
import { loadWalletModule } from './modules/wallet/wallet.js';
import {loadNavbar} from './navbar.js';
// Import other modules when ready

function initializeApp() {
    document.addEventListener("DOMContentLoaded", () => {
        loadWalletModule();  // Make sure this only runs once the DOM is ready
    });
}

initializeApp();



// Add event listener for the Finalize Payment button
document.addEventListener("DOMContentLoaded", () => {
        const finalizeButton = document.getElementById("finalize-payment-button");
    if (finalizeButton) {
        finalizeButton.addEventListener("click", finalizePayment);
    }
});

document.querySelectorAll('#navbar a').forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        targetElement.scrollIntoView({ behavior: 'smooth' });
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const navbarSearchInput = document.getElementById("navbar-search-input");
    const navbarSearchButton = document.getElementById("navbar-search-button");
    const collectionDropdown = document.getElementById("collection-dropdown");

    if (!navbarSearchInput || !navbarSearchButton || !collectionDropdown) {
        console.error("Navbar search elements are missing.");
        return;
    }

    // Handle Enter key press in the search input
    navbarSearchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            performNavbarSearch();
        }
    });

    // Handle Search button click
    navbarSearchButton.addEventListener("click", performNavbarSearch);

    function performNavbarSearch() {
        const searchTerm = navbarSearchInput.value.trim();
        const selectedCollection = collectionDropdown.value;

        if (!selectedCollection) {
            alert("Please select a category first.");
            return;
        }

        if (searchTerm) {
                // Redirect to search page with search term and selected collection as URL parameters
                window.location.href = `./modules/search/search.html?query=${encodeURIComponent(searchTerm)}&category=${encodeURIComponent(selectedCollection)}`;
            }
        }
    });
