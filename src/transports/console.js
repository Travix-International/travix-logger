import createTransport from '../createTransport';

/**
 * Usage:
 *
 * ```js
 * const logger = new Logger(
 *   transports: [
 *     configureConsoleTransport({
 *       console: window.console // optional
 *     })
 *   ]
 * );
 * ```
 */
export default function configureConsoleTransport(options = {}) {
  const filter = (typeof options.filter !== 'undefined')
    ? options.filter
    : () => true;

  const map = (typeof options.map !== 'undefined')
    ? options.map
    : (...args) => args;

  const name = (typeof options.name !== 'undefined')
    ? options.name
    : 'ConsoleTransport';

  const useConsole = (typeof options.console !== 'undefined')
    ? options.console
    : console; // eslint-disable-line

  return createTransport({
    name,

    log(level, event, message, meta, cb) {
      if (!filter(level, event, message, meta)) {
        // skipping
        return cb(null);
      }

      useConsole.log(...map(`[${level}]`, event, message, meta));

      cb(null);
    }
  });
}
