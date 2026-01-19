import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './assets/common/styles.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
// import '../src/assets/css/ReviewRegisterPage.css'
import { Provider } from 'react-redux'
import { legacy_createStore as createStore } from 'redux'
import rootReducer from './reducer/rootReducer';


export const store = createStore(rootReducer);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
  <BrowserRouter>
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>
  // </React.StrictMode>
);


