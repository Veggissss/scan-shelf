"use client";

import React, { useEffect, useState } from 'react';
import './shelf.css';

const FOLDERS_API_PATH = `${process.env.NEXT_PUBLIC_API_HOST}/api/folders`;
const THUMBNAIL_API_PATH = `${process.env.NEXT_PUBLIC_API_HOST}/api/thumbnail`;

interface Folder {
  folderName: string;
  files: string[];
}

function ShelfPage() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await fetch(FOLDERS_API_PATH);
        const data: Folder[] = await response.json();

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
    };

    fetchFolders();
  }, []);

  
  const handleFolderClick = (folderName: string) => {
    setSelectedFolder(selectedFolder === folderName ? null : folderName);
  };

  // Fetch thumbnails for files in selected folder
  useEffect(() => {

  }, [selectedFolder, folders]);

  return (
    <div className="shelf-container">
      <h1>Scan Shelf Library</h1>
      <div className="folders-grid">
        {folders.map((folder) => (
          <div key={folder.folderName}>
            <h2 onClick={() => handleFolderClick(folder.folderName)} className="folder-title">
              {folder.folderName}
            </h2>
            {selectedFolder === folder.folderName && (
              <ul className="file-list">
                {folder.files.map((fileName) => (
                  <li key={fileName} className="folder-item">
                    <a href={`/reader?filePath=${encodeURIComponent(folder.folderName + "/" + fileName)}`}>
                      <img src={`${THUMBNAIL_API_PATH}/${selectedFolder}/${fileName}`} alt={fileName} className="thumbnail"/>
                      <p>{fileName}</p>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ShelfPage;
