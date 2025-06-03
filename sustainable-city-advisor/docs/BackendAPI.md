# Sustainable City Advisor - Backend API Design

## Base URL
Development: `http://localhost:3001/api`
Production: `https://your-app.run.app/api`

## Authentication
- No authentication required for MVP
- Future: Firebase Auth integration

## Core Endpoints

### Game State Management

#### GET /game/state
Get current game state including stats, turn number, and game status.

**Response**:
```json
{
  "stats": {
    "environment": 60,
    "economy": 55,
    "happiness": 65
  },
  "turn": 1,
  "maxTurns": 52,
  "gameStatus": "active", // "active" | "ended"
  "endingType": null, // null | "victory" | "failure"
  "endingTitle": null, // null | string
  "sceneElements": [
    {
      "id": "city-hall",
      "type": "building",
      "modelPath": "/models/city-hall.glb",
      "position": { "x": 0, "y": 0, "z": 0 },
      "scale": { "x": 1, "y": 1, "z": 1 }
    }
  ]
}
```

#### POST /game/reset
Reset the game to initial state.

**Response**:
```json
{
  "message": "Game reset successfully",
  "gameState": { /* full game state */ }
}
```

### Decision Management

#### GET /game/decision/current
Get the current decision for the player to make.

**Response**:
```json
{
  "id": "tech-company-datacenter",
  "title": "Tech Company Data Center",
  "description": "A major tech company wants to build a data center in your city. They promise 500 new jobs but the facility will consume significant electricity.",
  "category": "economic",
  "choices": [
    {
      "id": "accept-with-incentives",
      "text": "Welcome them with tax breaks",
      "impact": {
        "environment": -5,
        "economy": 15,
        "happiness": 5
      },
      "sceneChanges": [
        {
          "action": "add",
          "element": {
            "id": "datacenter-1",
            "type": "building",
            "modelPath": "/models/datacenter.glb",
            "position": { "x": 10, "y": 0, "z": 5 }
          }
        }
      ]
    },
    {
      "id": "accept-with-green-requirements",
      "text": "Accept but require renewable energy",
      "impact": {
        "environment": 3,
        "economy": 8,
        "happiness": 8
      },
      "sceneChanges": [
        {
          "action": "add",
          "element": {
            "id": "green-datacenter-1",
            "type": "building",
            "modelPath": "/models/green-datacenter.glb",
            "position": { "x": 10, "y": 0, "z": 5 }
          }
        }
      ]
    },
    {
      "id": "reject-preserve-nature",
      "text": "Reject to preserve the natural area",
      "impact": {
        "environment": 10,
        "economy": -3,
        "happiness": 2
      },
      "sceneChanges": []
    }
  ]
}
```

#### POST /game/decision/make
Submit a decision choice and get the results.

**Request**:
```json
{
  "decisionId": "tech-company-datacenter",
  "choiceId": "accept-with-incentives"
}
```

**Response**:
```json
{
  "success": true,
  "feedback": "The tech company breaks ground immediately. Citizens are excited about new jobs, but environmental groups raise concerns about energy consumption.",
  "statChanges": {
    "environment": -5,
    "economy": 15,
    "happiness": 5
  },
  "newStats": {
    "environment": 55,
    "economy": 70,
    "happiness": 70
  },
  "sceneChanges": [
    {
      "action": "add",
      "element": {
        "id": "datacenter-1",
        "type": "building",
        "modelPath": "/models/datacenter.glb",
        "position": { "x": 10, "y": 0, "z": 5 }
      }
    }
  ],
  "gameStatus": "active",
  "nextDecisionAvailable": true
}
```

### AI Advisor

#### GET /game/advisor
Get advice from the AI advisor for the current situation.

**Query Parameters**:
- `decisionId` (optional): Get advice specific to a decision

**Response**:
```json
{
  "message": "Your economy is doing well, but I'm noticing the environment score dropping. Consider balancing your next few decisions to avoid long-term problems.",
  "personality": "concerned", // "optimistic" | "concerned" | "sarcastic" | "encouraging"
  "priority": "environment", // suggests which stat needs attention
  "context": "current_state" // "current_state" | "decision_specific"
}
```

#### GET /game/advisor/decision/:decisionId
Get decision-specific advice from the AI advisor.

**Response**:
```json
{
  "message": "This is a classic sustainability dilemma! Short-term economic gains versus long-term environmental health. What kind of mayor do you want to be?",
  "personality": "analytical",
  "suggestedChoice": "accept-with-green-requirements",
  "reasoning": "This choice balances economic growth with environmental responsibility."
}
```

## Data Models

### GameState
```typescript
interface GameState {
  stats: {
    environment: number; // 0-100
    economy: number;     // 0-100
    happiness: number;   // 0-100
  };
  turn: number;
  maxTurns: number;
  gameStatus: 'active' | 'ended';
  endingType?: 'victory' | 'failure';
  endingTitle?: string;
  sceneElements: SceneElement[];
  history: DecisionHistory[];
}
```

### Decision
```typescript
interface Decision {
  id: string;
  title: string;
  description: string;
  category: 'infrastructure' | 'economic' | 'environmental' | 'social';
  choices: Choice[];
  minTurn?: number; // earliest turn this can appear
  maxTurn?: number; // latest turn this can appear
  prerequisites?: string[]; // required previous decisions
}
```

### Choice
```typescript
interface Choice {
  id: string;
  text: string;
  impact: {
    environment: number;
    economy: number;
    happiness: number;
  };
  sceneChanges?: SceneChange[];
  feedback?: string; // custom feedback for this choice
}
```

### SceneElement
```typescript
interface SceneElement {
  id: string;
  type: 'building' | 'vegetation' | 'infrastructure' | 'effect';
  modelPath: string;
  position: { x: number; y: number; z: number };
  scale?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  materials?: MaterialOverride[];
}
```

### SceneChange
```typescript
interface SceneChange {
  action: 'add' | 'remove' | 'modify';
  element: SceneElement;
}
```

## Error Handling

All endpoints return errors in this format:
```json
{
  "error": true,
  "message": "Description of what went wrong",
  "code": "ERROR_CODE",
  "details"?: any
}
```

Common error codes:
- `GAME_ENDED`: Trying to make decisions when game is over
- `INVALID_DECISION`: Decision ID not found
- `INVALID_CHOICE`: Choice ID not valid for decision
- `GAME_NOT_FOUND`: Game state not initialized
- `TURN_LIMIT_EXCEEDED`: Game has reached maximum turns

## Status Codes
- **200 OK**: Successful request
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid input or request format
- **404 Not Found**: Requested resource does not exist
- **409 Conflict**: Game state conflict (e.g., game already ended)
- **500 Internal Server Error**: Server error