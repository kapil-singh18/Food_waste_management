import React from 'react';

function PageHeader({ eyebrow, title, description }) {
  return (
    <header className="page-head fade-in">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </header>
  );
}

export default PageHeader;
