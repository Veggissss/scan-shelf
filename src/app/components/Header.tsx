import React from 'react';
import Link from 'next/link';
import './header.css';

const Header: React.FC = () => {
  return (
    <header>
      <nav>
        <ul>
          <li>
            <Link href="/">Home</Link>
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
