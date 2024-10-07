"use client";

import React, { useEffect, useState } from 'react';
import './shelf.css';

const FOLDERS_API_PATH = `${process.env.NEXT_PUBLIC_API_HOST}/api/folders`;
const THUMBNAIL_API_PATH = `${process.env.NEXT_PUBLIC_API_HOST}/api/thumbnail`;

interface Folder {
  folderName: string;
  files: string[];
}

interface Thumbnail {
  fileName: string;
  imageUrl: string;
}

function ShelfPage() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]); // State to hold thumbnails

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await fetch(FOLDERS_API_PATH);
        const data: Folder[] = await response.json();
        setFolders(data);
      } catch (error) {
        console.error("Error fetching folders:", error);
      }
    };

    fetchFolders();
  }, []);

  const fetchThumbnail = async (folderName: string, fileName: string) => {
    try {
      const response = await fetch(`${THUMBNAIL_API_PATH}/${folderName}/${fileName}`);
      const imageUrl = await response.json();
      return imageUrl; // Assuming the response contains the image URL directly
    } catch (error) {
      console.error(`Error fetching thumbnail for ${fileName}:`, error);
      return null;
    }
  };

  const handleFolderClick = (folderName: string) => {
    setSelectedFolder(selectedFolder === folderName ? null : folderName);
  };

  // Fetch thumbnails for files in selected folder
  useEffect(() => {
    const loadThumbnails = async () => {
      if (selectedFolder) {
        const folder = folders.find(folder => folder.folderName === selectedFolder);
        if (folder) {
          const thumbnailPromises = folder.files.map(async (file) => {
            const imageUrl = await fetchThumbnail(folder.folderName, file);
            return { fileName: file, imageUrl };
          });
          const results = await Promise.all(thumbnailPromises);
          setThumbnails(results.filter(thumbnail => thumbnail.imageUrl)); // Filter out nulls
        }
      }
    };

    loadThumbnails();
  }, [selectedFolder, folders]);

  return (
    <div className="shelf-container">
      <h1>Folder Viewer</h1>
      <div className="folders-grid">
        {folders.map((folder) => (
          <div key={folder.folderName} className="folder-item">
            <h2 onClick={() => handleFolderClick(folder.folderName)} className="folder-title">
              {folder.folderName}
            </h2>
            {selectedFolder === folder.folderName && (
              <ul className="file-list">
                {thumbnails.map(({ fileName, imageUrl }) => (
                  <li key={fileName}>
                    <a href={`/reader?filePath=${encodeURIComponent(folder.folderName + "/" + fileName)}`}>
                      <img src={imageUrl} alt={fileName} className="thumbnail" />
                    </a>
                    <span>{fileName}</span>
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
