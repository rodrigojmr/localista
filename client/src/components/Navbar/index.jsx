import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = props => {
  return (
    <nav>
      <Link to="/">Localista</Link>
      <Link to={'/profile'}>Profile</Link>
      {(props.user && (
        <>
          {/* <Link to={`/me`}>{props.user.username}</Link> */}
          {props.user.username}

          <Link to="/me/edit">Edit Profile</Link>
          <button onClick={props.onSignOut}>Sign Out</button>
        </>
      )) || (
        <>
          <Link to="/authentication/sign-up">Sign Up</Link>
          <Link to="/authentication/sign-in">Sign In</Link>
        </>
      )}
    </nav>
  );
};

export default Navbar;
