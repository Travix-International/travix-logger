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

  it('don`t log certain params filtered by log', function () {
    const logs = [];
    const fakeConsole = {
      log(...args) {
        logs.push({...args});
      }
    };
    const ConsoleTransport = configureConsoleTransport({
      name: 'MyCustomConsoleTransport',
      console: fakeConsole,
      map(level, event, message, meta) {
        return [level, message, meta]        
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
        '1': 'Error message',
        '2': { key: 'value' }
      },
      {
        '0': '[Warning]',
        '1': 'Warn message',
        '2': { key: 'value' }
      },
      {
        '0': '[Information]',
        '1': 'Info message',
        '2': { key: 'value' }
      }
    ]);
  });
});
