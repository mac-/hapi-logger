var bunyan = require('bunyan'),
	Hoek = require('hoek'),
	_ = require('lodash'),
	containsTags = require('./utils.js').containsTags,
	noop = function() {},
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
		tags: ['*'],
		ignoredTags: [],
		shouldLog: null,
		bunyan: {
			name: 'hapi-logger',
			serializers: {
				req: reqSerializer
			},
			src: false,
			level: 'debug'
		}
	};


module.exports.register = function (server, options, next) {

	var settings = Hoek.applyToDefaults(defaults, options || {}),
		logger = bunyan.createLogger(settings.bunyan),
		shouldLog = _.isFunction(settings.shouldLog) ? settings.shouldLog : noop,
		getMsgFromEvent = function(event) {
			var msg;
			if (_.isString(event.data)) {
				msg = event.data;
			}
			else if (_.isObject(event.data) && event.data.message) {
				msg = event.data.message;
				delete event.data.message;
			}
			return msg;
		},
		getDataFromEvent = function(event) {
			var data = _.isObject(event.data) ? event.data : {};
			data.tags = event.tags;
			if (event.request) {
				data.requestId = event.request;
			}
			if (event.server) {
				data.serverUri = event.server;
			}
			return data;
		},
		cacheKeyResolver = function(eventTags) {
			return _.sortBy(eventTags).join(',');
		},
		containsIncludedTags = _.memoize(containsTags.bind(null, settings.tags), cacheKeyResolver),
		containsIgnoredTags = _.memoize(containsTags.bind(null, settings.ignoredTags), cacheKeyResolver);


	server.on('log', function(event) {
		if (containsIgnoredTags(event.tags) || !containsIncludedTags(event.tags)) {
			return;
		}
		var msg = getMsgFromEvent(event) || 'Hapi Server Log',
			data = getDataFromEvent(event);
		if (!shouldLog(data)) {
			return;
		}
		logger.info(data, msg);
	});

	server.on('request', function(request, event) {
		if (containsIgnoredTags(event.tags) || !containsIncludedTags(event.tags)) {
			return;
		}
		var msg = getMsgFromEvent(event) || 'Hapi Server Request Log',
			data = getDataFromEvent(event);
		if (!shouldLog(data)) {
			return;
		}
		data.req = request;
		logger.info(data, msg);
	});

	server.on('request-internal', function(request, event) {
		if (containsIgnoredTags(event.tags) || !containsIncludedTags(event.tags)) {
			return;
		}
		var msg = getMsgFromEvent(event) || 'Hapi Server Request Internal Log',
			data = getDataFromEvent(event);
		if (!shouldLog(data)) {
			return;
		}
		data.req = request;
		logger.info(data, msg);
	});

	server.on('request-error', function(request, error) {
		if (containsIgnoredTags(['internal', 'error']) || !containsIncludedTags(['internal', 'error'])) {
			return;
		}
		var msg = error.message,
			data = {
				tags: ['internal', 'error'],
				req: request,
				stack: error.stack
			};
		if (!shouldLog(data)) {
			return;
		}
		logger.info(data, msg);
	});

	server.expose('logger', logger);

	next();
};

module.exports.register.attributes = {
	pkg: require('../package.json')
};