import React, { useState, useEffect, useCallback } from 'react';
import RewardScratchCard from './RewardScratchCard';
import '../styles/paymentSuccess.css';

// Icons and animation
import { ArrowLeft, ArrowRight } from 'phosphor-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [dir, setDir] = useState(0); // navigation direction for animation

  useEffect(() => {
    // keep index within bounds if rewards change
    if (index > rewards.length - 1) setIndex(Math.max(0, rewards.length - 1));
  }, [rewards.length, index]);

  const goPrev = useCallback(() => {
    setDir(-1);
    setIndex((i) => Math.max(0, i - 1));
  }, []);
  const goNext = useCallback(() => {
    setDir(1);
    setIndex((i) => Math.min(rewards.length - 1, i + 1));
  }, [rewards.length]);

  // Motion variants to make cards appear from the back/front with a subtle rotate/scale
  const cardVariants = {
    enter: (dir) => ({ opacity: 0, scale: 0.92, y: 18, rotateX: 18, transformPerspective: 900 }),
    center: { opacity: 1, scale: 1, y: 0, rotateX: 0, zIndex: 2 },
    exit: (dir) => ({ opacity: 0, scale: 0.96, y: -12, rotateX: -12 })
  };


  // keyboard navigation: left/right when focused inside container
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') goPrev();
    if (e.key === 'ArrowRight') goNext();
  };

  const current = rewards[index];

  // for assistive tech announce current reward when it changes
  const announceText = `Showing reward ${index + 1} of ${rewards.length}: ${current?.title || ''}`;

  return (
    <div className="rewards-container" role="region" aria-label="Rewards scratch cards" tabIndex={0} onKeyDown={handleKeyDown}>
      {guidanceMessage && guidanceMessage.text && (
        <div className="rewards-guidance-message">
          <p>{guidanceMessage.text}</p>
        </div>
      )}

      <div className="reward-carousel">
        {/* stacked previews behind the main card - show only current and the next few */}
        <div className="reward-stack" aria-hidden="true">
          {rewards.map((r, idx) => {
            const offset = idx - index; // 0 = current, 1 = next, etc
            const showInStack = offset >= 0 && offset <= 4; // show current + up to 4 ahead
            if (!showInStack) return null;

            const isActive = offset === 0;
            const z = 1000 - offset; // ensure current is on top
            const scale = isActive ? 1 : 0.96 - Math.min(0.06 * offset, 0.18);
            const translateY = offset * 8;

            return (
              <div
                key={r.id}
                className={`reward-stack-item ${isActive ? 'active' : ''} ${r.isScratched ? 'scratched' : 'unrevealed'}`}
                style={{ transform: `translateY(${translateY}px) scale(${scale})`, zIndex: z }}
                onClick={() => setIndex(idx)}
                aria-hidden={isActive ? 'false' : 'true'}
              >
                <div className="preview-title">{r.title}</div>

                {isActive ? (
                  r.isScratched ? (
                    <div className="preview-value">{r.description}</div>
                  ) : (
                    <div className="preview-overlay">Scratch to reveal</div>
                  )
                ) : (
                  // compact preview for items behind the active card
                  <div className="preview-compact">
                    {r.isScratched ? (
                      <div className="preview-value small">{r.description}</div>
                    ) : (
                      <div className="preview-overlay small">Scratch</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="carousel-main">
          <div className="carousel-controls">
            <button className="nav-arrow nav-prev" onClick={goPrev} aria-label="Previous reward" disabled={index === 0}>
              <ArrowLeft size={20} weight="bold" aria-hidden="true" />
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
                      // set direction for animation based on compare
                      setDir(newIndex > index ? 1 : newIndex < index ? -1 : 0);
                      setIndex(newIndex);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setDir(1);
                      setIndex((i) => Math.min(rewards.length - 1, i + 1));
                    }
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setDir(-1);
                      setIndex((i) => Math.max(0, i - 1));
                    }
                    if (e.key === 'ArrowLeft') {
                      e.preventDefault();
                      setDir(-1);
                      setIndex((i) => Math.max(0, i - 1));
                    }
                    if (e.key === 'ArrowRight') {
                      e.preventDefault();
                      setDir(1);
                      setIndex((i) => Math.min(rewards.length - 1, i + 1));
                    }
                  }}
                  aria-label={`Reward ${index + 1} of ${rewards.length}`}
                />
              </div>
              <div className="carousel-card" aria-live="polite">
                <AnimatePresence initial={false} custom={dir} mode="wait">
                  <motion.div
                    key={index}
                    custom={dir}
                    variants={cardVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.42, ease: [0.2, 0.9, 0.2, 1] }}
                    className="carousel-card-inner"
                  >
                    {current.title && <h3 className="reward-item-title visible-title">{current.title}</h3>}
                    <RewardScratchCard
                      reward={current}
                      isScratched={current.isScratched}
                      onReveal={onReveal}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <button className="nav-arrow nav-next" onClick={goNext} aria-label="Next reward" disabled={index === rewards.length - 1}>
              <ArrowRight size={20} weight="bold" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Aria live announcement for current card */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">{announceText}</div>

      {allRevealed && (
        <div className="rewards-completion-message">
          <p>All rewards revealed! Complete more payments to unlock new rewards.</p>
        </div>
      )}
    </div>
  );
};

export default RewardsContainer;

