/* global describe, it */
import { expect } from 'chai';
import nock from 'nock';

import { configureHttpTransport, Transport } from '../../src';

describe('Transport :: http', function () {
  it('returns configured Transport class', function () {
    const HttpTransport = configureHttpTransport({
      url: 'http://example.com/'
    });
    expect(HttpTransport).to.be.a('function');
    expect(HttpTransport.name).to.equal('HttpTransport');

    const httpTransport = new HttpTransport();
    expect(httpTransport).to.be.an.instanceof(Transport);
  });

  it('throws error if no `url` is given', function () {
    expect(() => {
      configureHttpTransport({});
    }).to.throw(/Must provide `url`/);
  });

  it('throws error if a method is provided, that does not accept body', function () {
    expect(() => {
      configureHttpTransport({
        url: 'http://example.com',
        method: 'GET'
      });
    }).to.throw(/Method does not accept `body`/);
  });

  it('sends data over HTTP on every log', function (done) {
    const HttpTransport = configureHttpTransport({
      url: 'http://logs.example.com/submit',
      method: 'POST',
      eventKey: 'event'
    });
    const httpTransport = new HttpTransport({ logger: true });
    expect(httpTransport.name).to.equal('HttpTransport');

    nock('http://logs.example.com')
      .post('/submit', {
        level: 'Information',
        event: 'SomeEvent',
        message: 'Info message',
        key: 'value'
      })
      .reply(201, function (uri, requestBody) {
        return {
          ok: true,
          requestBody
        };
      });

    httpTransport.log(
      'Information',
      'SomeEvent',
      'Info message',
      { key: 'value' },
      function (err, response) {
        if (err) {
          return done(err);
        }

        response.json().then((body) => {
          expect(body).to.eql({
            ok: true,
            requestBody: {
              level: 'Information',
              event: 'SomeEvent',
              message: 'Info message',
              key: 'value'
            }
          });

          done();
        });
      }
    );
  });

  it('sends data over HTTP only for certain logs', function (done) {
    const HttpTransport = configureHttpTransport({
      url: 'http://logs.example.com/submit',
      method: 'POST',
      eventKey: 'event',
      filter(level) {
        return [
          'Information',
          'Error'
        ].indexOf(level) > -1;
      }
    });
    const httpTransport = new HttpTransport({ logger: true });
    expect(httpTransport.name).to.equal('HttpTransport');

    nock('http://logs.example.com')
      .post('/submit', {
        level: 'Information',
        event: 'SomeEvent',
        message: 'Info message',
        key: 'value'
      })
      .reply(201, function (uri, requestBody) {
        return {
          ok: true,
          requestBody
        };
      });

    httpTransport.log(
      'Debug',
      'SomeEvent',
      'Debug message...',
      { key: 'value' },
      function (err, response) {
        expect(err).to.equal(null);
        expect(response).to.be.an('undefined');
      }
    );

    httpTransport.log(
      'Information',
      'SomeEvent',
      'Info message',
      { key: 'value' },
      function (err, response) {
        if (err) {
          return done(err);
        }

        response.json().then((body) => {
          expect(body).to.eql({
            ok: true,
            requestBody: {
              level: 'Information',
              event: 'SomeEvent',
              message: 'Info message',
              key: 'value'
            }
          });

          done();
        });
      }
    );
  });

  it('sends data over HTTP, with formatted body', function (done) {
    const HttpTransport = configureHttpTransport({
      name: 'MyCustomHttpTransport',
      url: 'http://logs.example.com/submit',
      method: 'POST',
      formatBody(level, event, message, meta) {
        return JSON.stringify({
          Level: level,
          Event: event,
          Message: message,
          Meta: meta,
          someNewKey: 'someNewValue'
        });
      }
    });
    const httpTransport = new HttpTransport({ logger: true });
    expect(httpTransport.name).to.equal('MyCustomHttpTransport');

    nock('http://logs.example.com')
      .post('/submit', {
        Level: 'Information',
        Event: 'SomeEvent',
        Message: 'Info message',
        Meta: {
          key: 'value'
        },
        someNewKey: 'someNewValue'
      })
      .reply(201, function (uri, requestBody) {
        return {
          ok: true,
          requestBody
        };
      });

    httpTransport.log(
      'Information',
      'SomeEvent',
      'Info message',
      { key: 'value' },
      function (err, response) {
        if (err) {
          return done(err);
        }

        response.json().then((body) => {
          expect(body).to.eql({
            ok: true,
            requestBody: {
              Level: 'Information',
              Event: 'SomeEvent',
              Message: 'Info message',
              Meta: {
                key: 'value'
              },
              someNewKey: 'someNewValue'
            }
          });

          done();
        });
      }
    );
  });
});
