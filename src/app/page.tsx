"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import { defaultSettings } from './default.config';
import BookShelf from './components/BookShelf';
import './shelf.css';

interface FolderData {
  folderName: string;
  files: string[];
}

function ShelfPage(): React.JSX.Element {
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(0);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [apiHost] = useLocalStorageState<string>('apiHost', { defaultValue: defaultSettings.API_HOST });

  const FOLDERS_API_PATH = `${apiHost}/api/folders`;
  const BATCH_SIZE = 3;
  const ROOT_MARGIN = '1200px 0px';
  const BOTTOM_PROXIMITY_PX = 300;

  const loadMore = useCallback(
    () => setVisibleCount(v => Math.min(v + BATCH_SIZE, folders.length)),
    [folders.length]
  );

  const triggerLoadMore = useCallback(() => {
    if (visibleCount >= folders.length) {
      return;
    }
    const remaining = document.documentElement.scrollHeight - (window.innerHeight + window.scrollY);
    if (remaining <= BOTTOM_PROXIMITY_PX) {
      loadMore();
    }
  }, [visibleCount, folders.length, loadMore]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(FOLDERS_API_PATH);
        const data: FolderData[] = await res.json();
        data.forEach(f =>
          f.files.sort((a, b) => {
            const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10);
            const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10);
            return numA - numB;
          })
        );
        setFolders(data);
      } catch (e) {
        console.error('Error fetching folders:', e);
      }
    })();
  }, [FOLDERS_API_PATH]);

  useEffect(() => {
    if (!loadMoreRef.current || visibleCount >= folders.length) {
      return;
    }

    let io: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(
        entries => {
          if (entries[0]?.isIntersecting) {
            triggerLoadMore();
          }
        },
        { root: null, rootMargin: ROOT_MARGIN, threshold: 0 }
      );
      io.observe(loadMoreRef.current);
    }

    let isLoading = false;
    const handleScroll = () => {
      if (isLoading) {
        return;
      }
      isLoading = true;
      requestAnimationFrame(() => {
        triggerLoadMore();
        isLoading = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      io?.disconnect();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [visibleCount, folders.length, triggerLoadMore]);

  const visibleFolders = folders.slice(0, visibleCount);
  return (
    <div className="shelf-container" ref={containerRef}>
      <h1>Scan Shelf Library</h1>
      <div className="shelf-subtitle italic">
        <p>{folders.reduce((t, f) => t + f.files.length, 0)} books total</p>
        <p>Showing {visibleFolders.length} of {folders.length} series</p>
      </div>
      <div className="folders-grid">
        {visibleFolders.map((f, index) => (
          <BookShelf key={`${f.folderName}-${index}`} folder={f} apiHost={apiHost} />
        ))}
        {visibleCount < folders.length && (
          <div
            ref={loadMoreRef}
            style={{ width: '100%', height: '140px', pointerEvents: 'none' }}
          />
        )}
      </div>
    </div>
  );
}

export default ShelfPage;
