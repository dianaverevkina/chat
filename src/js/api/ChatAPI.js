import Entity from './Entity';
import createRequest from './createRequest';

export default class ChatAPI extends Entity {
  constructor() {
    super();
    this.url = 'http://localhost:3000';
  }

  async createUser(userName) {
    const url = `${this.url}/new-user`;
    const options = {
      url,
      method: 'POST',
      data: userName,
    };
    const result = await createRequest(options);
    return result;
  }
}
