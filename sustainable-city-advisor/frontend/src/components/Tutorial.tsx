import React, { useState } from 'react';

interface TutorialProps {
  onComplete: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to Sustainable City Advisor!',
      content: 'In this game, you are the mayor of a city. Your goal is to balance Environment, Economy, and Happiness stats while making decisions.'
    },
    {
      title: 'Three Key Stats',
      content: 'Environment 🌱, Economy 💰, and Happiness 😊 are the three key stats. Each decision you make will impact these stats.'
    },
    {
      title: 'Making Decisions',
      content: 'Each turn, you will be presented with a decision. Read the options carefully and choose the one that aligns with your goals.'
    },
    {
      title: 'AI Advisor',
      content: 'The AI Advisor will provide insights and advice to help you make informed decisions. Pay attention to its suggestions!'
    },
    {
      title: '3D City View',
      content: 'The 3D city view dynamically updates based on your decisions. Watch your city grow and change!'
    },
    {
      title: 'End States',
      content: 'The game ends when you reach the final turn or if one of your stats drops to zero. Aim for a balanced and sustainable city!'
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-content">
        <h2>{steps[step].title}</h2>
        <p>{steps[step].content}</p>
        <button onClick={handleNext}>{step < steps.length - 1 ? 'Next' : 'Finish'}</button>
      </div>
    </div>
  );
};

export default Tutorial;
