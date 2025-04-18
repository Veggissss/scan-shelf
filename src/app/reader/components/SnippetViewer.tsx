import React from 'react';
import SnippetViewerProps from '../types/SnippetViewerProps';

const SnippetViewer: React.FC<SnippetViewerProps> = ({ snippet, snippetWidth, snippetHeight, onScan, onClearSnippet }) => {
    if (!snippet) return null;

    return (
        <div
            style={{
                position: 'absolute',
                top: `${snippet.top}px`,
                left: `${snippet.left}px`,
                zIndex: 10,
                border: '5px solid grey',
                boxSizing: 'border-box',
                cursor: 'crosshair',
            }}
        >
            <button
                style={{ position: 'relative', backgroundColor: 'black', width: `${snippetWidth}px` }}
                onClick={() => onScan(snippet.dataUrl.split(',')[1])}
            >
                Scan
            </button>
            <img
                src={snippet.dataUrl}
                alt="Snippet"
                onClick={onClearSnippet}
                style={{ width: `${snippetWidth}px`, height: `${snippetHeight}px` }}
                className="snippet-image"
            />
        </div>
    );
};

export default SnippetViewer;
