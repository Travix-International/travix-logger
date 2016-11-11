/* global describe, it */
import { expect } from 'chai';

import { createTransport } from '../src';

describe('createTransport', function () {
  it('creates Transport class', function () {
    const TestTransport = createTransport({
      log(level, message, meta, cb) {
        cb(null);
      }
    });

    expect(TestTransport).to.be.a('function');
  });

  it('must implement a `log` method', function () {
    expect(() => {
      return createTransport({});
    }).to.throw(/Must provide a `log` method/);

    expect(() => {
      return createTransport({
        log(level, message, meta, cb) {
          cb(null);
        }
      });
    }).to.not.throw();
  });

  it('gives the generated class a name, statically and at instance level', function () {
    const TestTransport = createTransport({
      name: 'TestTransportNameHere',

      initialize() { },

      log(level, message, meta, cb) {
        cb(null);
      }
    });

    expect(TestTransport.name).to.equal('TestTransportNameHere');

    const testTransport = new TestTransport({
      logger: true
    });
    expect(testTransport.name).to.equal('TestTransportNameHere');
  });
});
