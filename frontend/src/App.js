import React from "react";
import { BrowserRouter, Route, Redirect, Switch } from "react-router-dom";

import AuthPage from "./pages/Auth";
import EventsPage from "./pages/Events";
import Bookings from "./pages/Bookings";
import MainNavigation from "./components/Navigation/MainNavigation";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <MainNavigation />
      <main className="main-content">
        <Switch>
          <Redirect from="/" to="/auth" exact />
          {/* <Route path="/" component={null} /> */}
          <Route path="/auth" component={AuthPage} />
          <Route path="/events" component={EventsPage} />
          <Route path="/bookings" component={Bookings} />
        </Switch>
      </main>
    </BrowserRouter>
  );
}

export default App;
