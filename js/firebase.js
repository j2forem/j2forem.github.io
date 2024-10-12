// firebase.js

// Function to retrieve items from Firestore based on category and search term
function getItems(category, searchTerm) {
    return db.collection('Weapons')  // Ensure 'Weapons' is the collection name
      .where('category', '==', category)  // Filter by category to reduce unnecessary reads
      .where('name', '>=', searchTerm)  // Search for names starting with searchTerm
      .where('name', '<=', searchTerm + '\uf8ff')  // Partial match to capture similar names
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
  
  
  