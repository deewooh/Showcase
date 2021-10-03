import React from 'react';
import ReactDOM from 'react-dom';
import {render} from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import '../../../node_modules/bootstrap/dist/css/bootstrap.css';
import './index.css';
import App from './components/App';



render((
    <BrowserRouter>
        <App  />
    </BrowserRouter>
    
), document.getElementById('root'));


/*
ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('root')
  );
  */