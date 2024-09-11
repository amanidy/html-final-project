// expense.js
document.addEventListener('DOMContentLoaded', function() {
  // Assuming the expense ID is passed via query string, e.g., /edit-expense?id=1
  const urlParams = new URLSearchParams(window.location.search);
  const expenseId = urlParams.get('id'); // Fetch the ID from URL

  if (expenseId) {
    fetch(`http://localhost:5000/expenses/${expenseId}`)
      .then(response => response.json())
      .then(expense => {
        // Populate the form fields with the fetched data
        document.getElementById('date').value = expense.date;
        document.getElementById('amount').value = expense.amount;
        document.getElementById('category').value = expense.category;
        document.getElementById('description').value = expense.description;
        document.getElementById('expense-id').value = expense.id; // Hidden field for expense ID
      })
      .catch(error => console.error('Error fetching expense:', error));
  } else {
    console.error('No expense ID found in URL');
  }
});