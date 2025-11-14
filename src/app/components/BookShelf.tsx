import React, { useState, useCallback, useEffect } from 'react';
import { basePath } from '../env.config';

interface BookShelfProps {
    folder: {
        folderName: string;
        files: string[];
    };
    apiHost: string;
}

const BookShelf: React.FC<BookShelfProps> = ({ folder, apiHost }) => {
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const [activeLoaded, setActiveLoaded] = useState<boolean>(false);
    const [loadedCovers, setLoadedCovers] = useState<Record<number, boolean>>({});
    const THUMBNAIL_API_PATH = `${apiHost}/api/thumbnail`;

    const coverWidth = 130;
    const coverHeight = 204;
    const bookThickness = 20;

    const coverWRem = coverWidth / 16;
    const thicknessRem = bookThickness / 16;
    const minGapRem = 0.2;
    const depthStep = 20;
    const sideLimit = 4;

    const next = useCallback(() => {
        setActiveIndex(i => (i + 1) % folder.files.length);
    }, [folder.files.length]);

    const prev = useCallback(() => {
        setActiveIndex(i => (i - 1 + folder.files.length) % folder.files.length);
    }, [folder.files.length]);

    // Load current active cover only and keep it cached
    useEffect(() => {
        setActiveLoaded(false);
        const img = new Image();
        img.src = `${THUMBNAIL_API_PATH}/${folder.folderName}/${folder.files[activeIndex]}`;
        img.onload = () => {
            setActiveLoaded(true);
            setLoadedCovers(prev => ({ ...prev, [activeIndex]: true }));
        };
    }, [activeIndex, folder.folderName, folder.files, THUMBNAIL_API_PATH]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') {
                next();
            }
            if (e.key === 'ArrowLeft') {
                prev();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [next, prev]);

    return (
        <div className="relative w-full mt-6 pb-14">
            <div
                className="relative h-[17rem] flex items-end justify-center overflow-visible"
                style={{ perspective: '1400px' }}
            >
                {/* Series Title */}
                <div className="absolute top-5 inset-x-0 text-center">
                    <h3 className="text-base font-semibold tracking-wide text-white/90">
                        {folder.folderName}
                    </h3>
                </div>

                {/* Shelf */}
                <div className="absolute bottom-4 w-full">
                    <div className="h-7 bg-gradient-to-t from-neutral-600 to-neutral-800" />
                </div>

                {folder.files.map((fileName, index) => {
                    if (Math.abs(index - activeIndex) > sideLimit) {
                        return null;
                    }

                    const offset = index - activeIndex;
                    const isActive = offset === 0;

                    const side = Math.sign(offset);
                    const sideIndex = Math.abs(offset);
                    let xRem = 0;
                    if (side !== 0) {
                        const base = coverWRem / 2;
                        xRem = side * (base + sideIndex * (thicknessRem + minGapRem));
                    }
                    if (side === 1) {
                        // Allign the right side
                        xRem -= 0.6
                    }

                    const translateX = xRem;
                    const translateZ = -sideIndex * depthStep;
                    const rotateY = isActive ? 0 : (side < 0 ? 80 : 90);
                    const scale = isActive ? 1 : 0.9;
                    const zIndex = isActive ? 100 : 95 - sideIndex;

                    const fileLink = `${basePath}/reader?filePath=${encodeURIComponent(folder.folderName + '/' + fileName)}`;

                    return (
                        <div
                            key={fileName}
                            className="absolute bottom-4 left-1/2 origin-bottom cursor-pointer"
                            style={{
                                transform: `translateX(-50%) translateX(${translateX}rem) translateZ(${translateZ}px)`,
                                transition: 'transform 400ms cubic-bezier(.25,1,.25,1)',
                                zIndex
                            }}
                            onClick={() => setActiveIndex(index)}
                        >
                            <div className="relative" style={{ width: coverWidth, height: coverHeight }}>
                                <div
                                    className="absolute inset-0 [transform-style:preserve-3d]"
                                    style={{
                                        transform: `rotateY(${rotateY}deg) translateZ(${bookThickness / 2}px) scale(${scale})`,
                                        transition: 'transform 650ms cubic-bezier(.16,.72,.23,.99)'
                                    }}
                                >
                                    {/* Front cover  */}
                                    <div
                                        className="absolute inset-0 overflow-hidden"
                                        style={{ transform: `translateZ(${bookThickness / 2}px)` }}
                                    >
                                        {isActive ? (
                                            activeLoaded ? (
                                                <a
                                                    href={fileLink}
                                                >
                                                    <img
                                                        src={`${THUMBNAIL_API_PATH}/${folder.folderName}/${fileName}`}
                                                        alt={fileName}
                                                        className="w-full h-full object-cover transition-transform hover:scale-95"
                                                        draggable={false}
                                                    />
                                                </a>
                                            ) : (
                                                <div className="w-full h-full animate-pulse bg-neutral-800" />
                                            )
                                        ) : loadedCovers[index] ? (
                                            <img
                                                src={`${THUMBNAIL_API_PATH}/${folder.folderName}/${fileName}`}
                                                alt={fileName}
                                                className="w-full h-full object-cover brightness-75 transition-all"
                                                draggable={false}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-neutral-850 to-neutral-800" />
                                        )}
                                    </div>

                                    {/* Spine */}
                                    <div
                                        className="absolute top-0 left-0 h-full bg-gradient-to-b from-neutral-800 to-neutral-950 shadow-inner ring-1 ring-black/30 flex items-center justify-center"
                                        style={{
                                            width: bookThickness,
                                            transform: `translateX(-${bookThickness / 2}px) rotateY(-90deg)`
                                        }}
                                    >
                                        <span
                                            className="text-[12px] font-semibold tracking-wide text-neutral-200 [writing-mode:vertical-rl] [text-orientation:mixed]"
                                            style={{ transform: 'rotate(180deg)', whiteSpace: 'nowrap' }}
                                        >
                                            {fileName.replace('.epub', '')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Soft shadow on shelf */}
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-24 h-4 rounded-full bg-black/90 blur-md opacity-50 -z-20" />
                        </div>
                    );
                })}
            </div>

            {/* Navigation */}
            <button
                type="button"
                aria-label="Previous"
                onClick={prev}
                className="absolute left-6 top-1/2 -translate-y-1/2 bg-neutral-900/60 hover:bg-neutral-800/70 text-white px-3 py-2 rounded-full shadow ring-1 ring-white/10"
            >
                ‹
            </button>
            <button
                type="button"
                aria-label="Next"
                onClick={next}
                className="absolute right-6 top-1/2 -translate-y-1/2 bg-neutral-900/60 hover:bg-neutral-800/70 text-white px-3 py-2 rounded-full shadow ring-1 ring-white/10"
            >
                ›
            </button>
        </div>
    );
};

export default BookShelf;