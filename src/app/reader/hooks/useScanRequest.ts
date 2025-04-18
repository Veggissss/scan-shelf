import useLocalStorageState from 'use-local-storage-state';
import { defaultSettings } from '../../default.config';

export function useScanRequest(apiHost: string) {
    const OCR_API_PATH = `${apiHost}/api/ocr`;
    const [ocrOutput, setOcrOutput] = useLocalStorageState('ocrOutput', {
        defaultValue: [defaultSettings.OCR_PLACEHOLDER_TEXT],
    });

    const sendScanRequest = async (base64Image: string) => {
        try {
            const res = await fetch(OCR_API_PATH, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64Image }),
            });
            const data = await res.json();
            setOcrOutput(prev => [data.error || data.text, ...prev]);
        } catch (err: Error | unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setOcrOutput(prev => [errorMessage, ...prev]);
        }
    };

    return { ocrOutput, sendScanRequest };
}
