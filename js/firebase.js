// firebase.js

// Function to retrieve items from a specific Firestore collection based on category and search term
function getItems(category, searchTerm) {
    return db.collection(category)  // The category is used as the collection name (e.g., 'Weapons', 'Armor', etc.)
      .where('name', '>=', searchTerm)  // Search for names starting with searchTerm
      .where('name', '<=', searchTerm + '\uf8ff')  // Partial match search to get similar items
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
  