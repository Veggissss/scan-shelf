import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { NavItem, Rendition } from 'epubjs';
import { ReactReader } from 'react-reader';
import Section from 'epubjs/types/section';

import darkReaderStyle from './darkReaderStyle';
import { useReaderSettings } from '../hooks/useReaderSettings';
import { useScanRequest } from '../hooks/useScanRequest';
import OCROutput from './ScanOutput';
import ReaderInformation from './ReaderInformation';
import Snippet from '../types/Snippet';
import SnippetViewer from './SnippetViewer';


const Reader: React.FC = () => {
    const searchParams = useSearchParams();
    const filePath = searchParams.get('filePath') ?? '';
    const {
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
    } = useReaderSettings(filePath);
    const { ocrOutput, sendScanRequest } = useScanRequest(apiHost);

    const [pageDisplay, setPageDisplay] = useState('Reading n/a');
    const [rendition, setRendition] = useState<Rendition>();
    const [snippet, setSnippet] = useState<Snippet | null>(null);

    const toc = useRef<NavItem[]>([]);
    const snippetRef = useRef<Snippet | null>(null);

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

            const sourceWidth = snippetWidth / zoomFactor;
            const sourceHeight = snippetHeight / zoomFactor;
            const sourceX = clickX - sourceWidth / 2;
            const sourceY = clickY - sourceHeight / 2;

            ctx.drawImage(
                img,
                // zoomed-in source area
                sourceX, sourceY, sourceWidth, sourceHeight,
                // canvas destination
                0, 0, snippetWidth, snippetHeight
            );

            const dataUrl = canvas.toDataURL('image/png');
            const updatedSnippet = { dataUrl, left: e.clientX - snippetWidth / 2, top: e.clientY - snippetHeight / 2 };
            setSnippet(updatedSnippet);
            snippetRef.current = updatedSnippet;
        }

        // Register image hooks to capture snippets
        rendition.hooks.content.register((content: Section) => {
            const images = content.document.querySelectorAll('img, image');
            images.forEach(image => {
                const img = image as HTMLImageElement;
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
    }, [rendition, snippetWidth, snippetHeight, setCurrentlyReading, filePath, zoomFactor]);

    return (
        <div>
            <OCROutput text={ocrOutput[0]} dictionaryLookup={dictionaryLookup} />
            <div style={{ height: '95vh' }}>
                <ReactReader
                    title={""}
                    getRendition={_rendition => {
                        _rendition.themes.default({
                            img: {
                                display: 'block',
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -55%)',
                            },
                        });
                        setRendition(_rendition)
                    }}
                    url={filePath ? `${apiHost}/${filePath}` : '/test.epub'}
                    location={location}
                    tocChanged={_toc => (toc.current = _toc)}
                    locationChanged={loc => {
                        setLocation(loc);

                        // Update currently reading
                        setCurrentlyReading(`/reader?filePath=${filePath || ''}`);

                        if (rendition && toc) {
                            const start = rendition.location.start;
                            const currentPage = toc.current.find(item => item.href === start.href);
                            setPageDisplay(`Reading ${filePath} ${currentPage ? currentPage.label : 'n/a'}`);
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
                    readerStyles={darkReaderStyle}
                    epubViewStyles={{ view: { backgroundColor: backgroundColor }, viewHolder: {} }}
                />
            </div>
            <SnippetViewer
                snippet={snippet}
                snippetWidth={snippetWidth}
                snippetHeight={snippetHeight}
                onScan={sendScanRequest}
                onClearSnippet={() => setSnippet(null)}
            />
            <ReaderInformation pageDisplay={pageDisplay} />
        </div>
    );
};

export default Reader;