# Sustainable City Advisor - Development Plan

## The Game Mechanics

The Sustainable City Advisor game centers around the player taking on the role of a city mayor. The core mechanics revolve around managing the city's growth while balancing environmental, economic, and happiness factors.

*   **Turn-Based Decision Loop:** The game progresses in turns (representing days or weeks). Each turn, the player is presented with a single decision or scenario related to city management and sustainability.
*   **Three Key Stats:** The game tracks three vital city statistics:
    *   **Environment 🌱:** Represents the health of the natural environment within and around the city.
    *   **Economy 💰:** Represents the city's financial status and economic growth.
    *   **Happiness 😊:** Represents the satisfaction and well-being of the city's citizens.
    These stats are displayed prominently to the player and are impacted by their decisions.
*   **AI Advisor:** Before making a decision, the player receives advice from an AI advisor. This advisor can be rule-based or powered by the Gemini API, offering insights, warnings, or humorous commentary related to the decision's potential consequences.
*   **Decision Impact:** Each decision the player makes has a quantifiable impact on the three key stats. Some decisions may boost one stat while negatively affecting another, creating trade-offs.
*   **3D City View:** A dynamic 3D model of the city is displayed, visually updating based on the player's decisions. New buildings might appear, areas might become greener or more polluted, reflecting the consequences of their choices.
*   **End States:** The game features multiple possible endings based on the player's performance and the final state of the three key stats. These endings can range from a thriving "Green Utopia" to a collapsing "Corporate Dystopia."

## Technical Stack

*   **Backend:** Node.js (Express or similar), TypeScript
*   **Frontend:** React, Vite, TypeScript
*   **3D Visualization:** Three.js
*   **Database:** Firestore (GCP)
*   **AI Integration:** Gemini API
*   **Deployment & Hosting:** Google Cloud Platform (Cloud Run, Firebase Hosting), Firebase Studio
*   **Version Control:** Git

## Development Plan (Phased Approach)

*(Status indicators: [x] Implemented/Started, [ ] Pending)*

### Phase 0: Planning and Prototyping (Before Week 1) ✅ COMPLETED

*   [x] Initial Game Design: Flesh out the core game design document, detailing the initial set of decisions, their impacts, and the desired stat ranges for different outcomes. (`docs/GameDesign.md` created)
*   [x] Basic UI/UX Sketching: Create wireframes or mockups of the main game screen, including the placement of the 3D city view, stats display, decision area, and advisor section. (Implemented as functional UI components with complete layout)
*   [x] Three.js Scene Prototyping: Create a simple Three.js prototype to test loading and displaying basic 3D models and setting up camera controls. (Full Three.js scene with OrbitControls, lighting, shadows, and model loading implemented in `src/components/CityView.tsx` and integrated into `src/App.tsx`)
*   [x] Backend API Design: Design the basic API endpoints needed for the core gameplay loop (getting state, making decisions). (`docs/BackendAPI.md` created with comprehensive API specification)

### Phase 1: Foundation and Core Mechanics (Weeks 1-3) ✅ COMPLETED

1.  Project Setup:
    *   [x] Initialize a new React project with Vite and TypeScript. (Completed with full TypeScript configuration and working build system)
    *   [x] Set up a Node.js backend project. (Completed in `backend` directory with full TypeScript setup)
    *   [ ] Configure a Git repository and connect it to a hosting service (e.g., GitHub, GitLab). (Striked out for now as requested)
    *   [x] Set up a basic project structure with separate folders for frontend (React) and backend (Node.js). (Complete folder structure implemented)
    *   [x] Create initial frontend components for the game layout and UI elements for displaying stats and decisions. (All core components implemented: App.tsx, StatsDisplay.tsx, DecisionArea.tsx, AdvisorArea.tsx, EndGameScreen.tsx)
    *   [x] Set up a basic Three.js scene in the frontend for the 3D city placeholder. (Comprehensive Three.js implementation with lighting, shadows, model loading, and dynamic environment effects)
