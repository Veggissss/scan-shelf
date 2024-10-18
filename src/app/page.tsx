"use client";

import React, { useEffect, useState } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import Folder from './components/Folder';
import { defaultSettings } from './default.config';
import './shelf.css';

interface FolderData {
  folderName: string;
  files: string[];
}

function ShelfPage() : React.JSX.Element {
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

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
      } catch (error) {
        console.error("Error fetching folders:", error);
      }
    }

    fetchFolders();
  }, [FOLDERS_API_PATH]);

  const handleFolderClick = (folderName: string) => {
    setSelectedFolder(selectedFolder === folderName ? null : folderName);
  };

  return (
    <div className="shelf-container">
      <h1>Scan Shelf Library</h1>
      <div className="folders-grid">
        {folders.map((folder) => (
          <Folder
            key={folder.folderName}
            folder={folder}
            isSelected={selectedFolder === folder.folderName}
            onClick={handleFolderClick}
            apiHost={apiHost}
          />
        ))}
      </div>
    </div>
  );
}

export default ShelfPage;
