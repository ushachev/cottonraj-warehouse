import React from 'react';

import useAuth from '../hooks/useAuth.js';

const Root = () => {
  const auth = useAuth();

  return (
    <button type="button" onClick={auth.logOut}>Log out</button>
  );
};

export default Root;
