/**
 * Dynamic messaging utility for rewards and progress
 * Provides contextual, motivational messages based on user state
 */

/**
 * Get motivational progress message based on milestones
 */
export const getProgressMessage = (completedMilestones, totalMilestones) => {
  const remaining = totalMilestones - completedMilestones;
  const progressPercent = totalMilestones > 0 
    ? Math.round((completedMilestones / totalMilestones) * 100) 
    : 0;

  if (remaining === 0) {
    return {
      text: "Congratulations! You've completed all milestones!",
      highlight: "All milestones",
      tone: "celebration"
    };
  }

  if (progressPercent >= 80) {
    return {
      text: `You're almost there! Just ${remaining} ${remaining === 1 ? 'step' : 'steps'} away from your next reward.`,
      highlight: `${remaining}`,
      tone: "encouraging"
    };
  }

  if (progressPercent >= 50) {
    return {
      text: `Great progress! ${remaining} more ${remaining === 1 ? 'payment unlocks' : 'payments unlock'} your next reward.`,
      highlight: `${remaining}`,
      tone: "motivational"
    };
  }

  if (progressPercent >= 25) {
    return {
      text: `Keep going! ${remaining} more ${remaining === 1 ? 'payment' : 'payments'} to unlock your next reward.`,
      highlight: `${remaining}`,
      tone: "supportive"
    };
  }

  return {
    text: `Start your journey! ${remaining} more ${remaining === 1 ? 'payment' : 'payments'} to unlock your first reward.`,
    highlight: `${remaining}`,
    tone: "welcoming"
  };
};

/**
 * Get contextual reward status message
 */
export const getRewardStatusMessage = (rewards, revealedCount) => {
  const totalRewards = rewards?.length || 0;
  const unlockedCount = rewards?.filter(r => !r.isScratched)?.length || 0;
  const scratchedCount = revealedCount || rewards?.filter(r => r.isScratched)?.length || 0;

  if (totalRewards === 0) {
    return {
      text: "Complete more payments to unlock rewards!",
      type: "info"
    };
  }

  if (scratchedCount === totalRewards) {
    return {
      text: "All rewards revealed! Check back after your next payment for more.",
      type: "success"
    };
  }

  if (scratchedCount > 0 && scratchedCount < totalRewards) {
    return {
      text: `Great! ${totalRewards - scratchedCount} more ${totalRewards - scratchedCount === 1 ? 'reward' : 'rewards'} waiting to be revealed.`,
      type: "progress"
    };
  }

  if (unlockedCount === totalRewards) {
    return {
      text: `You've unlocked ${totalRewards} ${totalRewards === 1 ? 'reward' : 'rewards'}! Scratch to reveal ${totalRewards === 1 ? 'it' : 'them'}.`,
      type: "ready"
    };
  }

  return {
    text: `You have ${unlockedCount} ${unlockedCount === 1 ? 'reward' : 'rewards'} ready to reveal!`,
    type: "ready"
  };
};

/**
 * Get next-step guidance message
 */
export const getNextStepGuidance = (rewards, progress, showRewards) => {
  if (showRewards) {
    const scratchedCount = rewards?.filter(r => r.isScratched)?.length || 0;
    const totalRewards = rewards?.length || 0;
    
    if (scratchedCount === 0) {
      return {
        text: "Start scratching to reveal your rewards!",
        action: "scratch"
      };
    }

    if (scratchedCount < totalRewards) {
      return {
        text: `Continue scratching to reveal your remaining ${totalRewards - scratchedCount} ${totalRewards - scratchedCount === 1 ? 'reward' : 'rewards'}.`,
        action: "continue"
      };
    }

    return {
      text: "All rewards revealed! Complete more payments to unlock new rewards.",
      action: "complete"
    };
  }

  const remainingMilestones = progress?.totalMilestones - progress?.completedMilestones || 0;
  
  if (remainingMilestones === 0) {
    return {
      text: "All milestones complete! Click below to reveal your rewards.",
      action: "reveal"
    };
  }

  if (rewards && rewards.length > 0) {
    return {
      text: "Click below to reveal your unlocked rewards.",
      action: "reveal"
    };
  }

  return {
    text: "Complete more payments to unlock rewards.",
    action: "wait"
  };
};

/**
 * Get celebration message for revealed reward
 */
export const getRevealCelebration = (reward) => {
  if (!reward) {
    return "Reward revealed!";
  }

  const value = reward.rewardValue;
  const type = reward.title?.toLowerCase() || "";

  if (type.includes("cashback")) {
    return `Congratulations! You've won ${value} cashback!`;
  }

  if (type.includes("discount") || type.includes("coupon")) {
    return `Amazing! You've unlocked a ${value}% discount!`;
  }

  return "Congratulations! Your reward has been revealed!";
};

