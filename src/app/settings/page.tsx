"use client";

import useLocalStorageState from 'use-local-storage-state';
import './settings.css';

const Settings = () => {
    const defaultApiHost = 'http://localhost:3001';
    const defaultDictionaryLookup = 'https://jisho.org/search/';
    const defaultSnippetWidth = 140;
    const defaultSnippetHeight = 200;

    const [apiHost, setApiHost] = useLocalStorageState<string>('apiHost', {
        defaultValue: defaultApiHost,
    });

    const [dictionaryLookup, setDictionaryLookup] = useLocalStorageState<string>('dictionaryLookup', {
        defaultValue: defaultDictionaryLookup,
    });

    const [snippetWidth, setSnippetWidth] = useLocalStorageState<number>('snippetWidth', {
        defaultValue: defaultSnippetWidth,
    });

    const [snippetHeight, setSnippetHeight] = useLocalStorageState<number>('snippetHeight', {
        defaultValue: defaultSnippetHeight,
    });

    // Handlers for changing the values
    const handleApiHostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setApiHost(e.target.value);
    };

    const handleDictionaryLookupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDictionaryLookup(e.target.value);
    };

    const handleSnippetWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSnippetWidth(Number(e.target.value));
    };

    const handleSnippetHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSnippetHeight(Number(e.target.value));
    };

    function resetSettings() {
        setApiHost(defaultApiHost);
        setDictionaryLookup(defaultDictionaryLookup);
        setSnippetWidth(defaultSnippetWidth);
        setSnippetHeight(defaultSnippetHeight);
    }

    return (
        <div className="settings-container">
            <h1>Settings</h1>

            <div className="settings-group">
                <label htmlFor="apiHost">API Host</label>
                <input
                    id="apiHost"
                    type="text"
                    value={apiHost}
                    onChange={handleApiHostChange}
                    placeholder="Enter API host"
                />
            </div>

            <div className="settings-group">
                <label htmlFor="dictionaryLookup">Dictionary Lookup URL</label>
                <input
                    id="dictionaryLookup"
                    type="text"
                    value={dictionaryLookup}
                    onChange={handleDictionaryLookupChange}
                    placeholder="Enter dictionary lookup URL"
                />
            </div>

            <div className="settings-group">
                <label htmlFor="snippetWidth">Snippet Width (px)</label>
                <input
                    id="snippetWidth"
                    type="number"
                    value={snippetWidth}
                    onChange={handleSnippetWidthChange}
                    placeholder="Enter snippet width"
                />
            </div>

            <div className="settings-group">
                <label htmlFor="snippetHeight">Snippet Height (px)</label>
                <input
                    id="snippetHeight"
                    type="number"
                    value={snippetHeight}
                    onChange={handleSnippetHeightChange}
                    placeholder="Enter snippet height"
                />
            </div>

            <div className="button-container">
                <button className="reset-button" onClick={resetSettings}>
                    Reset to Default
                </button>
            </div>
        </div>
    );
};

export default Settings;