2.  Core Gameplay Loop Implementation:
    *   [x] Implement the turn-based decision loop logic in the Node.js backend. (Complete game logic with turn management, decision processing, and game state management)
    *   [x] Define TypeScript interfaces for game data (stats, decisions, advisor messages). (Comprehensive interfaces in both frontend and backend `types/index.ts`)
    *   [x] Create variables for the three key stats (Environment, Economy, Happiness) in the backend. Initialize them with starting values. (Implemented in GameService with proper initialization to 50/50/50)
    *   [x] Develop backend API endpoints using Express (or a similar Node.js framework). (Full Express server with TypeScript, CORS, and proper error handling)
        *   [x] Getting the current game state (stats, current turn). (Implemented `GET /api/game/state` with complete GameState response)
        *   [x] Processing player decisions and updating stats. (Complete decision processing logic with `POST /api/game/decision`)
        *   [x] Getting the next decision. (Decision fetching system implemented with `GET /api/game/decision`)
    *   [x] Create React components to display the stats, fetching data from the backend API. (StatsDisplay.tsx fully implemented with visual bars and color coding)
    *   [x] Implement frontend logic to handle turn progression (e.g., a "Next Turn" button) and communicate with the backend. (Automatic turn progression after decision is made, integrated into App.tsx)
3.  Decision System Implementation:
    *   [x] Store decision data in the backend (e.g., as JSON files or in a database). Define TypeScript interfaces for the decision structure, including the question, choices, and their stat impacts. (Complete decision system with JSON data and comprehensive TypeScript interfaces)
    *   [x] Implement a backend endpoint to fetch a random or sequential decision for the current turn. (`GET /api/game/decision` implemented with proper decision management)
    *   [x] Implement a backend endpoint to receive the player's chosen option and calculate its precise impact on the three stats based on the stored decision data. (`POST /api/game/decision` with full impact calculation and scene changes)
    *   [x] Create React components to display the current decision question and the available choices. Implement event handlers to send the selected choice to the backend API. (DecisionArea.tsx fully implemented with choice impact visualization, category styling, and comprehensive error handling)
4.  Basic End States Implementation:
    *   [x] Define win/lose conditions based on stat thresholds in the backend logic. (Comprehensive end game logic with victory/failure conditions and multiple ending types)
    *   [x] Implement backend logic to check for these conditions after each decision is processed. (Integrated into decision processing pipeline with proper game state updates)
    *   [x] Implement a backend endpoint to indicate if the game has ended and, if so, which ending was reached. (Included in game state API responses with endingType and endingTitle)
    *   [x] Create React components to display different end-game screens or messages based on the backend's response. (EndGameScreen.tsx implemented with letter grades, performance breakdown, and personalized tips)

### Phase 2: AI Advisor and Sustainability Integration (Weeks 4-6)

5.  Simple AI Advisor Implementation:
    *   [x] Implement rule-based logic for the AI advisor in the Node.js backend. (Comprehensive advisor logic with personality-based responses and context awareness)
    *   [x] Store predefined advice messages in the backend, potentially linked to specific stat ranges or decision types. (Multiple personality types with targeted advice based on game state)
    *   [x] Implement a backend endpoint to provide the AI advisor's message for the current turn. (Implemented `GET /api/advisor` with full AdvisorResponse structure)
    *   [x] Create a React component to display the advisor's message prominently before the player makes a choice. (Implemented AdvisorArea.tsx with mood system, avatar, and personality display)
6.  Sustainability Mechanics Implementation:
    *   [x] Design decision data in the backend with a strong focus on eco-dilemmas. Ensure decisions present clear trade-offs between environmental, economic, and happiness impacts. Use TypeScript interfaces to enforce the structure. (Decisions include environmental, economic, infrastructure, and social categories with realistic trade-offs)
    *   [x] Implement backend logic to generate dynamic feedback messages that explain *why* the stats changed based on the player's decision and its sustainability implications. (Dynamic feedback generation with contextual explanations)
    *   [x] Refine the backend stat update logic to accurately reflect complex sustainability interactions (e.g., building a factory boosts the economy but decreases environment and potentially happiness long-term). (Implemented realistic stat impacts with proper boundaries and complex interactions)
    *   [x] Display these dynamic feedback messages in the frontend using React components after a decision is made. (Implemented feedback display in DecisionArea.tsx with choice impact visualization)

### Phase 3: 3D City View and Visual Feedback (Weeks 7-9)

7.  3D City Model Development with Three.js:
    *   [x] Use Three.js in the frontend to build the interactive 3D city scene. (Basic scene set up in CityView.tsx)
    *   [x] Source or create low-poly 3D models for buildings, terrain, trees, and other city elements. Use Three.js loaders (e.g., `GLTFLoader`, `OBJLoader`) to import these models. (Added GLTFLoader and placeholder loading logic)
    *   [x] Set up realistic lighting (directional light for sun, ambient light) and shadows in the Three.js scene. (Implemented shadow maps and light/object shadow properties)
    *   [x] Implement user-friendly camera controls (orbiting, panning, zooming) to allow players to view their city from different angles. (OrbitControls implemented in `CityView.tsx`)
