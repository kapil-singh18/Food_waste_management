import React from 'react';

function StatChip({ label, value }) {
  return (
    <article className="stat-chip">
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}

export default StatChip;
