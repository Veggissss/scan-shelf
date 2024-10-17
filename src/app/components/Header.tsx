"use client";

import React from 'react';
import Link from 'next/link';
import useLocalStorageState from 'use-local-storage-state';
import { basePath } from '../basePath';
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
            <a href={basePath + currentlyReading}>Reading</a>
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
