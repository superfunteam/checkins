import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { slideUp, springs } from '../utils/animations';

const MAX_NAME_LENGTH = 30;
const DEFAULT_NAME = 'A Humble Hobbit';

// Messages to cycle through
const AUDIO_MESSAGES = ['Better with Audio', 'Volume Up', 'If you want'];

export default function NameModal() {
  const { setName, goToScreen, SCREENS, play } = useApp();
  const [inputValue, setInputValue] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [messageIndex, setMessageIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  // Typing animation effect
  useEffect(() => {
    const currentMessage = AUDIO_MESSAGES[messageIndex];
    let timeout;

    if (isTyping) {
      // Typing forward
      if (displayText.length < currentMessage.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentMessage.slice(0, displayText.length + 1));
        }, 50); // Fast typing speed
      } else {
        // Pause at full message, then start erasing
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, 1500); // Pause before erasing
      }
    } else {
      // Erasing backward
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 30); // Faster erase speed
      } else {
        // Move to next message and start typing
        setMessageIndex((prev) => (prev + 1) % AUDIO_MESSAGES.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isTyping, messageIndex]);

  const handleContinue = () => {
    const finalName = inputValue.trim() || DEFAULT_NAME;
    setName(finalName);
    goToScreen(SCREENS.EXPLAINER);
  };

  const handleSkip = () => {
    play('snap');
    setName(DEFAULT_NAME);
    goToScreen(SCREENS.EXPLAINER);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleContinue();
    }
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center p-8"
      variants={slideUp}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={springs.smooth}
    >
      <motion.div
        className="w-full max-w-sm"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {/* Prompt */}
        <h2 className="font-display text-2xl font-semibold text-earth-800 text-center mb-8">
          What name shall be recorded in the official registry of travelers?
        </h2>

        {/* Input */}
        <div className="mb-6">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.slice(0, MAX_NAME_LENGTH))}
            onKeyDown={handleKeyDown}
            placeholder="Enter your name..."
            className="w-full px-5 py-4 text-xl font-body text-earth-800 bg-parchment-50 border-2 border-parchment-400 rounded-button focus:border-shire-500 focus:outline-none transition-colors"
            autoFocus
            autoCapitalize="words"
            autoComplete="off"
          />
        </div>

        {/* Continue button */}
        <motion.button
          className="btn-primary w-full mb-4"
          onClick={handleContinue}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Continue
        </motion.button>

        {/* Skip option */}
        <button
          className="w-full text-center text-earth-500 text-sm py-2 hover:text-earth-700 transition-colors"
          style={{ fontFamily: "'Google Sans Flex', sans-serif" }}
          onClick={handleSkip}
        >
          or Remain Anonymous
        </button>
        <p
          className="text-center text-earth-400 text-xs mt-1 mb-6"
          style={{ fontFamily: "'Google Sans Flex', sans-serif" }}
        >
          (defaults to "{DEFAULT_NAME}")
        </p>

        {/* Better with Audio pill - typing animation */}
        <div className="flex justify-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 bg-shire-100 text-shire-700 rounded-full"
            style={{ fontFamily: "'Google Sans Flex', sans-serif" }}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            <span className="text-sm font-medium">
              {displayText}
              <span className="animate-pulse">|</span>
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
