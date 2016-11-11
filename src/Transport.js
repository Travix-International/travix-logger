export default class Transport {
  constructor(opts = {}) {
    this.options = {
      ...opts
    };

    this.logger = this.options.logger;
  }

  log(level, message, meta, cb) { }
}
