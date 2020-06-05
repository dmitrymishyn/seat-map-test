import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import './App.css';
import Event from './containers/Event';

const App: React.FC = () => (
  <Router>
    <Switch>
      <Route path="/" component={Event} />
    </Switch>
  </Router>
);

export default App;
