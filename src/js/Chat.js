import ChatAPI from './api/ChatAPI';
import ChatView from './ChatView';

export default class Chat {
  constructor(container) {
    this.container = container;
    this.api = new ChatAPI();
    this.websocket = null;

    this.logIn = this.logIn.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
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
            <h1 class="form__title">Введите никнейм</h1>
            <div class="form__field">
              <input type="text" name="name" class="form__input" required>
            </div>
            <button class="form__btn-continue">Продолжить</button>
          </form>
        </div>
      </div>
    `;

    this.popover = this.container.querySelector('.popover');
    this.form = this.container.querySelector('.form');
    this.inputName = this.form.querySelector('.form__input');
    this.btnAddUser = this.form.querySelector('.form__btn-continue');
  }

  registerEvents() {
    this.form.addEventListener('submit', this.logIn);
    this.inputName.addEventListener('input', () => {
      if (this.error) this.error.remove();
    });
    this.btnAddUser.addEventListener('click', this.logIn);
  }

  async logIn(e) {
    e.preventDefault();
    const user = {
      name: this.inputName.value,
    };
    const result = await this.api.createUser(user);

    if (result.status === 'ok') {
      this.popover.remove();
      this.createChat();
      this.user = result.user;
      this.addUser();
    }
    if (result.status === 'error') {
      this.showError();
    }
  }

  subscribeOnEvents() {
    this.websocket.addEventListener('open', (e) => {
      console.log(e);
      console.log('ws open');
    });

    this.websocket.addEventListener('close', (e) => {
      console.log(e);
      console.log('ws close');
    });

    this.websocket.addEventListener('error', (e) => {
      console.log(e);
      console.log('ws error');
    });

    this.websocket.addEventListener('message', (e) => {
      console.log(e);

      const data = JSON.parse(e.data);
      // const { chat: messages } = data;

      // messages.forEach(message => {
      //   chat.appendChild(document.createTextNode(message) + '\n');
      // });

      console.log('ws message');
    });
  }

  onEnterChatHandler() {}

  sendMessage() {
    const message = this.inputMessage.value;

    if (!message) return;

    const data = {
      type: 'send',
      user: {
        name: this.user.name,
      },
      message,
    };

    this.websocket.send(data);
    this.inputMessage.value = '';
  }

  renderMessage() {
    const inhj = `<div class="chat__mesage message message-user">
                <div class="message__data">
                  <div class="message__sender">You,</div>
                  <div class="message__date">23:04 20.03.2022</div>
                </div>
                <div class="message__content">
                  Listen this music. Listen to this music. This is a nice song.
                  Listen to this music. This is a nice song
                </div>
              </div>`;
  }

  createChat() {
    const chat = ChatView.drawChat();
    this.container.append(chat);

    this.users = chat.querySelector('.chat__users');
    this.messages = chat.querySelector('.chat__messages');
    this.btnSend = chat.querySelector('.chat__btn-send');
    this.inputMessage = chat.querySelector('.chat__input');

    this.websocket = new WebSocket('wss://http://localhost:3000/ws');
    this.subscribeOnEvents();
    this.btnSend.addEventListener('click', this.sendMessage);
  }

  addUser() {
    const user = document.createElement('li');
    user.classList.add('chat__user', 'user');
    user.innerHTML = `
      <span class="user__name" data-id=${this.user.id}>${this.user.name}</span>
    `;
    this.users.append(user);
  }

  showError() {
    this.error = document.createElement('p');
    this.error.classList.add('form__error');
    this.error.textContent = 'Такой никнейм уже существует';
    this.inputName.after(this.error);
  }
}
