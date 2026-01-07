import React from 'react';
import { getProgressMessage } from '../utils/rewardMessages';
import '../styles/paymentSuccess.css';

const RewardProgress = ({ 
  totalMilestones = 5, 
  completedMilestones = 0, 
  milestoneLabels = [] 
}) => {
  // Calculate progress percentage
  const progressPercentage = totalMilestones > 0 
    ? (completedMilestones / totalMilestones) * 100 
    : 0;

  // Calculate remaining milestones
  const remainingMilestones = totalMilestones - completedMilestones;
  
  // Get dynamic progress message
  const progressMessage = getProgressMessage(completedMilestones, totalMilestones);

  // Generate milestone checkpoints
  const milestones = Array.from({ length: totalMilestones }, (_, index) => {
    const milestoneNumber = index + 1;
    const isCompleted = milestoneNumber <= completedMilestones;
    const isNext = milestoneNumber === completedMilestones + 1;
    const label = milestoneLabels[index] || `Milestone ${milestoneNumber}`;

    return {
      number: milestoneNumber,
      isCompleted,
      isNext,
      label,
    };
  });

  return (
    <div className="reward-progress-container" role="progressbar" aria-valuenow={completedMilestones} aria-valuemin={0} aria-valuemax={totalMilestones} aria-label="Payment milestone progress">
      {/* Progress Bar */}
      <div className="reward-progress-bar-wrapper">
        <div className="reward-progress-bar-track">
          <div 
            className="reward-progress-bar-fill"
            style={{ width: `${progressPercentage}%` }}
            aria-hidden="true"
          />
        </div>

        {/* Milestone Checkpoints */}
        <div className="reward-progress-milestones">
          {milestones.map((milestone, index) => (
            <div
              key={milestone.number}
              className={`reward-milestone-checkpoint ${milestone.isCompleted ? 'completed' : ''} ${milestone.isNext ? 'next' : ''}`}
              style={{ left: `${(index / (totalMilestones - 1)) * 100}%` }}
            >
              <div className="milestone-dot">
                {milestone.isCompleted && (
                  <svg 
                    className="milestone-check-icon" 
                    viewBox="0 0 16 16" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M13.5 4L6 11.5L2.5 8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              {milestone.label && (
                <span className="milestone-label" aria-label={milestone.label}>
                  {milestone.label}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Progress Text */}
      <div className="reward-progress-text">
        <p className={`progress-message ${progressMessage.tone === 'celebration' ? 'progress-complete' : ''}`}>
          {progressMessage.text.includes(progressMessage.highlight) ? (
            <>
              {progressMessage.text.split(progressMessage.highlight)[0]}
              <span className="progress-message-highlight">
                {progressMessage.highlight}
              </span>
              {progressMessage.text.split(progressMessage.highlight)[1]}
            </>
          ) : (
            progressMessage.text
          )}
        </p>
      </div>
    </div>
  );
};

export default RewardProgress;

