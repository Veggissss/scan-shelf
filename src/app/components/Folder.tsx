import React from 'react';
import FileItem from './FileItem';

interface FolderProps {
  folder: {
    folderName: string;
    files: string[];
  };
  isSelected: boolean;
  onClick: (folderName: string) => void;
  apiHost: string;
}

const Folder: React.FC<FolderProps> = ({ folder, isSelected, onClick, apiHost }) => {
  const THUMBNAIL_API_PATH = `${apiHost}/api/thumbnail`;

  return (
    <div>
      <h2 onClick={() => onClick(folder.folderName)} className="folder-title">
        {folder.folderName}
      </h2>
      {isSelected && (
        <ul className="file-list">
          {folder.files.map((fileName) => (
            <FileItem
              key={fileName}
              folderName={folder.folderName}
              fileName={fileName}
              thumbnailPath={`${THUMBNAIL_API_PATH}/${folder.folderName}/${fileName}`}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default Folder;
