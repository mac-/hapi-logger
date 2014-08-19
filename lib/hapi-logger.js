var bunyan = require('bunyan'),
	Hoek = require('hoek'),
	_ = require('underscore'),
	reqSerializer = function(req) {
		var obj = {
			id: req.id,
			headers: req.headers,
			method: req.method,
			info: req.info,
			path: req.path
		};
		return obj;
	},
	defaults = {
		name: 'hapi-logger',
		src: false,
		tags: ['*'],
		transport: 'console',
		logFilePath: 'hapi-logger.log'
	};


module.exports.register = function (plugin, options, next) {

	var settings = Hoek.applyToDefaults(defaults, options || {}),
		stream = (settings.transport === 'file') ? { path: settings.logFilePath } : { stream: process.stdout },
		bunyanConfig = {
			name: settings.name,
			serializers: {
				req: reqSerializer
			},
			src: settings.src,
			streams: [stream]
		},
		captureAll = (settings.tags.indexOf('*') >= 0),
		logger = bunyan.createLogger(bunyanConfig);


	plugin.events.on('log', function(event) {
		if (!captureAll && _.intersection(event.tags, settings.tags).length <= 0) {
			return;
		}
		var msg = 'Hapi Server Log',
			data = {
				tags: event.tags
			};

		if (typeof(event.data) === 'string') {
			msg = event.data;
		}
		if (event.request) {
			data.requestId = event.request;
		}
		if (event.server) {
			data.serverUri = event.server;
		}

		logger.info(data, msg);
	});

	plugin.events.on('request', function(request, event) {
		if (!captureAll && _.intersection(event.tags, settings.tags).length <= 0) {
			return;
		}
		var msg = 'Hapi Server Request Log',
			data = {
				tags: event.tags,
				req: request
			};
		logger.info(data, msg);
	});

	plugin.events.on('internalError', function(request, error) {
		if (!captureAll && settings.tags.indexOf('internal') < 0 && settings.tags.indexOf('error') < 0) {
			return;
		}
		var msg = error.message,
			data = {
				tags: ['internal', 'error'],
				req: request,
				stack: error.stack
			};
		logger.info(data, msg);
	});

	next();
};

module.exports.register.attributes = {
	pkg: require('../package.json')
};