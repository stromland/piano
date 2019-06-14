import React from "react";

import GitHubLogo from "./assets/GitHub-Mark-Light-32px.png";

export function Footer() {
  return (
    <div className="footer">
      <a href="https://github.com/stromland/piano" target="blank">
        <img src={GitHubLogo} alt="GitHub Logo" />
      </a>
    </div>
  );
}
