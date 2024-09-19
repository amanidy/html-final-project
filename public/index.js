let rows = [];

document.addEventListener('DOMContentLoaded', function () {
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

        
        const formattedDate = new Date(expense.date).toISOString().split('T')[0];

        row.innerHTML = `
          <tr id="expense-row-${expense.id}">
            <td>${formattedDate}</td>
            <td>Ksh${expense.amount}</td>
            <td>${expense.category}</td>
            <td>${expense.description}</td>
            <td>
              <button class="edit-button" data-expense-id="${expense.id}">Edit</button>
              <button class="delete-button" data-expense-id="${expense.id}">Delete</button>
            </td>
          </tr>
        `;

        const editButton = row.querySelector('.edit-button');
        const expenseId = expense.id;
        editButton.onclick = function() {
          editExpense(expenseId);
        };

        const deleteButton = row.querySelector('.delete-button');
        const deleteExpenseId = expense.id; // Capture the expense.id value
        deleteButton.onclick = function() {
          deleteExpense(deleteExpenseId); // Pass the captured expense.id value
        };

        tableBody.appendChild(row);
        rows.push(row);
      });
    })
    .catch(error => console.error('Error fetching expenses:', error));
});

function editExpense(event) {
 const button = event.target.closest('.edit-button');
  console.log('button:', button);
  console.log('button.dataset:', button.dataset);
  const id = button.dataset.expenseId;
  console.log(`Edit button clicked for expense ${id}`);
  // Get the expense row element
  const expenseRow = document.getElementById(`expense-row-${id}`);
  console.log(`expenseRow:`, expenseRow);
  if (!expenseRow) {
    console.error(`Expense row not found for id ${id}`);
    return;
  }
  const expenseDetails = {
    description: expenseRow.querySelector('.description').textContent,
    amount: expenseRow.querySelector('.amount').textContent,
    category: expenseRow.querySelector('.category').textContent,
  };
  // Display an edit form with the expense details pre-filled
  const editForm = `
    <form>
      <label>Description:</label>
      <input type="text" value="${expenseDetails.description}" id="edit-description">
      <br>
      <label>Amount:</label>
      <input type="number" value="${expenseDetails.amount}" id="edit-amount">
      <br>
      <label>Category:</label>
      <input type="text" value="${expenseDetails.category}" id="edit-category">
      <br>
      <button id="save-edit">Save Changes</button>
    </form>
  `;
  // Display the edit form
  const editContainer = document.getElementById('edit-container');
  editContainer.innerHTML = editForm;
  console.log('Edit form displayed');
  // Add an event listener to the save button
  document.getElementById('save-edit').addEventListener('click', event => {
    event.preventDefault();
    console.log('Save button clicked');
    // Get the updated expense details from the edit form
    const updatedExpense = {
      description: document.getElementById('edit-description').value,
      amount: document.getElementById('edit-amount').value,
      category: document.getElementById('edit-category').value,
    };
    // Send a request to update the expense
    fetch(`http://localhost:5000/update-expense/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedExpense),
    })
    .then(response => response.json())
    .then(data => {
      if (data.message === 'Expense updated successfully') {
        console.log('Expense updated successfully');
        // Update the expense row with the new details
        expenseRow.querySelector('.description').textContent = updatedExpense.description;
        expenseRow.querySelector('.amount').textContent = updatedExpense.amount;
        expenseRow.querySelector('.category').textContent = updatedExpense.category;
      } else {
        console.error('Failed to update expense');
      }
    })
    .catch(error => console.error('Error:', error));
  });
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
          row.parentNode.removeChild(row);
        }
        console.log('Expense deleted successfully');
      } else {
        console.error('Failed to delete expense');
      }
    })
    .catch(error => console.error('Error:', error));
  }
}