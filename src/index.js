import 'core-js/stable/index.js';
import 'regenerator-runtime/runtime.js';

import './assets/styles/application.scss';

const p = document.createElement('p');
p.classList.add('card-text');
p.textContent = 'It works!';

const h5 = document.createElement('h5');
h5.classList.add('card-title', 'title', 'h2');
h5.textContent = 'Frontend boilerplate';

const cardBody = document.createElement('div');
cardBody.classList.add('card-body');
cardBody.append(h5, p);

const card = document.createElement('div');
card.classList.add('card', 'text-center');
card.append(cardBody);

const container = document.querySelector('#app');
container.innerHTML = '';
container.append(card);

console.log('it works');
