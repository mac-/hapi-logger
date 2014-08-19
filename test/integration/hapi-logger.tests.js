var assert = require('assert'),
	plugin = require('../../lib/hapi-logger.js'),
	Hapi = require('hapi');

before(function(done) {
	server = new Hapi.Server('localhost', '8085', { cors: true } );
	server.pack.register({
		plugin: plugin,
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
		server.route({ method: 'GET', path: '/test/{param}', handler: function(request, reply) { reply(Hapi.error.internal('whoops')); } });

		done(err);
	});
});



describe('hapi-logger plugin tests', function() {

	it('should log a message from request.log', function(done) {

		server.inject('/', function (res) {
			assert(res.statusCode == 200);
			done();
		});
	});

	it('should log an message when 500 is returned', function(done) {

		server.inject('/test/1234', function (res) {
			assert(res.statusCode == 500);
			done();
		});
	});

});
