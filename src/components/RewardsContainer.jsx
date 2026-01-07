import React, { useState, useEffect, useCallback } from 'react';
import RewardScratchCard from './RewardScratchCard';
import '../styles/paymentSuccess.css';

/**
 * RewardsContainer - shows one reward at a time with arrow navigation
 * and stacked previews behind to mimic coupon stacks in payment apps.
 */
const RewardsContainer = ({ 
  rewards = [], 
  onReveal = null,
  guidanceMessage = null,
  allRevealed = false
}) => {
  if (!rewards || rewards.length === 0) return null;

  const [index, setIndex] = useState(0);

  useEffect(() => {
    // keep index within bounds if rewards change
    if (index > rewards.length - 1) setIndex(Math.max(0, rewards.length - 1));
  }, [rewards.length, index]);

  const goPrev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const goNext = useCallback(() => setIndex((i) => Math.min(rewards.length - 1, i + 1)), [rewards.length]);

  // keyboard navigation: left/right when focused inside container
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') goPrev();
    if (e.key === 'ArrowRight') goNext();
  };

  const current = rewards[index];

  return (
    <div className="rewards-container" role="region" aria-label="Rewards scratch cards" tabIndex={0} onKeyDown={handleKeyDown}>
      {guidanceMessage && guidanceMessage.text && (
        <div className="rewards-guidance-message">
          <p>{guidanceMessage.text}</p>
        </div>
      )}

      <div className="reward-carousel">
        {/* stacked previews behind the main card */}
        <div className="reward-stack" aria-hidden="true">
          {rewards.map((r, idx) => {
            // only show a few behind for performance
            const offset = idx - index;
            const behind = offset > 0 && offset <= 4; // up to 4 behind
            const z = 100 - idx;
            return (
              <div
                key={r.id}
                className={`reward-stack-item ${idx === index ? 'active' : ''} ${r.isScratched ? 'scratched' : 'unrevealed'}`}
                style={{ transform: `translateY(${(idx - index) * 8}px) scale(${idx === index ? 1 : 0.96 - Math.min(0.06 * Math.abs(idx - index), 0.18)})`, zIndex: z }}
                onClick={() => setIndex(idx)}
              >
                <div className="preview-title">{r.title}</div>
                {r.isScratched ? (
                  <div className="preview-value">{r.description}</div>
                ) : (
                  <div className="preview-overlay">Scratch to reveal</div>
                )}
              </div>
            );
          })}
        </div>

        <div className="carousel-main">
          <div className="carousel-controls">
            <button className="nav-arrow nav-prev" onClick={goPrev} aria-label="Previous reward" disabled={index === 0}>
              ←
            </button>

            <div className="carousel-card-wrapper">
              <div className="reward-count">
                <label htmlFor="reward-index-input" className="sr-only">Select reward by number</label>
                <input
                  id="reward-index-input"
                  className="reward-count-input"
                  type="number"
                  min={1}
                  max={rewards.length}
                  value={index + 1}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (!Number.isNaN(val)) {
                      const newIndex = Math.min(Math.max(1, Math.floor(val)), rewards.length) - 1;
                      setIndex(newIndex);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setIndex((i) => Math.min(rewards.length - 1, i + 1));
                    }
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setIndex((i) => Math.max(0, i - 1));
                    }
                    if (e.key === 'ArrowLeft') {
                      e.preventDefault();
                      setIndex((i) => Math.max(0, i - 1));
                    }
                    if (e.key === 'ArrowRight') {
                      e.preventDefault();
                      setIndex((i) => Math.min(rewards.length - 1, i + 1));
                    }
                  }}
                  aria-label={`Reward ${index + 1} of ${rewards.length}`}
                />
              </div>
              <div className="carousel-card">
                {current.title && <h3 className="reward-item-title visible-title">{current.title}</h3>}
                <RewardScratchCard
                  reward={current}
                  isScratched={current.isScratched}
                  onReveal={onReveal}
                />
              </div>
            </div>

            <button className="nav-arrow nav-next" onClick={goNext} aria-label="Next reward" disabled={index === rewards.length - 1}>
              →
            </button>
          </div>
        </div>
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

