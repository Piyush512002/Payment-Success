import React from 'react';
import RewardScratchCard from './RewardScratchCard';
import '../styles/paymentSuccess.css';

/**
 * RewardsContainer - Presentational component
 * Handles UI rendering only, receives all data and callbacks as props
 */
const RewardsContainer = ({ 
  rewards = [], 
  onReveal = null,
  guidanceMessage = null,
  allRevealed = false
}) => {
  // Limit to max 2 rewards for display
  const displayRewards = rewards.slice(0, 2);

  if (displayRewards.length === 0) {
    return null;
  }

  return (
    <div className="rewards-container" role="region" aria-label="Rewards scratch cards">
      {guidanceMessage && guidanceMessage.text && (
        <div className="rewards-guidance-message">
          <p>{guidanceMessage.text}</p>
        </div>
      )}
      <div className="rewards-grid">
        {displayRewards.map((reward) => (
          <div key={reward.id} className="reward-item">
            {reward.title && (
              <h3 className="reward-item-title">{reward.title}</h3>
            )}
            <RewardScratchCard
              reward={reward}
              isScratched={reward.isScratched}
              onReveal={onReveal}
            />
          </div>
        ))}
      </div>
      {allRevealed && (
        <div className="rewards-completion-message">
          <p>All rewards revealed! Complete more payments to unlock new rewards.</p>
        </div>
      )}
    </div>
  );
};

export default RewardsContainer;

