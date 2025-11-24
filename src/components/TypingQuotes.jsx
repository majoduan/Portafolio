import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Code2 } from 'lucide-react';

/**
 * TypingQuotes Component
 * Displays inspirational programming quotes with typewriter effect
 * Only visible on desktop (lg breakpoint and above)
 * Optimized following PERFORMANCE.md best practices
 */
const TypingQuotes = memo(() => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(80);

  // Inspirational programming quotes - memoized to prevent recreation
  const quotes = useMemo(() => [
    "Code is like humor. When you have to explain it, it's bad.",
    "First, solve the problem. Then, write the code.",
    "Clean code always looks like it was written by someone who cares.",
    "Make it work, make it right, make it fast.",
    "Simplicity is the soul of efficiency.",
    "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    "The best error message is the one that never shows up.",
    "Testing leads to failure, and failure leads to understanding.",
    "Programs must be written for people to read, and only incidentally for machines to execute.",
    "Code never lies, comments sometimes do."
  ], []);

  useEffect(() => {
    const currentQuote = quotes[currentQuoteIndex];
    let timer;

    const handleTyping = () => {
      if (!isDeleting) {
        // Typing
        if (displayedText.length < currentQuote.length) {
          setDisplayedText(currentQuote.substring(0, displayedText.length + 1));
          setTypingSpeed(80);
        } else {
          // Finished typing, wait before deleting
          timer = setTimeout(() => setIsDeleting(true), 3000);
          return;
        }
      } else {
        // Deleting
        if (displayedText.length > 0) {
          setDisplayedText(currentQuote.substring(0, displayedText.length - 1));
          setTypingSpeed(40);
        } else {
          // Finished deleting, move to next quote
          setIsDeleting(false);
          setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
        }
      }
    };

    timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, currentQuoteIndex, typingSpeed, quotes]);

  return (
    <div className="hidden lg:block mt-6" style={{ contentVisibility: 'auto' }}>
      <div className="relative bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 min-h-[80px] flex items-center transition-all duration-300">
        {/* Code icon */}
        <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
          <Code2 className="w-4 h-4 text-white" />
        </div>
        
        {/* Quote text with typewriter effect */}
        <div className="w-full pl-4">
          <p className="text-slate-300 text-sm italic leading-relaxed" style={{ willChange: 'contents' }}>
            "{displayedText}"
            <span className="inline-block w-0.5 h-4 bg-blue-400 ml-1 animate-pulse"></span>
          </p>
        </div>
      </div>
    </div>
  );
});

TypingQuotes.displayName = 'TypingQuotes';

export default TypingQuotes;
