"use client";

import React, { useEffect, useRef, useState } from 'react';
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

  const [apiHost] = useLocalStorageState<string>('apiHost', {
    defaultValue: defaultSettings.API_HOST,
  });

  const FOLDERS_API_PATH = `${apiHost}/api/folders`;

  useEffect(() => {
    async function fetchFolders() {
      try {
        const response = await fetch(FOLDERS_API_PATH);
        const data: FolderData[] = await response.json();

        data.forEach((folder) => {
          folder.files.sort((a, b) => {
            const numA = parseInt(a.match(/\d+/)?.[0] || "0", 10);
            const numB = parseInt(b.match(/\d+/)?.[0] || "0", 10);
            return numA - numB;
          });
        });

        setFolders(data);

        // Dynamically decide initial shelves to render based on viewport height
        const approxShelfHeight = 300;
        const initial = Math.min(
          data.length,
          Math.max(6, Math.ceil(window.innerHeight / approxShelfHeight) + 2)
        );
        setVisibleCount(initial);
      } catch (error) {
        console.error("Error fetching folders:", error);
      }
    }

    fetchFolders();
  }, [FOLDERS_API_PATH]);

  useEffect(() => {
    // Load more shelves when the sentinel is visible
    if (!loadMoreRef.current) return;
    if (visibleCount >= folders.length) return;

    const BATCH_SIZE = 3;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, folders.length));
        }
      },
      { root: null, rootMargin: '400px 0px', threshold: 0 }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [folders.length, visibleCount]);

  const visibleFolders = folders.slice(0, visibleCount);

  return (
    <div className="shelf-container">
      <h1>Scan Shelf Library</h1>
      <div className="shelf-subtitle italic">
        <p>
          {folders.reduce((total, folder) => total + folder.files.length, 0)} books total
        </p>
        <p>
          Showing {visibleFolders.length} of {folders.length} series
        </p>
      </div>
      <div className="folders-grid">
        {visibleFolders.map((folder) => (
          <BookShelf key={folder.folderName} folder={folder} apiHost={apiHost} />
        ))}
        <div ref={loadMoreRef} className="w-full h-8" />
      </div>
    </div>
  );
}

export default ShelfPage;
