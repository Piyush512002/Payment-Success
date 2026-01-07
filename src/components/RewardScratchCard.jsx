import React, { useRef, useEffect, useState, useCallback } from 'react';
import { getRevealCelebration } from '../utils/rewardMessages';
import '../styles/paymentSuccess.css';

const CARD_WIDTH = 278;
const CARD_HEIGHT = 165;
const BRUSH_SIZE = 24;
const BRUSH_SIZE_MOBILE = 28; // Larger brush for better touch interaction
const REVEAL_THRESHOLD = 60; // 60% scratched area required
const CHECK_INTERVAL = 200; // Debounce check interval in ms

/**
 * RewardScratchCard - Scratch interaction component
 * Manages only scratch canvas interaction, receives state as props
 */
const RewardScratchCard = ({ reward = null, isScratched = false, onReveal = null }) => {
  const canvasRef = useRef(null);
  const checkTimeoutRef = useRef(null);
  const isRevealedRef = useRef(isScratched); // Prevent race conditions
  const [isDrawing, setIsDrawing] = useState(false);
  const [localScratched, setLocalScratched] = useState(isScratched);
  const [announcement, setAnnouncement] = useState('');
  
  // Get reward text from props or use default
  const rewardText = reward?.description || '🎉 You won ₹100 Cashback!';
  
  // Sync local state with prop changes (when parent confirms scratch state)
  useEffect(() => {
    // Ensure the component resets when the reward or its scratch state changes
    setLocalScratched(!!isScratched);
    isRevealedRef.current = !!isScratched;

    // Reset canvas visibility/state when switching between rewards
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.transition = '';
      canvas.style.opacity = isScratched ? '0' : '1';
      canvas.style.pointerEvents = isScratched ? 'none' : 'auto';
      canvas.style.cursor = isScratched ? 'default' : 'crosshair';
    }
  }, [isScratched, reward?.id]);
  
  // Use local scratched for interaction state, prop for disabled state
  const scratched = localScratched;
  const isDisabled = isScratched;

  // Setup the canvas overlay - initialize for each card independently
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Only initialize if not already scratched
    if (scratched || isDisabled) {
      return;
    }
    
    const ctx = canvas.getContext('2d');
    // Fill overlay with gray gradient
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#e0e2e7');
    grad.addColorStop(1, '#d2d3d7');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';
  }, [scratched, isDisabled]);

  // Handle "scratching" logic
  function getPointerPos(e) {
    // Support both mouse and touch
    const rect = canvasRef.current.getBoundingClientRect();
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  }

  function handleStart(e) {
    if (isDisabled || scratched || isRevealedRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    // Prevent text selection
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
    }
    setIsDrawing(true);
    scratchAt(e);
  }
  function handleMove(e) {
    if (isDisabled || !isDrawing || scratched || isRevealedRef.current) return;
    e.preventDefault();
    scratchAt(e);
    // Debounced check during movement
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }
    checkTimeoutRef.current = setTimeout(checkScratchPercent, CHECK_INTERVAL);
  }
  function handleEnd() {
    if (isDisabled) return;
    setIsDrawing(false);
    // Final check after interaction ends
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }
    checkTimeoutRef.current = setTimeout(checkScratchPercent, 100);
  }
  function scratchAt(e) {
    if (isDisabled || scratched) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Use larger brush size on mobile for better touch experience
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 480;
    const brushSize = isMobile ? BRUSH_SIZE_MOBILE : BRUSH_SIZE;
    
    ctx.globalCompositeOperation = 'destination-out';
    const { x, y } = getPointerPos(e);
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
    ctx.globalCompositeOperation = 'source-over';
  }

  const checkScratchPercent = useCallback(() => {
    // Early exit if already revealed or disabled
    if (isDisabled || scratched || isRevealedRef.current) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Optimized: Use smaller sample area for performance
    // Sample every 8th pixel (4x4 grid) for faster processing
    const sampleRate = 8;
    const width = CARD_WIDTH;
    const height = CARD_HEIGHT;
    const image = ctx.getImageData(0, 0, width, height);
    const data = image.data;
    
    let transparent = 0;
    let total = 0;
    
    // Optimized sampling: check alpha channel only
    for (let y = 0; y < height; y += sampleRate) {
      for (let x = 0; x < width; x += sampleRate) {
        const index = (y * width + x) * 4;
        const alpha = data[index + 3]; // Alpha channel
        if (alpha === 0) transparent++;
        total++;
      }
    }
    
    const percent = total > 0 ? (transparent / total) * 100 : 0;
    
    // Mark as revealed if threshold reached
    if (percent >= REVEAL_THRESHOLD && !isRevealedRef.current) {
      isRevealedRef.current = true;
      setLocalScratched(true);
      const celebrationMessage = getRevealCelebration(reward);
      setAnnouncement(celebrationMessage);
      
      // Lock canvas immediately
      if (canvas) {
        canvas.style.pointerEvents = 'none';
        canvas.style.cursor = 'default';
      }
      
      // Notify parent component of reveal
      if (onReveal && typeof onReveal === 'function') {
        onReveal(reward?.id || null, reward);
      }
    }
  }, [isDisabled, scratched, rewardText, reward, onReveal]);

  // Keyboard alternative: reveal reward with Enter or Space
  function handleKeyDown(e) {
    if (isDisabled || scratched) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      isRevealedRef.current = true;
      setLocalScratched(true);
      const celebrationMessage = getRevealCelebration(reward);
      setAnnouncement(celebrationMessage);
      // Clear the canvas for keyboard users
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
      }
      
      // Notify parent component of reveal
      if (onReveal && typeof onReveal === 'function') {
        onReveal(reward?.id || null, reward);
      }
    }
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, []);

  // Smoothly fade out scratch layer when revealed
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    if (scratched) {
      // Lock canvas completely
      canvas.style.pointerEvents = 'none';
      canvas.style.cursor = 'default';
      canvas.style.transition = 'opacity 0.8s cubic-bezier(.61,1.38,.79,.85)';
      canvas.style.opacity = '0';
      
      // Remove all event listeners by setting pointer-events
      canvas.onmousedown = null;
      canvas.onmousemove = null;
      canvas.onmouseup = null;
      canvas.onmouseleave = null;
      canvas.ontouchstart = null;
      canvas.ontouchmove = null;
      canvas.ontouchend = null;
    } else {
      canvas.style.transition = '';
      canvas.style.opacity = '1';
    }
  }, [scratched]);

  return (
    <>
      <div 
        className={`reward-scratch-card scratch-card-visual${isDisabled ? ' disabled' : ''}`}
        role="article"
        aria-label={isDisabled 
          ? `${reward?.title || 'Reward'} has already been revealed` 
          : `Scratch card to reveal ${reward?.title || 'your reward'}`}
        tabIndex={isDisabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        onSelectStart={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', borderRadius: 14 }}
      >
        <div 
          className="reward-content"
          onSelectStart={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
          style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}
        >
          <div
            className={`reward-text${scratched ? ' reveal-fade-in' : ' hidden-unrevealed'}`}
            aria-live="polite"
            aria-atomic="true"
            style={{ 
              opacity: scratched ? 1 : 0,
              transform: scratched ? 'translateY(0)' : 'translateY(4px)',
              zIndex: 2,
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
              pointerEvents: 'none'
            }}
            onSelectStart={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
          >
            {rewardText}
          </div>
          {/* Canvas overlay for scratching */}
          <canvas
            ref={canvasRef}
            width={CARD_WIDTH}
            height={CARD_HEIGHT}
            className="scratch-canvas user-select-none"
            aria-label={scratched 
              ? `${reward?.title || 'Reward'} has been revealed` 
              : `Scratch card for ${reward?.title || 'reward'}. Use your finger or mouse to scratch the surface, or press Enter to reveal`}
            aria-hidden={scratched}
            role={scratched ? "img" : "button"}
            tabIndex={scratched || isDisabled ? -1 : 0}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              borderRadius: 16,
              zIndex: 4,
              touchAction: (scratched || isDisabled) ? 'auto' : 'none',
              pointerEvents: (scratched || isDisabled) ? 'none' : 'auto',
              cursor: (scratched || isDisabled) ? 'default' : 'crosshair',
              minHeight: '44px',
              minWidth: '44px',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
              WebkitTapHighlightColor: 'transparent',
            }}
            onSelectStart={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
            onMouseDown={(scratched || isDisabled) ? undefined : handleStart}
            onMouseMove={(scratched || isDisabled) ? undefined : handleMove}
            onMouseUp={(scratched || isDisabled) ? undefined : handleEnd}
            onMouseLeave={(scratched || isDisabled) ? undefined : handleEnd}
            onTouchStart={(scratched || isDisabled) ? undefined : (e) => {
              e.preventDefault();
              handleStart(e);
            }}
            onTouchMove={(scratched || isDisabled) ? undefined : (e) => {
              e.preventDefault();
              handleMove(e);
            }}
            onTouchEnd={(scratched || isDisabled) ? undefined : (e) => {
              e.preventDefault();
              handleEnd();
            }}
          ></canvas>
          {!scratched && !isDisabled && (
            <span 
              className="scratch-instructions scratch-canvas-instructions user-select-none"
              role="status"
              aria-live="polite"
            >
              Scratch to reveal your reward. Press Enter for keyboard access.
            </span>
          )}
        </div>
      </div>
      {scratched && (
        <div 
          className="scratch-success-message scale-reveal"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          Reward Unlocked! 🎊
        </div>
      )}
      {/* ARIA live region for screen reader announcements */}
      <div 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
        role="status"
      >
        {announcement}
      </div>
    </>
  );
};

export default RewardScratchCard;

