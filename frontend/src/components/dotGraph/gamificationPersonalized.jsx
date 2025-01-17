import React from 'react';
import '../../styles/gamification.css';

const GamificationPersonalized = ({ userData, percentage }) => {
  if (!userData) {
    console.log('No user data available');
    return null;
  }

  const { weights } = userData;

  const averageWeight =
    Object.values(weights).reduce((sum, w) => sum + w, 0) /
    Object.keys(weights).length;

  const message =
    averageWeight < 0.3
      ? 'You’ve provided very positive feedback!'
      : averageWeight < 0.7
      ? 'Your feedback is balanced and neutral.'
      : 'Your feedback indicates some concerns. Thank you for sharing!';

  return (
    <div className = 'personalized-result'
      style={{
      }}
    >
      <h3>Personalized Feedback</h3>
      <p>{message}</p>
      <p>
        You did better than <strong>{percentage}%</strong> of users!
      </p>
    </div>
  );
};

export default GamificationPersonalized;
