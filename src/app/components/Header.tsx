"use client";

import React from 'react';
import Link from 'next/link';
import useLocalStorageState from 'use-local-storage-state';
import './header.css';

const Header: React.FC = () => {
  const [currentlyReading] = useLocalStorageState("currentlyReading", { defaultValue: `/reader` });

  return (
    <header>
      <nav>
        <ul>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href={currentlyReading}>History</Link>
          </li>
          <li>
            <Link href="/history">History</Link>
          </li>
          <li>
            <Link href="/settings">Settings</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
