import React, { useState, useContext } from "react";
import { NavLink } from "react-router-dom";

import AuthContext from "../../context/auth-context";

import "./MainNavigation.css";

const MainNavigation = (props) => {
  const authContext = useContext(AuthContext);

  return (
    <header className="main-navigation">
      <div className="main-navigation__logo">
        <h1>Booking Wizard</h1>
      </div>
      <nav className="main-navigation__items">
        <ul>
          {!authContext.token && (
            <li>
              <NavLink to="/auth">Login</NavLink>
            </li>
          )}
          <li>
            <NavLink to="/events">Events</NavLink>
          </li>
          {authContext.token && (
            <>
              <li>
                <NavLink to="/bookings">Bookings</NavLink>
              </li>
              <li>
                <button onClick={authContext.logout}>Logout</button>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default MainNavigation;

// the differences between link and navlink it will match the path you are currently on and allow you to style them differently
