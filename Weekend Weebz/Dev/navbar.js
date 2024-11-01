// navbar.js

// Load the navbar and insert it into the DOM
export function loadNavbar() {
    return fetch('navbar.html')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.text();
        })
        .then(data => {
            const navbarContainer = document.createElement('div');
            navbarContainer.innerHTML = data;
            document.body.insertBefore(navbarContainer, document.body.firstChild);

            // After loading the navbar, set up the button URLs
            setupNavbarButtonUrls();
        })
        .catch(error => console.error('Error loading navbar:', error));
}

// Set up URLs for navbar buttons with data-url attributes
function setupNavbarButtonUrls() {
    const navButtons = document.querySelectorAll(".navbar button[data-url]");

    navButtons.forEach(button => {
        const absoluteUrl = button.getAttribute("data-url");
        button.onclick = () => { window.location.href = absoluteUrl; };
    });
}
