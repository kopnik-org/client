export class KopnikError extends Error {
  /**
   * @param  {string} message
   * @param  {Error?} base
   * @param  {Number} code
   * 1-Under construction
   * 2 No message provided (in locale messages)
   */
  constructor(message, code, base) {
    super(message)
    this.code = code
    this.base = base
    this.preventDefault= false
  }
}

export class KopnikApiError extends KopnikError {
  constructor(message, code, url, trace, base) {
    super(message, code, base)
    this.url = url
    this.trace = trace
  }
}
