import { createBrowserHistory } from 'history'
import { Router, Route } from 'react-router-dom'
import React, { Component } from 'react';
import { Redirect } from 'react-router';

const PrivateRoute = ({ component: Component, ...rest }) => {

    // Add your own authentication on the below line.
    const isLoggedIn = localStorage.getItem('m3-auth-token') !== null

    return (
      <Route
        {...rest}
        render={props =>
          isLoggedIn ? (
            <Component {...props} />
          ) : (
            <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
          )
        }
      />
    )
  }
  
  export default PrivateRoute