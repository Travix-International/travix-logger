/* global describe, it */
import { expect } from 'chai';

import { configureConsoleTransport, Transport } from '../../src';

describe('Transport :: console', function () {
  it('returns configured Transport class', function () {
    const ConsoleTransport = configureConsoleTransport();
    expect(ConsoleTransport).to.be.a('function');

    const consoleTransport = new ConsoleTransport();
    expect(consoleTransport).to.be.an.instanceof(Transport);

    expect(consoleTransport.name).to.equal('ConsoleTransport');
  });

  it('calls `console.log` on every log', function () {
    const logs = [];
    const fakeConsole = {
      log(...args) {
        logs.push({...args});
      }
    };

    const ConsoleTransport = configureConsoleTransport({
      console: fakeConsole
    });

    const consoleTransport = new ConsoleTransport();
    expect(consoleTransport.name).to.equal('ConsoleTransport');

    consoleTransport.log('Error', 'SomeEvent', 'Error message', { key: 'value' }, () => {});
    expect(logs).to.eql([
      {
        '0': '[Error]',
        '1': 'SomeEvent',
        '2': 'Error message',
        '3': { key: 'value' }
      }
    ]);
  });

  it('calls `console.log` only for certain levels', function () {
    const logs = [];
    const fakeConsole = {
      log(...args) {
        logs.push({...args});
      }
    };
    const ConsoleTransport = configureConsoleTransport({
      name: 'MyCustomConsoleTransport',
      console: fakeConsole,
      levels: ['Information', 'Error'],
      filter(level) {
        return [
          'Information',
          'Error'
        ].indexOf(level) > -1;
      }
    });
    const consoleTransport = new ConsoleTransport();
    expect(consoleTransport.name).to.equal('MyCustomConsoleTransport');

    consoleTransport.log('Error', 'SomeEvent', 'Error message', { key: 'value' }, () => {});
    consoleTransport.log('Warning', 'SomeEvent', 'Warn message', { key: 'value' }, () => {});
    consoleTransport.log('Information', 'SomeEvent', 'Info message', { key: 'value' }, () => {});

    expect(logs).to.eql([
      {
        '0': '[Error]',
        '1': 'SomeEvent',
        '2': 'Error message',
        '3': { key: 'value' }
      },
      {
        '0': '[Information]',
        '1': 'SomeEvent',
        '2': 'Info message',
        '3': { key: 'value' }
      }
    ]);
  });

  it('customize logging string', function () {
    const logs = [];
    const fakeConsole = {
      log(log) {
        logs.push(log);
      }
    };
    const ConsoleTransport = configureConsoleTransport({
      name: 'MyCustomConsoleTransport',
      console: fakeConsole,
      format(level, event, message, meta) {
        return `${level} - ${message} - ${JSON.stringify(meta)}`;    
      }
    });
    const consoleTransport = new ConsoleTransport();
    expect(consoleTransport.name).to.equal('MyCustomConsoleTransport');

    consoleTransport.log('Error', 'SomeEvent', 'Error message', { key: 'value' }, () => {});
    consoleTransport.log('Warning', 'SomeEvent', 'Warn message', { key: 'value' }, () => {});
    consoleTransport.log('Information', 'SomeEvent', 'Info message', { key: 'value' }, () => {});

    expect(logs).to.eql([
      "Error - Error message - {\"key\":\"value\"}",
      "Warning - Warn message - {\"key\":\"value\"}",
      "Information - Info message - {\"key\":\"value\"}"
    ]);
  });
});
