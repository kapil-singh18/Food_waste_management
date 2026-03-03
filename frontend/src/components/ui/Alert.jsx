import React from 'react';

function Alert({ tone = 'info', children, ariaLive = 'polite' }) {
  return (
    <div className={`alert alert-${tone}`} role="status" aria-live={ariaLive}>
      {children}
    </div>
  );
}

export default Alert;
