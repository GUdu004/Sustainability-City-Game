# Sustainability City Advisor

## Overview

Sustainability City Advisor is an interactive game where players take on the role of a city mayor, making decisions that impact the environment, economy, and happiness of their citizens. The game features a turn-based decision loop, an AI advisor providing insights, and a dynamic 3D city view that visually reflects the consequences of player choices.

## Features

- **Turn-Based Gameplay**: Players make decisions that affect three key stats: Environment, Economy, and Happiness.
- **AI Advisor**: An AI advisor offers advice and insights before each decision, enhancing the gameplay experience.
- **3D City Visualization**: The game includes an interactive 3D city model built with Three.js, allowing players to see the immediate effects of their decisions.
- **Dynamic Feedback**: Players receive feedback on their decisions, explaining the impacts on the city’s stats and sustainability.
- **Multiple Endings**: The game features various possible endings based on player performance, ranging from a thriving "Green Utopia" to a collapsing "Corporate Dystopia."

## Technical Stack

- **Frontend**: React, Vite, TypeScript, Three.js
- **Backend**: Node.js, Express, TypeScript
- **Database**: Firestore (GCP)
- **AI Integration**: Gemini API
- **Deployment**: Google Cloud Platform (Cloud Run, Firebase Hosting)

## Getting Started

### Prerequisites

- Node.js and npm installed on your machine.
- Access to Google Cloud Platform for backend deployment.
- Firebase account for hosting the frontend.

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd sustainable-city-advisor
   ```

2. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```

3. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

### Running the Application

- To start the frontend development server:
  ```
  cd frontend
  npm run dev
  ```

- To start the backend server:
  ```
  cd backend
  npm start
  ```

### Deployment

Refer to the `docs/DeploymentGuide.md` for detailed instructions on deploying the application to Google Cloud Platform and Firebase.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.