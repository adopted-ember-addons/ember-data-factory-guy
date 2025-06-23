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
export default class RequestWrapper {
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
    const requestHandler = this.handleRequest.bind(this);
    requestHandler.getHandlers = this.getHandlers.bind(this);
    requestHandler.addHandler = this.addHandler.bind(this);
    requestHandler.removeHandler = this.removeHandler.bind(this);
    return requestHandler;
  }

  /**
   * Sort the handlers by those with queryParams first, then matchArgs second, then anything else
   */
  getHandlers() {
    return [...this.handlers].sort(
      (a, b) =>
        b.hasQueryParams() - a.hasQueryParams() ||
        Boolean(b.matchArgs) - Boolean(a.matchArgs),
    );
  }

  addHandler(handler) {
    this.handlers.push(handler);
    return this.index++;
  }

  removeHandler(handler) {
    this.handlers = this.handlers.filter((h) => h.mockId !== handler.mockId);
  }

  /**
   * Flip though the list of handlers to find one that matches and return
   * the response if one is found.
   *
   * @param request request instance/object from request manager
   */
  async handleRequest({ request, params }) {
    for (const handler of this.getHandlers()) {
      if (await handler.matches({ request, params })) {
        return handler.getResponse();
      }
    }
  }
}
