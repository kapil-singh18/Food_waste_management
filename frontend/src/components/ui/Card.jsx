import React from 'react';

function Card({ title, toned = false, children, className = '' }) {
  return (
    <section className={`card ${toned ? 'card-toned' : ''} ${className}`.trim()}>
      {title && <h2 className="card-title">{title}</h2>}
      {children}
    </section>
  );
}

export default Card;
