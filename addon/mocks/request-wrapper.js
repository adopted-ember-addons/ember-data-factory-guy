export default class {

  constructor() {
    this.index = 0;
    this.handlers = [];
    return this.generateRequestHandler();
  }

  // add proxy methods to json object
  generateRequestHandler() {
    let requestHandler = this.handleRequest.bind(this),
        methods        = ['num', 'addHandler', 'removeHandler', 'indexes', 'getHandlers'];
    methods.forEach(method => requestHandler[method] = this[method].bind(this));
    return requestHandler;
  }

  num() {
    //    console.log('num this.handlers',this.handlers.map(h=>h.index));
    return this.handlers.length;
  }

  getHandlers() {
    return this.handlers;
  }

  indexes() {
    //    console.log('num this.handlers',this.handlers.map(h=>h.index));
    return this.handlers.map(h => h.mockId);
  }

  addHandler(handler) {
    this.handlers.push(handler);
    return this.index++;
  }

  removeHandler(handler) {
    this.handlers = this.handlers.filter(h => h.mockId !== handler.mockId);
  }

  handleRequest(request) {
//        console.log('handleRequest request', request);
    //    console.log('handleRequest this.handlers', this.handlers);
    let handler = this.handlers.find(handler => handler.matches(request));
//        console.log('handler', handler);
    if (handler) {
      let { status, headers, responseText } = handler.getResponse();
//            console.log('responseText',responseText);
      return [status, headers, responseText]
    }
  }
}