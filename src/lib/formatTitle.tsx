import React from 'react';

/**
 * Formats a section title with the brand accent color:
 * - If the title contains '&' or 'AND', highlights that connector with `text-accent`.
 * - If no connector exists, highlights the final focal word with `text-accent`.
 */
export function formatSectionTitle(title: string | React.ReactNode): React.ReactNode {
  if (typeof title !== 'string') return title;
  const trimmed = title.trim();
  if (!trimmed) return title;

  const words = trimmed.split(/\s+/);

  // Check for ampersand or standalone "AND" / "and"
  const hasConnector = words.some((w) => w === '&' || w.toUpperCase() === 'AND');

  if (hasConnector) {
    return (
      <>
        {words.map((word, i, arr) => {
          const isConnector = word === '&' || word.toUpperCase() === 'AND';
          return (
            <React.Fragment key={i}>
              {isConnector ? <span className="text-accent">{word}</span> : word}
              {i < arr.length - 1 ? ' ' : ''}
            </React.Fragment>
          );
        })}
      </>
    );
  }

  // If no connector and multiple words, highlight the last word
  if (words.length > 1) {
    const mainPart = words.slice(0, -1).join(' ');
    const lastWord = words[words.length - 1];
    return (
      <>
        {mainPart}{' '}
        <span className="text-accent">{lastWord}</span>
      </>
    );
  }

  return title;
}
