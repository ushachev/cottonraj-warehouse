import 'core-js/stable/index.js';
import 'regenerator-runtime/runtime.js';
import ReactDOM from 'react-dom';

import './assets/styles/application.scss';

import init from './app/init.jsx';

const app = init();
const container = document.getElementById('app');

ReactDOM.render(app, container);
