import useLocalStorageState from 'use-local-storage-state';
import { defaultSettings } from '../../default.config';

export function useReaderSettings(filePath: string) {
    const [apiHost] = useLocalStorageState('apiHost', { defaultValue: defaultSettings.API_HOST });
    const [dictionaryLookup] = useLocalStorageState('dictionaryLookup', { defaultValue: defaultSettings.DICTIONARY_LOOKUP });
    const [snippetWidth] = useLocalStorageState('snippetWidth', { defaultValue: defaultSettings.SNIPPET_WIDTH });
    const [snippetHeight] = useLocalStorageState('snippetHeight', { defaultValue: defaultSettings.SNIPPET_HEIGHT });
    const [isLTR] = useLocalStorageState('isLTR', { defaultValue: defaultSettings.IS_LTR });
    const [backgroundColor] = useLocalStorageState('backgroundColor', { defaultValue: defaultSettings.BACKGROUND_COLOR });
    const [zoomFactor] = useLocalStorageState('zoomFactor', { defaultValue: defaultSettings.ZOOM_FACTOR });
    const [location, setLocation] = useLocalStorageState(`persist-location-${filePath}`, { defaultValue: '0' });
    const [, setCurrentlyReading] = useLocalStorageState('currentlyReading', {
        defaultValue: `/reader?filePath=${filePath}`,
    });

    return {
        apiHost,
        dictionaryLookup,
        snippetWidth,
        snippetHeight,
        isLTR,
        backgroundColor,
        zoomFactor,
        location,
        setLocation,
        setCurrentlyReading,
    };
}
