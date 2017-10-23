/**
 * This request wrapper controls what will be returned by one url / http verb
 * Normally when you set up pretender, you give it one function to handle one url / verb.
 *
 * So, for example, you would:
 *
 *  ```
 *    pretender.get('/users', myfunction )
 *  ```
 *
 *  to mock a [GET /users] call
 *
 *  This wrapper allows that GET /users call to be handled my many functions
 *  instead of just one, since this request handler hold the ability to take
 *  a list of hanlders.
 *
 *  That way you can setup a few mocks like
 *
 *  ```
 *    mockFindAll('user')
 *    mockQuery('user', {name: 'Dude'})
 *  ```
 *
 *  and both of these hanlders will reside in the list for the wrapper that
 *  belongs to [GET /users]
 */
export default class {

  constructor() {
    this.index = 0;
    this.handlers = [];
    return this.generateRequestHandler();
  }

  /**
   * Generating a function that we can hand off to pretender that
   * will handle the request.
   *
   * Before passing back that function, add some other functions
   * to control the handlers array
   *
   * @returns {function(this:T)}
   */
  generateRequestHandler() {
    let requestHandler = this.handleRequest.bind(this),
        methods        = ['addHandler', 'removeHandler', 'indexes', 'getHandlers'];
    methods.forEach(method => requestHandler[method] = this[method].bind(this));
    return requestHandler;
  }

  // mainly for tests to inspect
  getHandlers() {
    return this.handlers;
  }

  addHandler(handler) {
    this.handlers.push(handler);
    return this.index++;
  }

  removeHandler(handler) {
    this.handlers = this.handlers.filter(h => h.mockId !== handler.mockId);
  }

  /**
   * This is the method that pretender will call to handle the request.
   *
   * Flip though the list to find a handler that matches and return
   * the response if you find a handler.
   *
   * @param {FakeRequest} request pretenders object
   * @returns {[null,null,null]}
   */
  handleRequest(request) {
    let handler = this.handlers.find(handler => handler.matches(request));
    if (handler) {
      let { status, headers, responseText } = handler.getResponse();
      return [status, headers, responseText]
    }
  }
}