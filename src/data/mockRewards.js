/**
 * Mock reward data model to simulate backend response for successful payments
 * This file contains sample data structures for rewards and payment progress
 */

// Mock reward data - represents rewards unlocked by a payment
export const mockRewards = [
  {
    id: 'reward-001',
    title: 'Cashback Reward',
    description: 'You won ₹100 Cashback!',
    rewardValue: 100,
    isScratched: false,
  },
  {
    id: 'reward-002',
    title: 'Discount Coupon',
    description: 'Get 15% off on your next purchase',
    rewardValue: 15,
    isScratched: false,
  },
];

// Mock payment progress data - tracks milestone completion
export const mockPaymentProgress = {
  totalMilestones: 5,
  completedMilestones: 3,
  milestoneLabels: [
    'Payment Completed',
    'Reward Unlocked',
    'First Scratch Card Revealed',
    'Second Reward Available',
    'All Rewards Claimed',
  ],
};

// Mock function to simulate fetching rewards from backend
export const fetchMockRewards = (paymentId) => {
  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        paymentId: paymentId || 'TXN1234567890',
        rewards: mockRewards,
        progress: mockPaymentProgress,
        timestamp: new Date().toISOString(),
      });
    }, 500);
  });
};

// Mock function to update reward scratch status
export const updateRewardScratchStatus = (rewardId, isScratched) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const updatedRewards = mockRewards.map((reward) =>
        reward.id === rewardId ? { ...reward, isScratched } : reward
      );
      resolve({
        success: true,
        reward: updatedRewards.find((r) => r.id === rewardId),
        rewards: updatedRewards,
      });
    }, 300);
  });
};

// Default export with all mock data
export default {
  mockRewards,
  mockPaymentProgress,
  fetchMockRewards,
  updateRewardScratchStatus,
};

