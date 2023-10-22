export default class ChatView {
  static drawChat() {
    const chat = document.createElement('div');
    chat.classList.add('chat');
    chat.innerHTML = `
      <div class="chat__container">
        <div class="chat__list">
          <ul class="chat__users">
            <li class="chat__user user">
              <span class="user__name">Alexandra</span>
            </li>
          </ul>
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
