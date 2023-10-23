/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./src/js/api/createRequest.js
const createRequest = async function () {
  let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  const response = await fetch(options.url, {
    method: options.method,
    body: JSON.stringify(options.data)
  });
  const json = await response.json();
  return json;
};
/* harmony default export */ const api_createRequest = (createRequest);
;// CONCATENATED MODULE: ./src/js/api/ChatAPI.js

class ChatAPI {
  constructor() {
    this.url = 'https://chat-backend-ff5v.onrender.com';
  }
  async createUser(userName) {
    const url = `${this.url}/new-user`;
    const options = {
      url,
      method: 'POST',
      data: userName
    };
    const result = await api_createRequest(options);
    return result;
  }
}
;// CONCATENATED MODULE: ./src/js/ChatView.js
class ChatView {
  static drawChat() {
    const chat = document.createElement('div');
    chat.classList.add('chat');
    chat.innerHTML = `
      <div class="chat__container">
        <div class="chat__list">
          <ul class="chat__users">
          </ul>

          <button class="chat__btn-exit">Log out</button>
        </div>
        <div class="chat__block">
          <div class="chat__messages"></div>
          <div class="chat__field">
            <input name="" class="chat__input" placeholder="Type your message here"/>
            <button class="chat__btn-send">
              <span class="chat__btn-icon">
                <img src="./images/Send.svg" alt="">
              </span>
            </button>
          </div>
        </div>
      </div>
    `;
    return chat;
  }
}
;// CONCATENATED MODULE: ./src/js/Chat.js


class Chat {
  constructor(container) {
    this.container = container;
    this.api = new ChatAPI();
    this.websocket = null;
    this.logIn = this.logIn.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.logout = this.logout.bind(this);
  }
  init() {
    this.bindToDOM();
    this.registerEvents();
  }
  bindToDOM() {
    this.container.innerHTML = `
      <div class="popover">
        <div class="popover__container">
          <form class="popover__form form">
            <h1 class="form__title">Enter your nickname</h1>
            <div class="form__field">
              <input type="text" name="name" class="form__input" required>
            </div>
            <button class="form__btn-continue">Continue</button>
          </form>
        </div>
      </div>
    `;
    this.popover = this.container.querySelector('.popover');
    this.form = this.container.querySelector('.form');
    this.inputName = this.form.querySelector('.form__input');
    this.btnAddUser = this.form.querySelector('.form__btn-continue');
  }

  // Добавяем обработчики событий для popover
  registerEvents() {
    this.form.addEventListener('submit', this.logIn);
    this.btnAddUser.addEventListener('click', this.logIn);
    this.inputName.addEventListener('input', () => {
      if (this.error) this.error.remove();
    });
  }

  // Закрываем popover, открываем чат и добавляем пользователя
  async logIn(e) {
    e.preventDefault();
    const user = {
      name: this.inputName.value
    };
    const result = await this.api.createUser(user);
    if (result.status === 'error') {
      this.showError();
      return;
    }
    this.popover.remove();
    this.createChat();
    this.user = result.user;
    this.addUser(result.user);
  }

  // Создаем чат
  createChat() {
    this.chat = ChatView.drawChat();
    this.container.append(this.chat);
    this.users = this.chat.querySelector('.chat__users');
    this.btnExit = this.chat.querySelector('.chat__btn-exit');
    this.messages = this.chat.querySelector('.chat__messages');
    this.btnSend = this.chat.querySelector('.chat__btn-send');
    this.inputMessage = this.chat.querySelector('.chat__input');
    this.addEventsForChat();
    this.websocket = new WebSocket('wss://chat-backend-ff5v.onrender.com//ws');
    this.subscribeOnEvents();
  }

  // Добавляем пользователя
  addUser(_ref) {
    let {
      id,
      name
    } = _ref;
    const user = document.createElement('li');
    user.classList.add('chat__user', 'user');
    user.setAttribute('data-id', id);
    const isYou = id === this.user.id;
    user.innerHTML = `
      <span class="user__name ${isYou ? 'user__name_red' : ''}">${isYou ? 'You' : name}</span>
    `;
    this.users.append(user);
  }

  // Показываем ошибку
  showError() {
    this.error = document.createElement('p');
    this.error.classList.add('form__error');
    this.error.textContent = 'The nickname you provided already exists';
    this.inputName.after(this.error);
  }

  // Подписываемя на события websocket
  subscribeOnEvents() {
    this.websocket.addEventListener('message', e => {
      const data = JSON.parse(e.data);
      if (data.type === 'send') {
        this.renderMessage(data);
        this.scrollChat();
        return;
      }
      this.users.innerHTML = '';
      data.forEach(user => this.addUser(user));
    });
  }

  // Добавяем обработчики событий для чата
  addEventsForChat() {
    this.inputMessage.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      this.sendMessage(e);
    });
    this.btnSend.addEventListener('click', this.sendMessage);
    this.btnExit.addEventListener('click', this.logout);
  }

  // При клике отправить или 'enter' отправляем сообщение
  sendMessage(e) {
    e.preventDefault();
    const message = this.inputMessage.value;
    if (!message) return;
    const data = {
      type: 'send',
      user: {
        name: this.user.name
      },
      message
    };
    this.websocket.send(JSON.stringify(data));
    this.inputMessage.value = '';
  }

  // Создаем разметку сообщения
  renderMessage(_ref2) {
    let {
      user,
      message
    } = _ref2;
    const isUser = this.user.name === user.name;
    const {
      time,
      date
    } = this.formatDate();
    const messageHTML = `
      <div class="chat__message message ${isUser ? 'message-user' : ''}">
        <div class="message__data">
          <div class="message__sender">${isUser ? 'You' : user.name},</div>
          <div class="message__date">${time} ${date}</div>
        </div>
        <div class="message__content">${message}</div>
      </div>
    `;
    this.messages.insertAdjacentHTML('beforeend', messageHTML);
  }

  // Форматируем дату
  formatDate() {
    const options = {
      hour: 'numeric',
      minute: 'numeric'
    };
    const fullDate = new Date();
    const time = fullDate.toLocaleTimeString('ru-RU', options);
    const date = fullDate.toLocaleDateString();
    return {
      time,
      date
    };
  }

  // При клике выйти направляем сообщение серверу, выводим начальное окно и обновляем пользователей
  logout(e) {
    e.preventDefault();
    const data = {
      type: 'exit',
      user: {
        name: this.user.name
      }
    };
    this.websocket.send(JSON.stringify(data));
    this.chat.remove();
    window.location.reload();
  }

  // Автоматическое пролистывание чата вниз
  scrollChat() {
    this.messages.scrollBy({
      top: this.messages.scrollHeight,
      left: 0,
      behavior: 'smooth'
    });
  }
}
;// CONCATENATED MODULE: ./src/js/app.js

const root = document.querySelector('.root');
const app = new Chat(root);
app.init();
;// CONCATENATED MODULE: ./src/index.js


/******/ })()
;
//# sourceMappingURL=main.js.map