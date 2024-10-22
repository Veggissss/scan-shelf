"use client";

import useLocalStorageState from 'use-local-storage-state';
import ScanOutput from '../reader/components/ScanOutput';
import { defaultSettings } from '../default.config';
import './history.css';

const Settings = () => {
    const [ocrOutput, setOcrOutput] = useLocalStorageState("ocrOutput", { defaultValue: [defaultSettings.OCR_PLACEHOLDER_TEXT] });
    const [dictionaryLookup] = useLocalStorageState('dictionaryLookup', { defaultValue: defaultSettings.DICTIONARY_LOOKUP });

    function resetSettings() {
        setOcrOutput([]);
    }

    function removeFromHistory(index: number) {
        ocrOutput.splice(index, 1);
        setOcrOutput(ocrOutput);
    }

    return (
        <div className="info-container">
            <h1>OCR History</h1>

            <div>
                <div className="ocr-output">
                    {ocrOutput.map((text, index) => (
                        <div key={index} className='ocr-item'>
                            <ScanOutput text={text} dictionaryLookup={dictionaryLookup}></ScanOutput>
                            <button className='remove-button' onClick={() => removeFromHistory(index)}>Remove</button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="button-container">
                <button className="reset-button" onClick={resetSettings}>
                    Clear History
                </button>
            </div>
        </div>
    );
};

export default Settings;