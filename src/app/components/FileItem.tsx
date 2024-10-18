import React from 'react';
import { basePath } from '../env.config';

interface FileItemProps {
  folderName: string;
  fileName: string;
  thumbnailPath: string;
}

const FileItem: React.FC<FileItemProps> = ({ folderName, fileName, thumbnailPath }) => {
  const fileLink = `${basePath}/reader?filePath=${encodeURIComponent(folderName + "/" + fileName)}`;

  return (
    <li className="folder-item">
      <a href={fileLink}>
        <img src={thumbnailPath} alt={fileName} className="thumbnail" />
        <p>{fileName}</p>
      </a>
    </li>
  );
};

export default FileItem;