8.  Visual Feedback Implementation with Three.js:
    *   [x] Changing the appearance of existing 3D objects: Modify material colors or textures to indicate pollution levels (e.g., brownish haze, greyed-out buildings) or environmental health (e.g., vibrant greenery, clean water). (Implemented ground color change based on environment stat)
    *   [x] Dynamically adding or removing 3D models: When a player builds a new structure (factory, park, solar farm), add the corresponding 3D model to the scene. When a structure is removed or replaced, remove the model. The backend will send data indicating which visual changes are needed. (Implemented adding/removing models based on sceneElements state)
    *   [x] Potentially adding visual effects: Implement subtle visual cues like smoke particles from factories or glowing solar panels.

### Phase 4: Enhancements and Polish (Weeks 10-12)

9.  Gemini API Integration for AI Advisor (Moderate AI):
    *   [ ] Integrate the Gemini API into the Node.js backend.
    *   [ ] Modify the backend AI advisor endpoint to construct detailed prompts for the Gemini API, including the current game state (stats, recent decisions) and the upcoming decision.
    *   [ ] Process the Gemini API response to extract the generated advice text. Implement error handling and retry mechanisms for API calls.
10. Dynamic AI Personality Refinement:
    *   [ ] Implement logic in the Node.js backend to give the AI advisor a more dynamic personality (funny, sarcastic, serious) by varying the prompt sent to the Gemini API or by using predefined personality profiles to filter/modify Gemini's output.
11. Multiple Endings Development:
    *   [ ] Develop distinct end-game narratives, visual elements, and potentially short animations or summaries in the backend based on the final game state.
    *   [ ] Create compelling and visually appealing end-game screens in the frontend using React.
12. Unlockables and Titles Implementation:
    *   [ ] Implement backend logic to track player achievements and key decisions throughout the game.
    *   [ ] Define criteria for awarding titles (e.g., "Eco Warrior," "Economic Tycoon").
    *   [ ] Implement frontend components to display awarded titles or unlockable visual elements in the city.

### Phase 5: Tutorial and Onboarding (Week 13)

13. Tutorial Design: Design a guided interactive tutorial that introduces players to the core game mechanics:
    *   [ ] Explaining the three key stats and their importance.
    *   [ ] How to interpret decisions and their potential impacts.
    *   [ ] How to use the AI advisor.
    *   [ ] How to navigate the 3D city view.
    *   [ ] The concept of end states.
14. Tutorial Implementation: Implement the tutorial in the frontend using React components.
    *   [ ] Step-by-step instructions with highlighting of relevant UI elements.
    *   [ ] Forced first decisions that demonstrate core concepts.
    *   [ ] Short explanatory text or pop-ups.
15. Onboarding Flow: Ensure a smooth onboarding process for new players, guiding them from the initial game load into the tutorial and then into the main game loop.

### Phase 6: Sound Design and Music (Week 14)

16. Sound Design Plan: Create a plan for game sound effects, including:
    *   [ ] UI sounds (button clicks, notifications).
    *   [ ] Event sounds (decision made, stat change notification, end-game).
    *   [ ] Environmental sounds (subtle city ambiance, nature sounds if environment is high, industrial sounds if economy is high).
    *   [ ] Advisor voice or sound cues (optional).
17. Music Plan: Plan the game's music, considering:
    *   [ ] Background music that sets the tone.
    *   [ ] Dynamic music that changes based on the city's state or the player's performance (e.g., more upbeat when stats are good, more somber when they are low).
    *   [ ] Music for end screens.
18. Sound and Music Implementation:
    *   [ ] Source or create sound effects and music tracks.
    *   [ ] Implement audio playback in the frontend using the Web Audio API or a library.
    *   [ ] Integrate sounds and music with game events and state changes.

### Deployment with Google Cloud Platform and Firebase Studio

*   [ ] Frontend Deployment: Build the React application using Vite and deploy the static assets to Firebase Hosting for fast and secure content delivery.
*   [ ] Backend Deployment: Deploy the Node.js backend to Cloud Run.
*   [ ] Database: Use Firestore as the database to store game state, decision data, user profiles (if implemented), and potentially advisor message templates.
*   [ ] Gemini API: Access the Gemini API securely from your Cloud Run backend.
*   [ ] Firebase Studio: Utilize Firebase Studio for monitoring, analytics, and potentially authentication/remote config.

### Ongoing

*   [ ] Continuously monitor the deployed application.
*   [ ] Analyze game data in Firebase Analytics.
*   [ ] Gather feedback from the player community.
*   [ ] Explore adding more complex features.
