/**
 * This request wrapper controls what will be returned by one url / http verb.
 * Holds a list of handlers for a given url/verb pair so multiple mocks (e.g.
 * mockFindAll and mockQuery) can share the same route.
 */
export default class RequestWrapper {
  constructor() {
    this.index = 0;
    this.handlers = [];
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
