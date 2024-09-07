بسم الله الرحمن الرحيم

# Email Filteration Project

This project is a rule-based email filtering system that integrates with AI (OpenAI API) to help users manage and prioritize their email communications. The project allows you to define and modify rules for filtering emails based on specific conditions, and it supports user interaction with an AI API to generate or refine these rules.

## Features

- Create and edit rules for email filtering.
- Integrate with OpenAI API to automatically generate filtering rules based on user input.
- Approve AI-generated rules and store them.
- Full rule management via a user-friendly web interface.
- Deployed on Heroku for easy access.
- Sensitive user data is securely stored using environment variables.

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/YossefK9/email-filteration.git
   cd email-filteration
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory and add your OpenAI API key and user data configurations:
     ```
     OPENAI_API_KEY=your_openai_api_key
     USER_NAME=your_username
     USER_NAME_VARIATIONS="variation1, variation2"
     USER_EMAIL=your_email@example.com
     ```

4. Start the server:
   ```bash
   npm start
   ```

## Usage

- Visit the application at `http://localhost:3000` after running the server.
- Define new rules using the web interface.
- Use the AI integration to suggest filtering rules based on specific inputs.
- Approve or modify AI-suggested rules, and they will be saved.
- Sensitive user information like the username, username variations, and user email are securely stored in environment variables and retrieved dynamically.

## API Endpoints

- **`/api/rules`**: Get the current list of rules.
- **`/api/ai`**: Submit a rule condition to the AI for generating rules.
- **`/api/save-rule`**: Save the approved AI-generated rule.
- **`/api/delete-rule`**: Delete a specific rule.
- **`/api/user-data`**: Fetch sensitive user data such as username, username variations, and user email.

## Deployment on Heroku

1. Install the Heroku CLI and log in:
   ```bash
   heroku login
   ```

2. Create a new Heroku app:
   ```bash
   heroku create
   ```

3. Push to Heroku:
   ```bash
   git push heroku main
   ```

4. Set your environment variables on Heroku:
   ```bash
   heroku config:set OPENAI_API_KEY=your_openai_api_key
   heroku config:set USER_NAME=your_username
   heroku config:set USER_NAME_VARIATIONS="variation1, variation2"
   heroku config:set USER_EMAIL=your_email@example.com
   ```

## License

This project is licensed under the MIT License. See the LICENSE.txt file for more details.

## Contributing

This project is maintained by a core team of contributors. While the repository is public for transparency and visibility, contributions are restricted to team members with write access.

### For Team Members:
1. Please follow internal contribution guidelines.
2. Ensure your changes are submitted via a pull request and reviewed by another team member.
3. Only team members can directly push or merge pull requests to the main branch.

### For External Contributors:
1. Fork this repository and submit a pull request for consideration.
2. Please be aware that external contributions will be reviewed but may not be accepted unless they align with the project goals.