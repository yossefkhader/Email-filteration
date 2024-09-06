const errorMsg = "Error: No rules provided."

const messages = {
    errorMessage: errorMsg,  // Reusable error message if needed
    validationMessage: 'Please provide a valid set of rules.',  // Example of another message
    aiPrompt: `You will be given a set of rules to filter Outlook emails. Your job is to process the rules and return them in JSON format for easier deployment. The JSON must follow this structure:

    [
      {
        "id": "Unique identifier",
        "condition": "Condition for the rule"
      }
    ]
    
    Important:
    - If the importance of the rule isn't mentioned, that means it's important.
    - Return only the JSON response, without any extra explanations or text.
    - Make sure to return the response as **a proper JSON object**, not a string.
    - If no rules are provided, reply with the message: "${errorMsg}"
    - Respond with a valid JSON structure only. Do not wrap your response in code blocks like \`\`\`json.
    
    Example response:
    [
      {
        "id": "rule-1",
        "condition": "If I'm the only one in the TO field and there's no CC, this email is important"
      },
      {
        "id": "rule-2",
        "condition": "If the message body starts with any variation of 'Hi Haitham', this email is important"
      }
    ]
    `
};

module.exports = messages;
