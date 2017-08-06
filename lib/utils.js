var _ = require('lodash');

function hasMatchingTag (desiredTag, eventTags) {
	if (desiredTag.indexOf('!') >= 0) {
		return eventTags.indexOf(desiredTag.substr(1)) < 0;
	}
	else {
		return eventTags.indexOf(desiredTag) >= 0;
	}
}

function containsTags (desiredTags, eventTags) {
	if (desiredTags.indexOf('*') >= 0) {
		return true;
	}
	return desiredTags.some(function (tag) {
		if (_.isString(tag)) {
			return hasMatchingTag(tag, eventTags);
		}
		else if (_.isArray(tag)) {
			var hasTags = tag.every(function (t) {
				return hasMatchingTag(t, eventTags);
			});
			return hasTags;
		}
		return false;
	});
}

module.exports = {
	hasMatchingTag: hasMatchingTag,
	containsTags: containsTags
};