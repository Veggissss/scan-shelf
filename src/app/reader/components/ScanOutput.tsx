import React from 'react';

interface ScanOutputProps {
  text: string;
  dictionaryLookup: string;
}

const ScanOutput: React.FC<ScanOutputProps> = ({ text, dictionaryLookup }) => (
  <div className="scan-output">
    {text && text.split('\n').map((word, index) => (
      <p key={index}>
        <a href={`${dictionaryLookup}${word}`} target="_blank" rel="noopener noreferrer">
          {word}
        </a>
      </p>
    ))}
  </div>
);

export default ScanOutput;
