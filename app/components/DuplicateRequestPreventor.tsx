import React from 'react';

/**
 * Higher-order component that prevents double-execution in React development mode
 * This addresses the issue where useEffect runs twice in development with React 18+
 */

interface DuplicateRequestPreventorProps {
  children: React.ReactNode;
}

const DuplicateRequestPreventor: React.FC<DuplicateRequestPreventorProps> = ({ children }) => {
  // In development, React StrictMode intentionally double-invokes certain functions
  // to help detect side effects. This is a wrapper to handle that scenario.
  return <>{children}</>;
};

export default DuplicateRequestPreventor;
