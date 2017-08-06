var assert = require('assert'),
	utils = require('../../lib/utils.js'),
	Hapi = require('hapi'),
	Boom = require('boom');


describe('utils tests', function() {
	describe('hasMatchingTag()', function () {

		it('should return true when at least one tag matches', function() {
			var result = utils.hasMatchingTag('title', ['title', 'description']);
			assert.strictEqual(result, true);
		});

		it('should return false when no tags match', function() {
			var result = utils.hasMatchingTag('title', ['label', 'description']);
			assert.strictEqual(result, false);
		});

		it('should return true when a negated tag has no matches', function() {
			var result = utils.hasMatchingTag('!title', ['label', 'description']);
			assert.strictEqual(result, true);
		});

		it('should return false when a negated tag has a match', function() {
			var result = utils.hasMatchingTag('!title', ['title', 'description']);
			assert.strictEqual(result, false);
		});
	});

	describe('containsTags()', function () {

		it('should return true when any of the desired tags is *', function() {
			var result = utils.containsTags(['*', 'label'], ['title', 'description']);
			assert.strictEqual(result, true);
		});

		describe('when desired tags contains only OR\'d tags', function() {

			it('should return true when any of the desired tags match any of the event tags', function() {
				var result = utils.containsTags(['title', 'label'], ['title', 'description']);
				assert.strictEqual(result, true);
			});

			it('should return false when none of the desired tags match any of the event tags', function() {
				var result = utils.containsTags(['heading', 'label'], ['title', 'description']);
				assert.strictEqual(result, false);
			});

			describe('when it includes negated tags', function() {

				it('should return true when any of the desired tags match any of the event tags', function() {
					var result = utils.containsTags(['!label'], ['title', 'description']);
					assert.strictEqual(result, true);
				});

				it('should return false when none of the desired tags match any of the event tags', function() {
					var result = utils.containsTags(['!label'], ['label', 'description']);
					assert.strictEqual(result, false);
				});
			});
		});

		describe('when desired tags contains only AND\'d tags', function() {

			it('should return true when all of the desired tags within an array match any of the event tags', function() {
				var result = utils.containsTags([['title', 'description']], ['title', 'description', 'label']);
				assert.strictEqual(result, true);
			});

			it('should return false when all of the desired tags within an array do not match any of the event tags', function() {
				var result = utils.containsTags([['title', 'description']], ['label', 'description']);
				assert.strictEqual(result, false);
			});

			describe('when it includes negated tags', function() {

				it('should return true when all of the desired tags within an array match any of the event tags', function() {
					var result = utils.containsTags([['!title', 'description']], ['description', 'label']);
					assert.strictEqual(result, true);
				});

				it('should return false when all of the desired tags within an array do not match any of the event tags', function() {
					var result = utils.containsTags([['!title', 'description']], ['title', 'description']);
					assert.strictEqual(result, false);
				});
			});
		});

		describe('when desired tags contains OR\'d tags and AND\'d tags', function() {

			it('should return true when all of the desired tags within an array match any of the event tags', function() {
				var result = utils.containsTags(['label', ['error', 'description']], ['title', 'description', 'label']);
				assert.strictEqual(result, true);
				result = utils.containsTags(['error', ['title', 'description']], ['title', 'description', 'label']);
				assert.strictEqual(result, true);
			});

			it('should return false when all of the desired tags within an array do not match any of the event tags', function() {
				var result = utils.containsTags(['error', ['title', 'description']], ['label', 'description']);
				assert.strictEqual(result, false);
			});

			describe('when it includes negated tags', function() {

				it('should return true when all of the desired tags within an array match any of the event tags', function() {
					var result = utils.containsTags(['label', ['title', '!description']], ['description', 'label']);
					assert.strictEqual(result, true);
					result = utils.containsTags(['!label', ['title', 'description']], ['error', 'title']);
					assert.strictEqual(result, true);
					result = utils.containsTags(['!label', ['!title', 'description']], ['label', 'description']);
					assert.strictEqual(result, true);
				});

				it('should return false when all of the desired tags within an array do not match any of the event tags', function() {
					var result = utils.containsTags(['label', ['!title', 'description']], ['title', 'description']);
					assert.strictEqual(result, false);
					result = utils.containsTags(['!label', ['title', 'description']], ['label', 'title']);
					assert.strictEqual(result, false);
					result = utils.containsTags(['!label', ['!title', 'description']], ['label', 'title', 'description']);
					assert.strictEqual(result, false);
				});
			});
		});
	});
});