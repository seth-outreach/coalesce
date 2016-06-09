import 'whatwg-fetch';

/**
 * Middleware to perform the request
 */
export default class FetchMiddleware {

  static singleton = true;

  async call({url, method, body, headers}, next) {
    return fetch(url, {method, body, headers});
  }

}
