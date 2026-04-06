# Chatbot Server

Express backend server for the emotional support chatbot.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Add your OpenAI API key to the `.env` file:
```
OPENAI_API_KEY=your_actual_api_key_here
```

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will run on `http://localhost:3001` by default (or the port specified in `.env`).

## API Endpoints

### GET /api/personalities
Returns available personality options.

**Response:**
```json
{
  "personalities": [
    {
      "name": "empathetic",
      "description": "A gentle, understanding listener who provides emotional support"
    },
    // ... other personalities
  ]
}
```

### POST /api/chat
Sends a message and receives a personality-specific response.

**Request Body:**
```json
{
  "userId": "user123",
  "message": "I'm feeling stressed today",
  "personality": "empathetic"
}
```

**Response:**
```json
{
  "response": "I understand that you're feeling stressed...",
  "personality": "empathetic"
}
```

## Available Personalities

- **empathetic**: Gentle, understanding listener
- **motivational**: Encouraging, action-oriented coach
- **calming**: Peaceful, grounding presence
- **cheerful**: Upbeat, positive energy

## Features

- In-memory conversation history (indexed by userId)
- Personality-specific system prompts
- OpenAI GPT-3.5-turbo integration
- CORS enabled
- Comprehensive error handling

