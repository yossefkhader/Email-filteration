// Scroll to the top of the page on reload
window.addEventListener('load', () => {
    setTimeout(() => {
        window.scrollTo(0, 0);  // Scroll to the top
    }, 100);
});

document.addEventListener("DOMContentLoaded", () => {
    let currentRules = [];  // Store the current rules from the JSON file

    const rulesTableBody = document.querySelector('#rules-table tbody');
    const editButton = document.getElementById('edit-rules');
    const doneButton = document.getElementById('done-editing');
    const addRuleForm = document.getElementById('add-rule-form');
    const rulesTableHead = document.querySelector('#rules-table thead');


    let aiRules = [];  // To store the AI-generated rules
    const errorMessageContainer = document.getElementById('ai-error-message');
    const aiResponseSection = document.getElementById('ai-response-section');
    const submitButton = document.getElementById('submit-to-ai');
    const approveButton = document.getElementById('approve-rules');
    const loadingIndicator = document.getElementById('loading-indicator');
    const aiTableHead = document.querySelector('#ai-rules-table thead');  



    // Ensure table header is visible only when there are rules
    rulesTableHead.style.display = 'none';  // Hide the table header when no rules
    aiTableHead.style.display = 'none';


    // Fetch and display existing rules from /api/rules
    fetch('/api/rules')
        .then(response => response.json())
        .then(data => {
            currentRules = data;
            displayRules(currentRules);  // Handle valid response
        })
        .catch(error => {
            console.error('Error fetching rules:', error);
        });

    // Display rules if they exist, otherwise handle empty state
    const displayRules = (rules, isEditMode = false) => {
        rulesTableBody.innerHTML = '';  // Clear existing rows
    
        if (rules.length > 0) {
            rulesTableHead.style.display = 'table-header-group';  // Show the table header
            rules.forEach((rule, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${rule.condition}</td><td></td>`;  // Insert rule condition
                rulesTableBody.appendChild(row);
    
                // If in edit mode, add Delete buttons
                if (isEditMode) {
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.addEventListener('click', () => deleteRule(index));  // Add delete functionality
                    row.querySelector('td:nth-child(2)').appendChild(deleteButton);  // Add the delete button to the right column
                }
            });
    
            if (!doneButton.style.display || doneButton.style.display === 'none') {
                editButton.style.display = 'inline-block';  // Show the edit button if not in edit mode
            }
        } else {
            rulesTableHead.style.display = 'none';  // Hide the table header when no rules
            editButton.style.display = 'none';  // Hide the edit button
        }
    };

    // Enter Edit Mode
    editButton.addEventListener('click', () => {
        enterEditMode();
    });

    // Exit Edit Mode
    doneButton.addEventListener('click', () => {
        exitEditMode();
    });

    // Enter Edit Mode (disables other parts of the site, shows Delete buttons)
    const enterEditMode = () => {
        editButton.style.display = 'none';  // Hide Edit button
        doneButton.style.display = 'inline-block';  // Show Done button
        submitButton.disabled = true;  // Disable the submit button
        approveButton.disabled = true;  // Disable the approve button
        addRuleForm.style.pointerEvents = 'none';  // Disable other parts of the form

        // Re-render the rules with Delete buttons in Edit Mode
        displayRules(currentRules, true);  // Pass true to indicate Edit Mode
    };

    // Exit Edit Mode (enables other parts of the site, removes Delete buttons)
    const exitEditMode = () => {
        doneButton.style.display = 'none';  // Hide Done button
        editButton.style.display = 'inline-block';  // Show Edit button
        submitButton.disabled = false;  // Enable the submit button
        approveButton.disabled = false;  // Enable the approve button
        addRuleForm.style.pointerEvents = 'auto';  // Enable other parts of the form

         // Re-render the rules without Delete buttons in non-edit mode
        displayRules(currentRules, false);  // Pass false to indicate not in Edit Mode
    };

    // Delete a rule
    const deleteRule = (index) => {
        currentRules.splice(index, 1);  // Remove the rule from the array

        // Update the rules.json file on the server
        fetch('/api/delete-rule', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rules: currentRules })  // Send the updated rules array
        })
        .then(response => {
            if (!response.ok) {
                // If the response status is not OK (e.g., 500), throw an error
                return response.json().then(data => {
                    throw new Error(data.error || 'Failed to delete rule');
                });
            }
            return response.json();  // Parse the response JSON
        })
        .then(() => {
            // After deleting, stay in edit mode but don't show the Edit button
            displayRules(currentRules,true);  // Re-render the rules
            
            // If all rules are deleted, automatically exit edit mode
            if (currentRules.length === 0) {
                exitEditMode();
                doneButton.style.display = 'none';  // Hide Done button if no rules are left
            }
        })
        .catch(error => {
            // Handle errors and display an error message
            console.error('Error deleting rule:', error);
            alert(`Error: ${error.message}`);  // Show a user-friendly error message
        });
    };

    
       
    // Handle submitting the condition to the AI API
    submitButton.addEventListener('click', () => {
        const ruleCondition = document.getElementById('rule-condition').value;
    
        if (ruleCondition) {
            // Clear any previous error message
            errorMessageContainer.innerHTML = '';
            loadingIndicator.style.display = 'block';  // Show loading indicator
            submitButton.disabled = true;  // Disable the submit button

            // Send the user input to the AI API
            fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input: ruleCondition })
            })
            .then(response => {
                if (!response.ok) {
                    // If the status is not OK (e.g., 400 or 500), throw an error
                    return response.json().then(data => {
                        throw new Error(data.error || 'Unknown error occurred.');
                    });
                }
                return response.json();
            })
            .then(data => {
                if (data.error) {
                    // If the AI responds with an error, display the error message
                    errorMessageContainer.innerHTML = `Error: ${data.error}`;
                    approveButton.style.display = 'none';  // Hide approve button on error
                    aiTableHead.style.display = 'none';  // Hide the AI table header on error
                } else {
                    aiRules = data.response;
                    displayAiRules(data.response);  // Pass the AI-generated rules to displayAiRules
                }
            })
            .catch(error => {
                // Handle network or other errors
                errorMessageContainer.innerHTML = `Error: ${error.message}`;
                approveButton.style.display = 'none';  // Hide approve button on error
                aiTableHead.style.display = 'none';  // Hide the AI table header on error
            })
            .finally(() => {
                loadingIndicator.style.display = 'none';  // Hide the loading indicator
                submitButton.disabled = false;  // Re-enable the submit button
            });

        } else {
            alert('Please provide a condition.');
        }
    });
    
    // Display AI-generated rules in the table
    const displayAiRules = (rules) => {
        const aiTableBody = document.querySelector('#ai-rules-table tbody');
        aiTableBody.innerHTML = '';  // Clear any existing rows

        if (rules.length > 0) {
            // If there are rules, show the table header and fill in the rules
            aiTableHead.style.display = 'table-header-group';
            rules.forEach(rule => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${rule.condition}</td>`;
                aiTableBody.appendChild(row);
            });
            approveButton.style.display = 'block';  // Show the approve button
        } else {
            aiTableHead.style.display = 'none';  // Hide the table header when no rules
        }
    };

    // Handle approving the AI-generated rules
    approveButton.addEventListener('click', () => {
        if (aiRules.length > 0) {
            // Send the approved AI rules to the server to be saved in rules.json
            fetch('/api/save-rule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rules: aiRules })  // Send the AI rules
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);  // Notify the user that the rules were saved
                location.reload();     // Reload the page to fetch the updated rules
            })
            .catch(error => console.error('Error:', error));
        } else {
            alert('No AI rules to approve.');
        }
    });
});