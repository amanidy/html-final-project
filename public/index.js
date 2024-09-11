document.addEventListener('DOMContentLoaded', function() {
  fetch('http://localhost:5000/expenses')
    .then(response => response.json())
    .then(data => {
      const tableBody = document.getElementById('expense-table-body');
      if (!tableBody) {
        console.error('Table body element not found');
        return;
      }
      data.forEach(expense => {
        const row = document.createElement('tr');

        // Format the date
        const formattedDate = new Date(expense.date).toISOString().split('T')[0];

        row.innerHTML = `
          <tr id="expense-row-${expense.id}">
            <td>${formattedDate}</td>
            <td>Ksh${expense.amount}</td>
            <td>${expense.category}</td>
            <td>${expense.description}</td>
            <td>
              <button class="edit-button">Edit</button>
              <button class="delete-button" data-expense-id="${expense.id}">Delete</button>
              <input type="hidden" id="expense-id" value="{{ expense.id }}">
            </td>
          </tr>
        `;

        const editButton = row.querySelector('.edit-button');
        editButton.onclick = function() {
          editExpense(expense.id);
        };

        const deleteButton = row.querySelector('.delete-button');
        const deleteExpenseId = expense.id; // Capture the expense.id value
        deleteButton.onclick = function() {
          deleteExpense(deleteExpenseId); // Pass the captured expense.id value
        };

        tableBody.appendChild(row);
      });
    })
    .catch(error => console.error('Error fetching expenses:', error));
});

function editExpense(id) {
  window.location.href = `Edit-expense.html?id=${id}`;
}

function deleteExpense(id) {
  alert(`Deleting expense with ID: ${id}`);
  console.log('Deleting expense with ID:', id); // Log the ID to ensure it’s correct
  if (!id) {
    console.error('No ID provided for deletion');
    return;
  }
  if (confirm('Are you sure you want to delete this expense?')) {
    fetch(`http://localhost:5000/delete-expense/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(response => {
      if (response.ok) {
        // Remove the row from the table or reload the page
        const row = document.querySelector(`#expense-row-${id}`);
        if (row) {
          row.remove();
        }
        console.log('Expense deleted successfully');
      } else {
        console.error('Failed to delete expense');
      }
    })
    .catch(error => console.error('Error:', error));
  }
}
