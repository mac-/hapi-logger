var assert = require('assert'),
	plugin = require('../../lib/hapi-logger.js'),
	Hapi = require('hapi'),
	Boom = require('boom');


describe('hapi-logger plugin tests', function() {

	before(function(done) {
		server = new Hapi.Server({connections: {router: {isCaseSensitive: false}, routes: {cors: true}}, debug: false}); //debug: false to keep hapi debug info from clogging test output.
		server.connection({host: 'localhost', port: 8085});
		server.register({
			register: plugin,
			options: { }
		}, function (err) {
			var get = function (request, reply) {
				request.log('fnord', {message: 'This is a message'});
				reply('Success!');
			};

			// various ways of calling the log func
			server.log([], 'plugin loaded successfully 1');
			server.log('server', 'plugin loaded successfully 2');
			server.log(['server'], 'plugin loaded successfully 3');
			server.log(['server'], { message: 'plugin loaded successfully 4', context: 'some other data' });

			server.route({ method: 'GET', path: '/', handler: get });
			server.route({ method: 'GET', path: '/test/{param}', handler: function(request, reply) { reply(Boom.badImplementation('whoops')); } });

			done(err);
		});
	});

	it('should log a message from request.log', function(done) {

		server.inject('/', function (res) {
			assert(res.statusCode == 200);
			done();
		});
	});

	it('should log a message when 500 is returned', function(done) {

		server.inject('/test/1234', function (res) {
			assert(res.statusCode == 500);
			done();
		});
	});
});

describe('hapi-logger plugin tests without default tags', function() {

	before(function(done) {
		server = new Hapi.Server({connections: {router: {isCaseSensitive: false}, routes: {cors: true}}, debug: false}); //debug: false to keep hapi debug info from clogging test output.
		server.connection({host: 'localhost', port: 8085});
		server.register({
			register: plugin,
			options: { tags: ['somethingElse'] }
		}, function (err) {
			var get = function (request, reply) {
				request.log('fnord', {message: 'This is a message'});
				reply('Success!');
			};

			server.route({ method: 'GET', path: '/', handler: get });
			server.route({ method: 'GET', path: '/test/{param}', handler: function(request, reply) { reply(Boom.badImplementation('whoops')); } });

			done(err);
		});
	});

	it('should not log a message from request.log', function(done) {

		server.inject('/', function (res) {
			assert(res.statusCode == 200);
			done();
		});
	});

	it('should not log a message when 500 is returned', function(done) {

		server.inject('/test/1234', function (res) {
			assert(res.statusCode == 500);
			done();
		});
	});
});
