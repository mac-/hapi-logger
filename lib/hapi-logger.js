var bunyan = require('bunyan'),
	Hoek = require('hoek'),
	_ = require('underscore'),
	reqSerializer = function(req) {
		var obj = {
			id: req.id,
			headers: req.headers,
			method: req.method,
			info: req.info,
			path: req.path,
			params: req.params,
			query: req.query
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


module.exports.register = function (server, options, next) {

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
		logger = bunyan.createLogger(bunyanConfig),
		getMsgFromEvent = function(event) {
			var msg;
			if (typeof(event.data) === 'string') {
				msg = event.data;
			}
			else if (typeof(event.data) === 'object' && event.data.message) {
				msg = event.data.message;
				delete event.data.message;
			}
			return msg;
		},
		getDataFromEvent = function(event) {
			var data = (typeof(event.data) === 'object') ? data = event.data : {};
			data.tags = event.tags;
			if (event.request) {
				data.requestId = event.request;
			}
			if (event.server) {
				data.serverUri = event.server;
			}
			return data;
		};


	server.on('log', function(event) {
		if (!captureAll && _.intersection(event.tags, settings.tags).length <= 0) {
			return;
		}
		var msg = getMsgFromEvent(event) || 'Hapi Server Log',
			data = getDataFromEvent(event);

		logger.info(data, msg);
	});

	server.on('request', function(request, event) {
		if (!captureAll && _.intersection(event.tags, settings.tags).length <= 0) {
			return;
		}
		var msg = getMsgFromEvent(event) || 'Hapi Server Request Log',
			data = getDataFromEvent(event);

		data.req = request;
		logger.info(data, msg);
	});

	server.on('request-error', function(request, error) {
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