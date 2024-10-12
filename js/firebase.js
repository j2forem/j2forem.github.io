// firebase.js

// Ensure your Firebase configuration is properly initialized above this (if not already)

// Function to retrieve items from Firestore based on category and search term
function getItems(category, searchTerm) {
    return db.collection('items')  // Replace 'items' with your Firestore collection
      .where('category', '==', category)
      .where('name', '>=', searchTerm)
      .where('name', '<=', searchTerm + '\uf8ff')  // This ensures a partial match search
      .get()
      .then(snapshot => {
        const items = [];
        snapshot.forEach(doc => {
          items.push({ ...doc.data(), id: doc.id });
        });
        return { items };
      })
      .catch(error => {
        console.error('Error fetching items from Firestore:', error);
        throw error;
      });
  }
  