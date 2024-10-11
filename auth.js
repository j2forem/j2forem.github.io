// Handle client loading and initialization for Google API
function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

// Initialize Google API client with the correct OAuth settings
function initClient() {
    gapi.client.init({
        clientId: '67955600118-faqe0ln6t56pgnd7gnakcc1j5nqpc0qc.apps.googleusercontent.com',
        scope: 'https://www.googleapis.com/auth/spreadsheets'
    }).then(function() {
        // Try to sign in the user
        if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
            handleSignInClick();
        }
    }).catch(function(error) {
        console.error("Error initializing Google API client:", error);
    });
}

// Handle user sign-in
function handleSignInClick() {
    gapi.auth2.getAuthInstance().signIn();
}

// Handle user sign-out
function handleSignOutClick() {
    gapi.auth2.getAuthInstance().signOut();
}

// Call when the page loads to initialize the client
document.addEventListener('DOMContentLoaded', handleClientLoad);
