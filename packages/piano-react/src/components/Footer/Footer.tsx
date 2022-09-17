import './Footer.css';
import GitHubLogo from './assets/GitHub-Mark-Light-32px.png';
import React, { FC } from 'react';

export const Footer: FC = () => {
  return (
    <div className="footer">
      <a href="https://github.com/stromland/piano" target="blank">
        <img src={GitHubLogo} alt="GitHub Logo" />
      </a>
    </div>
  );
};
