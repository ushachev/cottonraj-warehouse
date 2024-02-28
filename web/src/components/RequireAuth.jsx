import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import useAuth from '../hooks/useAuth.js';

const RequireAuth = ({ children }) => {
  const auth = useAuth();
  const location = useLocation();

  if (auth.loggedIn) {
    return children;
  }

  return (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default RequireAuth;
