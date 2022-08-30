import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from './contextapi/Context';
import { BrowserRouter } from 'react-router-dom';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(

  //provider allows context props to be accessible to all components in app
  <Provider>
    {/*<React.StrictMode>*/}
      <BrowserRouter> {/*wrap the app in browser router so i can use useNavigation in app component*/}
        <App />
      </BrowserRouter>
    {/*</React.StrictMode>*/}
  </Provider>
 
);
