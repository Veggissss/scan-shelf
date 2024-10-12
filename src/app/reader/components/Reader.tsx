import React, { useState, useEffect, useRef } from 'react';
import { NavItem, Rendition } from 'epubjs';
import { ReactReader } from 'react-reader';
import { useSearchParams } from 'next/navigation';
import useLocalStorageState from 'use-local-storage-state';
import OCROutput from './ScanOutput';
import SnippetViewer from './SnippetViewer';
import ReaderInformation from './ReaderInformation';
import { defaultSettings } from '../../default.config';
import Section from 'epubjs/types/section';

interface Snippet {
    dataUrl: string;
    left: number;
    top: number;
}

const Reader: React.FC = () => {
    const [apiHost] = useLocalStorageState('apiHost', { defaultValue: defaultSettings.API_HOST });
    const [dictionaryLookup] = useLocalStorageState('dictionaryLookup', { defaultValue: defaultSettings.DICTIONARY_LOOKUP });
    const [snippetWidth] = useLocalStorageState('snippetWidth', { defaultValue: defaultSettings.SNIPPET_WIDTH });
    const [snippetHeight] = useLocalStorageState('snippetHeight', { defaultValue: defaultSettings.SNIPPET_HEIGHT });
    const [isLTR] = useLocalStorageState('isLTR', { defaultValue: defaultSettings.IS_LTR });

    const searchParams = useSearchParams();
    const FILE_PATH = searchParams.get('filePath');

    const [, setCurrentlyReading] = useLocalStorageState("currentlyReading", { defaultValue: `/reader?filePath=${FILE_PATH || ''} `});

    const [location, setLocation] = useLocalStorageState(`persist-location-${FILE_PATH}`, { defaultValue: '0' });
    const [pageDisplay, setPageDisplay] = useState('Reading n/a');
    const toc = useRef<NavItem[]>([]);
    const [rendition, setRendition] = useState<Rendition>();
    const [text, setText] = useState('Scanned\nCharacters\nOutput!');
    const [snippet, setSnippet] = useState<Snippet | null>(null);
    const snippetRef = useRef<Snippet | null>(null);

    const OCR_API_PATH = `${apiHost}/api/ocr`;

    const sendRestRequest = (base64ImageSnippet: string) => {
        fetch(OCR_API_PATH, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64ImageSnippet }),
        })
            .then(response => response.json())
            .then(data => {
                setText(data.error || data.text);
            })
            .catch(error => {
                setText(error.message);
            });
    };

    useEffect(() => {
        if (!rendition) return;

        function captureSnippet(e: MouseEvent, img: HTMLImageElement) {
            const rect = img.getBoundingClientRect();
            const scaleX = img.naturalWidth / rect.width;
            const scaleY = img.naturalHeight / rect.height;
            const clickX = (e.clientX - rect.left) * scaleX;
            const clickY = (e.clientY - rect.top) * scaleY;

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            canvas.width = snippetWidth;
            canvas.height = snippetHeight;
            ctx.drawImage(img, clickX - snippetWidth / 2, clickY - snippetHeight / 2, snippetWidth, snippetHeight, 0, 0, snippetWidth, snippetHeight);

            const dataUrl = canvas.toDataURL('image/png');
            const updatedSnippet = { dataUrl, left: e.clientX - snippetWidth / 2, top: e.clientY - snippetHeight / 2 };
            setSnippet(updatedSnippet);
            snippetRef.current = updatedSnippet;
        }

        // Register image hooks to capture snippets
        rendition.hooks.content.register((content: Section) => {
            const images = content.document.querySelectorAll('img');
            images.forEach(img => {
                let isDragging = false;

                // Mouse events
                img.onmousedown = e => {
                    e.preventDefault();
                    isDragging = true;
                };

                img.onmousemove = e => {
                    if (isDragging) {
                        const mouseEvent = new MouseEvent('click', { clientX: e.clientX, clientY: e.clientY });
                        captureSnippet(mouseEvent, img);
                    }
                };

                img.onmouseup = e => {
                    e.preventDefault();
                    isDragging = false;
                };

                // Touch events
                img.ontouchstart = e => e.preventDefault();
                img.ontouchmove = e => {
                    e.preventDefault();
                    const touch = e.touches[0];
                    const mouseEvent = new MouseEvent('click', { clientX: touch.clientX, clientY: touch.clientY });
                    captureSnippet(mouseEvent, img);
                };
            });
        });
    }, [rendition, snippetWidth, snippetHeight, setCurrentlyReading, FILE_PATH]);

    return (
        <div>
            <OCROutput text={text} dictionaryLookup={dictionaryLookup} />
            <div style={{ height: '95vh' }}>
                <ReactReader
                    getRendition={_rendition => {
                        _rendition.themes.default({ img: { display: 'block', margin: '0 auto' } });
                        setRendition(_rendition)
                    }}
                    url={FILE_PATH ? `${apiHost}/${FILE_PATH}` : '/test.epub'}
                    location={location}
                    tocChanged={_toc => (toc.current = _toc)}
                    locationChanged={loc => {
                        setLocation(loc);

                        // Update currently reading
                        setCurrentlyReading(`/reader?filePath=${FILE_PATH || ''}`);

                        if (rendition && toc) {
                            const start = rendition.location.start;
                            const currentPage = toc.current.find(item => item.href === start.href);
                            setPageDisplay(`Reading ${FILE_PATH} ${currentPage ? currentPage.label : 'n/a'}`);
                        }
                    }}
                    isRTL={!isLTR}
                    epubInitOptions={{ openAs: 'epub' }}
                    epubOptions={{
                        allowPopups: true,
                        allowScriptedContent: true,
                        manager: 'default',
                        flow: 'paginated',
                        height: '100vh',
                        width: 'auto',
                        spread: 'none',
                    }}
                    epubViewStyles={{ view: { backgroundColor: 'black' }, viewHolder: { backgroundColor: 'black' } }}
                />
            </div>
            <SnippetViewer
                snippet={snippet}
                snippetWidth={snippetWidth}
                snippetHeight={snippetHeight}
                onScan={sendRestRequest}
                onClearSnippet={() => setSnippet(null)}
            />
            <ReaderInformation pageDisplay={pageDisplay} />
        </div>
    );
};

export default Reader;
