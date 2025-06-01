# Sustainable City Advisor - Game Design Document

## Core Game Loop

### Turn Structure
- Each turn represents 1 week in city time
- Player faces 1 decision per turn
- Decisions have immediate and long-term consequences
- Game progresses for 52 turns (1 year) or until failure state

### Stats System
All stats range from 0-100:

#### Environment 🌱 (0-100)
- **80-100**: Pristine (Green parks, clean air, renewable energy dominance)
- **60-79**: Healthy (Good air quality, mixed energy sources)
- **40-59**: Moderate (Some pollution, fossil fuel dependency)
- **20-39**: Poor (Visible pollution, environmental degradation)
- **0-19**: Critical (Severe pollution, ecosystem collapse)

#### Economy 💰 (0-100)
- **80-100**: Booming (High employment, tech innovation, sustainable industries)
- **60-79**: Strong (Stable growth, good employment)
- **40-59**: Stable (Moderate growth, some unemployment)
- **20-39**: Struggling (High unemployment, business closures)
- **0-19**: Collapse (Mass unemployment, economic crisis)

#### Happiness 😊 (0-100)
- **80-100**: Thriving (High quality of life, community engagement)
- **60-79**: Content (Good public services, low crime)
- **40-59**: Neutral (Basic needs met, some issues)
- **20-39**: Dissatisfied (Poor services, rising crime)
- **0-19**: Unrest (Protests, social breakdown)

### Starting Values
- Environment: 60 (Moderate baseline)
- Economy: 55 (Slightly below average)
- Happiness: 65 (Citizens optimistic about new mayor)

## Decision Categories

### Infrastructure Decisions
- **Transportation**: Public transit vs. highways vs. bike lanes
- **Energy**: Coal plants vs. solar farms vs. nuclear
- **Housing**: Affordable housing vs. luxury developments
- **Waste**: Landfills vs. recycling centers vs. waste-to-energy

### Economic Decisions
- **Industry**: Manufacturing vs. tech sector vs. green industries
- **Tourism**: Development vs. conservation
- **Taxation**: Corporate tax rates, environmental taxes
- **Employment**: Job creation programs vs. private sector incentives

### Environmental Decisions
- **Conservation**: Protect forests vs. allow development
- **Pollution**: Strict regulations vs. business-friendly policies
- **Climate**: Mitigation strategies vs. economic priorities
- **Biodiversity**: Wildlife corridors vs. urban expansion

### Social Decisions
- **Healthcare**: Public vs. private healthcare expansion
- **Education**: School funding priorities
- **Recreation**: Parks vs. commercial entertainment
- **Safety**: Police funding vs. community programs

## End States

### Victory Conditions (Turn 52 reached)
1. **Green Utopia**: Environment 80+, Economy 70+, Happiness 80+
2. **Economic Powerhouse**: Economy 85+, Environment 50+, Happiness 70+
3. **Happy Community**: Happiness 85+, Environment 60+, Economy 60+
4. **Balanced City**: All stats 65-79

### Failure Conditions (Game ends early)
1. **Environmental Collapse**: Environment reaches 0
2. **Economic Disaster**: Economy reaches 0
3. **Social Unrest**: Happiness reaches 0
4. **Critical Triple Failure**: Any two stats below 20

### Neutral Endings
1. **Corporate Dystopia**: Economy 60+, Environment <40, Happiness <50
2. **Stagnant City**: All stats 40-59 at turn 52
3. **One-Dimensional Success**: One stat 80+, others below 50

## Sample Decisions

### Early Game Example
**Decision**: "A tech company wants to build a data center in your city."

**Choices**:
1. **"Welcome them with tax breaks"**
   - Economy: +15, Environment: -5, Happiness: +5
   - Adds: Modern office building to city view

2. **"Accept but require green energy use"**
   - Economy: +8, Environment: +3, Happiness: +8
   - Adds: Eco-friendly tech building with solar panels

3. **"Reject to preserve the natural area"**
   - Economy: -3, Environment: +10, Happiness: +2
   - Preserves green space in city view

### Mid Game Example
**Decision**: "Citizens are protesting air pollution from the industrial district."

**Choices**:
1. **"Implement strict emission controls"**
   - Environment: +20, Economy: -10, Happiness: +15
   - Reduces smoke effects in 3D view

2. **"Offer relocation assistance to residents"**
   - Environment: -2, Economy: -8, Happiness: -5
   - No visual change

3. **"Ignore the protests"**
   - Environment: -5, Economy: +5, Happiness: -20
   - Increases pollution effects

## AI Advisor Personality

### Rule-Based Responses
- **Optimistic**: When all stats above 60
- **Concerned**: When any stat below 40
- **Sarcastic**: When player makes obviously poor choices
- **Encouraging**: When stats are improving

### Advice Categories
- **Stat Balance**: Warns when one stat is too low
- **Long-term Consequences**: Predicts future impacts
- **Sustainability Focus**: Emphasizes environmental trade-offs
- **Humor**: Light commentary to keep engagement

## Visual Design Elements

### 3D City Components
- **Base Terrain**: Changes color based on environment
- **Buildings**: Appear based on economic decisions
- **Vegetation**: Trees and parks reflect environmental health
- **Infrastructure**: Roads, power lines, transportation
- **Effects**: Smoke, light pollution, particle systems

### UI Layout
- **Stats Display**: Top bar with progress bars
- **3D City View**: Central focus, 60% of screen
- **Decision Area**: Bottom panel with choices
- **Advisor Area**: Side panel with AI messages

## Progression Mechanics

### Difficulty Scaling
- Early decisions have smaller impacts (±5-10)
- Mid-game decisions have moderate impacts (±10-15)
- Late-game decisions have major impacts (±15-25)

### Consequence Chains
- Some decisions unlock future scenarios
- Environmental damage compounds over time
- Economic growth enables more expensive options

- **Economy:** 
  - High: 70-100 (Economic Boom)
  - Medium: 40-69 (Stable Economy)
  - Low: 0-39 (Economic Collapse)

- **Happiness:** 
  - High: 70-100 (Happy Citizens)
  - Medium: 40-69 (Content Citizens)
  - Low: 0-39 (Dissatisfied Citizens)

### Game Endings
- **Green Utopia:** Achieved by maintaining high Environment and Happiness while keeping Economy stable.
- **Balanced City:** A middle-ground ending where all stats are balanced.
- **Corporate Dystopia:** Resulting from prioritizing Economy at the expense of Environment and Happiness.

## Conclusion

The "Sustainability City Advisor" aims to provide an engaging and educational experience, encouraging players to think critically about sustainability and the impacts of their decisions on a city's future. The game will blend fun gameplay mechanics with meaningful messages about environmental stewardship and community well-being.