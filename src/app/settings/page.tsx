"use client";

import Slider from '@mui/material/Slider';
import useLocalStorageState from 'use-local-storage-state';
import { defaultSettings } from '../default.config';
import SnippetViewer from '../reader/components/SnippetViewer';
import Snippet from '../reader/components/Snippet';
import './settings.css';

const Settings = () => {
    const exampleSnippet: Snippet = {
        // example grey-black gradient image
        dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAGElEQVQImQXBAQEAAAABoDzy/xyVtoNgcBwaApF5Ib6dAAAAAElFTkSuQmCC',
        left: 0,
        top: 20,
    };

    const [apiHost, setApiHost] = useLocalStorageState<string>('apiHost', {
        defaultValue: defaultSettings.API_HOST,
    });

    const [dictionaryLookup, setDictionaryLookup] = useLocalStorageState<string>('dictionaryLookup', {
        defaultValue: defaultSettings.DICTIONARY_LOOKUP,
    });

    const [snippetWidth, setSnippetWidth] = useLocalStorageState<number>('snippetWidth', {
        defaultValue: defaultSettings.SNIPPET_WIDTH,
    });

    const [snippetHeight, setSnippetHeight] = useLocalStorageState<number>('snippetHeight', {
        defaultValue: defaultSettings.SNIPPET_HEIGHT,
    });

    const [isLTR, setIsLTR] = useLocalStorageState<boolean>('isLTR', {
        defaultValue: defaultSettings.IS_LTR,
    });

    const [backgroundColor, setBackgroundColor] = useLocalStorageState<string>('backgroundColor', {
        defaultValue: defaultSettings.BACKGROUND_COLOR,
    });

    function resetSettings() {
        setApiHost(defaultSettings.API_HOST);
        setDictionaryLookup(defaultSettings.DICTIONARY_LOOKUP);
        setSnippetWidth(defaultSettings.SNIPPET_WIDTH);
        setSnippetHeight(defaultSettings.SNIPPET_HEIGHT);
        setIsLTR(defaultSettings.IS_LTR);
        setBackgroundColor(defaultSettings.BACKGROUND_COLOR);
    }

    return (
        <div className="info-container">
            <h1>Settings</h1>

            <div className="settings-group">
                <label htmlFor="apiHost">API Host</label>
                <input
                    id="apiHost"
                    type="text"
                    value={apiHost}
                    onChange={(e) => setApiHost(e.target.value)}
                    placeholder="Enter API host"
                />

                <label htmlFor="dictionaryLookup">Dictionary Lookup URL</label>
                <input
                    id="dictionaryLookup"
                    type="text"
                    value={dictionaryLookup}
                    onChange={(e) => setDictionaryLookup(e.target.value)}
                    placeholder="Enter dictionary lookup URL"
                />

                <br />
                <br />

                <label htmlFor="isRTL">Left-to-Right Text</label>
                <input
                    id="isRTL"
                    type="checkbox"
                    checked={isLTR}
                    onChange={(e) => setIsLTR(e.target.checked)}
                />

                <label htmlFor="backgroundColor">Background Color</label>
                <input
                    id="backgroundColor"
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                />

                <br />
                <br />

                <label htmlFor='snippetWidth-slider'>Snippet Width ({snippetWidth}px)</label>
                <Slider
                    id='snippetWidth-slider'
                    value={snippetWidth}
                    onChange={(_, newValue) => setSnippetWidth(newValue as number)}
                    min={50}
                    max={300}
                    step={5}
                />

                <label htmlFor='snippetHeight-slider'>Snippet Height ({snippetHeight}px)</label>
                <Slider
                    id='snippetHeight-slider'
                    value={snippetHeight}
                    onChange={(_, newValue) => setSnippetHeight(newValue as number)}
                    min={50}
                    max={300}
                    step={5}
                />

                <button className="reset-button" onClick={resetSettings}>
                    Reset to Default
                </button>

                <div style={{ position: "relative", overflow: "hidden", height: snippetHeight }}>
                    <SnippetViewer
                        snippet={exampleSnippet}
                        snippetWidth={snippetWidth}
                        snippetHeight={snippetHeight}
                        onScan={() => { }}
                        onClearSnippet={() => { }}
                    >
                    </SnippetViewer>
                </div>
            </div>
        </div>
    );
};

export default Settings;