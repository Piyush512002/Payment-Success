import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SuccessHeader from './SuccessHeader';
import RewardsContainer from './RewardsContainer';
import RewardProgress from './RewardProgress';
import { fetchMockRewards } from '../data/mockRewards';
import { getRewardStatusMessage, getNextStepGuidance } from '../utils/rewardMessages';
import '../styles/paymentSuccess.css';

const PaymentSuccess = () => {
  // Placeholder props - replace with real data from backend/props
  const amountPaid = '$59.99';
  const transactionId = 'TXN1234567890';
  const dateTime = '2026-01-07 14:42';

  const [showRewards, setShowRewards] = useState(false);
  const [rewardsData, setRewardsData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Derive revealed count from rewards data
  const revealedCount = rewardsData?.rewards?.filter(r => r.isScratched).length || 0;

  // Handle reward reveal - updates reward data state
  const handleRewardReveal = useCallback((rewardId, reward) => {
    setRewardsData(prevData => {
      if (!prevData || !prevData.rewards) return prevData;
      
      return {
        ...prevData,
        rewards: prevData.rewards.map(r => 
          r.id === rewardId ? { ...r, isScratched: true } : r
        )
      };
    });
  }, []);

  // Fetch rewards data on component mount
  useEffect(() => {
    const loadRewards = async () => {
      try {
        const data = await fetchMockRewards(transactionId);
        setRewardsData(data);
      } catch (error) {
        console.error('Failed to load rewards:', error);
      } finally {
        setLoading(false);
      }
    };
    loadRewards();
  }, [transactionId]);

  return (
    <main className="payment-success-main">
      <section 
        key={showRewards ? 'rewards' : 'payment'}
        className={`payment-success-container transition-fade-scale fade-in-down`} 
        aria-label={showRewards ? "Rewards Scratch Card" : "Payment Success Card"}
      >
        {showRewards ? (
          <>
            <div className="rewards-header">
              <button
                type="button"
                className="rewards-back-button"
                onClick={() => setShowRewards(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setShowRewards(false);
                  }
                }}
                aria-label="Back to payment details"
              >
                ← Back
              </button>
              <h2 className="rewards-view-title">Your Rewards</h2>
            </div>

            {rewardsData && rewardsData.rewards && (
              <RewardsContainer 
                rewards={rewardsData.rewards}
                onReveal={handleRewardReveal}
                guidanceMessage={getNextStepGuidance(rewardsData.rewards, rewardsData.progress, true)}
                allRevealed={revealedCount === rewardsData.rewards.length && rewardsData.rewards.length > 0}
              />
            )}
          </>
        ) : (
          <>
            <SuccessHeader />
            <div className="payment-success-body">
              <section className="payment-details" aria-labelledby="payment-title">
                <h1 id="payment-title" className="payment-title">Payment Successful</h1>
                <p className="payment-success-subtitle">Your transaction has been completed</p>
                <dl className="payment-metadata">
                  <div>
                    <dt>Amount paid</dt>
                    <dd>{amountPaid}</dd>
                  </div>
                  <div>
                    <dt>Transaction ID</dt>
                    <dd>{transactionId}</dd>
                  </div>
                  <div>
                    <dt>Date &amp; time</dt>
                    <dd>{dateTime}</dd>
                  </div>
                </dl>
              </section>
              
              {/* Reward Progress Section */}
              {!loading && rewardsData && rewardsData.progress && (
                <RewardProgress
                  totalMilestones={rewardsData.progress.totalMilestones}
                  completedMilestones={rewardsData.progress.completedMilestones}
                  milestoneLabels={rewardsData.progress.milestoneLabels}
                />
              )}
              
              {/* Rewards Earned Section */}
              {!loading && rewardsData && rewardsData.rewards && rewardsData.rewards.length > 0 && (
                <section className="rewards-earned-section" aria-labelledby="rewards-earned-title">
                  <div className="rewards-earned-header">
                    <h2 id="rewards-earned-title" className="rewards-earned-title">Rewards Earned</h2>
                    <div className="rewards-count-badge">
                      <span className="rewards-count-number">{rewardsData.rewards.length}</span>
                      <span className="rewards-count-label">
                        {rewardsData.rewards.length === 1 ? 'Reward' : 'Rewards'}
                      </span>
                    </div>
                  </div>
                  <p className="rewards-earned-description">
                    {getRewardStatusMessage(rewardsData.rewards, revealedCount).text}
                  </p>
                  {getNextStepGuidance(rewardsData.rewards, rewardsData.progress, showRewards).text && (
                    <p className="rewards-next-step">
                      {getNextStepGuidance(rewardsData.rewards, rewardsData.progress, showRewards).text}
                    </p>
                  )}
                </section>
              )}

              <button
                className="payment-success-cta"
                type="button"
                onClick={() => setShowRewards(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setShowRewards(true);
                  }
                }}
                aria-label={loading 
                  ? "Loading rewards, please wait" 
                  : rewardsData?.rewards?.length === 1
                    ? "Reveal your reward scratch card"
                    : `Reveal your ${rewardsData?.rewards?.length || 0} reward scratch cards`}
                aria-disabled={loading || !rewardsData || !rewardsData.rewards || rewardsData.rewards.length === 0}
                disabled={loading || !rewardsData || !rewardsData.rewards || rewardsData.rewards.length === 0}
              >
                {loading ? 'Loading...' : 'Reveal Rewards'}
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
};

export default PaymentSuccess;

