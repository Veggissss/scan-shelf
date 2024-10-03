"use client";

import React, { useEffect, useState } from 'react';
import './shelf.css';

const FOLDERS_API_PATH = "http://192.168.1.3:3001/api/folders";

function ShelfPage() {
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFolders = async () => {
            try {
                const response = await fetch(FOLDERS_API_PATH);
                const data = await response.json();
                setFolders(data);
            } catch (error) {
                console.error('Error fetching folders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFolders();
    }, []);

    return (
        <div className="App">
            <h1>Book Folders</h1>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="grid">
                    {folders.map((folder) => (
                        <div className="grid-item" key={folder}>
                            {folder}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ShelfPage;
