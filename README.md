# hapi-logger

[![Build Status](https://secure.travis-ci.org/mac-/hapi-logger.png)](http://travis-ci.org/mac-/hapi-logger)
[![Coverage Status](https://coveralls.io/repos/mac-/hapi-logger/badge.png)](https://coveralls.io/r/mac-/hapi-logger)
[![Code Climate](https://codeclimate.com/github/mac-/hapi-logger.png)](https://codeclimate.com/github/mac-/hapi-logger)
[![NPM version](https://badge.fury.io/js/hapi-logger.png)](http://badge.fury.io/js/hapi-logger)
[![Dependency Status](https://david-dm.org/mac-/hapi-logger.png)](https://david-dm.org/mac-/hapi-logger)

[![NPM](https://nodei.co/npm/hapi-logger.png?downloads=true&stars=true)](https://nodei.co/npm/hapi-logger/)

> A Hapi plugin for writing logs via bunyan

Bunyan is a great module for logging, but I like the flexibility that having tagged log messages gives me over your traditional log levels. Luckily Hapi already emits log events with tags, so we can add those tags to our log message. The current implementation of this module logs every message as "info" as far as bunyan is concerned, so you might as well ignore the "level" property on the log message. However, all the tags are included on the message, which should give enough context about the message.

## Contributing

This module makes use of a `Makefile` for building/testing purposes. After obtaining a copy of the repo, run the following commands to make sure everything is in working condition before you start your work:

	make install
	make test

Before committing a change to your fork/branch, run the following commands to make sure nothing is broken:

	make test
	make test-cov

Don't forget to bump the version in the `package.json` using the [semver](http://semver.org/spec/v2.0.0.html) spec as a guide for which part to bump. Submit a pull request when your work is complete.

***Notes:***
* Please do your best to ensure the code coverage does not drop. If new unit tests are required to maintain the same level of coverage, please include those in your pull request.
* Please follow the same coding/formatting practices that have been established in the module.

## Installation

	npm install hapi-logger

## Usage

To install this plugin on your Hapi server, do something similar to this:

```js
var Hapi = require('hapi');
var server = new Hapi.Server();

var hapiLoggerConfig = {};

server.register({ register: require('hapi-logger'), options: hapiLoggerConfig }, function(err) {
	if (err) {
		console.log('error', 'Failed loading plugin: hapi-logger');
	}
});
```

## Plugin Options

### `name`

The name of your application, or any other name you wish to have contained within your log message, for this pack of servers. Defaults to `'hapi-logger'`

### `src`

A flag that tells bunyan whether or not to include the location from where the log message originiated. Don't set this to `true` in production! Defaults to `false`

### `tags`

A collection of tags to filter log messages by. If the collection includes `'*'` then all messages will be logged. Defaults to `['*']`

### `transport`

The way that log messages are written. Valid choices are `'file'` and `'console'`. Defaults to `'console'`

### `logFilePath`

If a `file` transport was specified, this tells bunyan the location of the file to write the logs to. Defaults to `'hapi-logger.log'`


## Example

A Hapi route configured like this:

```js
server.route({
	method: 'GET',
	path: '/test/{param}',
	handler: function(request, reply) {
		request.log(['get', 'testResource'], 'Some important info...');
		reply('Success!');
	}
});
```

would cause the following log message to be written (in addition to any other internal Hapi-related events) when a request is issued to the route:

```
{"name":"hapi-logger","hostname":"Me","pid":54705,"level":30,"tags":["get","testResource"],"req":{"id":"1408481983531-54705-47711","headers":{"user-agent":"curl/7.24.0 (x86_64-apple-darwin12.0) libcurl/7.24.0 OpenSSL/0.9.8x zlib/1.2.5","host":"localhost:8080","accept":"*/*"},"method":"get","info":{"received":1408481983531,"remoteAddress":"127.0.0.1","remotePort":63014,"referrer":"","host":"localhost:8080"},"path":"/test/1234"},"msg":"Some important info...","time":"2014-08-19T20:59:43.542Z","v":0}
```
In addition to user-initiated request log events, this module will also listen for server `log` events, `request` events, and `internalError` events, and log those if not filtered by the configured tags.

To provide a little more context about a log message, you can log messages like so:

```js
server.log(['mytag'], { message: 'My log message', other: 'Some other data' });
```

By passing an object as the second paramter, you can pass along context with your message. If no message is detected a default message will be used. Here are the default messages for the corresponding Hapi events:

* `log`: "Hapi Server Log"
* `request`: "Hapi Server Request Log"

If an `internalError` event is received, then the log message will be the error message.


## Version Compatibility

### Currently compatible with: Hapi 11.x.x

* 0.1.x - Hapi 6.x.x
* 0.2.x - Hapi 7.x.x
* 0.3.x - Hapi 8.x.x
* 0.4.x - Hapi 11.x.x

# License

The MIT License (MIT)