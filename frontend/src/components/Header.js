// Header.js
import React from 'react';
import './Header.css';  // Make sure this path correctly points to where Header.css is located relative to Header.js

const Header = ({ title }) => {
  return (
    <header className="site-header">
      <h1>{title}</h1>
    </header>
  );
};

export default Header;
