import Transport from './Transport';

export default function createTransport(opts = {}) {
  if (typeof opts.log === 'undefined') {
    throw new Error('Must provide a `log` method.');
  }

  const name = (typeof opts.name !== 'undefined')
    ? opts.name
    : 'Transport';

  class GeneratedTransport extends Transport {
    constructor(options) {
      super(options);

      this.name = name;

      if (typeof opts.initialize !== 'undefined') {
        opts.initialize.bind(this)(options);
      }

      this.log = opts.log.bind(this);
    }
  }

  return GeneratedTransport;
}
