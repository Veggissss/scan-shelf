import React from 'react';

interface ScanOutputProps {
  text: string;
  dictionaryLookup: string;
}

const ScanOutput: React.FC<ScanOutputProps> = ({ text, dictionaryLookup }) => (
  <div className="scan-output">
    {text.split('\n').map((word, index) => (
      <h1 key={index}>
        <a href={`${dictionaryLookup}${word}`} target="_blank" rel="noopener noreferrer">
          {word}
        </a>
      </h1>
    ))}
  </div>
);

export default ScanOutput;
