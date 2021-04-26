import React from "react";
import { NavLink } from "react-router-dom";

import './MainNavigation.css'

const MainNavigation = (props) => {
  return (
    <header className="main-navigation">
      <div className="main-navigation__logo">
        <h1>Booking Wizard</h1>
      </div>
      <nav className="main-navigation__items">
        <ul>
          <li>
            <NavLink to="/auth">Login</NavLink>
          </li>
          <li>
            <NavLink to="/events">Events</NavLink>
          </li>
          <li>
            <NavLink to="/bookings">Bookings</NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default MainNavigation;

// the differences between link and navlink it will match the path you are currently on and allow you to style them differently
