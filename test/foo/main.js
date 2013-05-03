(function () {
	// test for `backbone.CompositeView.nestViews` 

	var Dog = Backbone.View.extend({
		className: 'dog',

		park: function () {
			// do stuff
			console.log('Dog park');
			this.trigger('park');
		},

		run: function () {
			// do stuff
			console.log('Dog run');
			this.trigger('run');
		}
	});

	var Cat = Backbone.View.extend({
		className: 'cat',

		run: function () {
			// do stuff
			console.log('Cat run...');
			this.trigger('run');
		}
	});

	var People = Backbone.View.extend({
		className: 'people',

		rage: function () {
			// do stuff
			console.log('People rage');
			this.trigger('rage');
		}
	});

	var House = Backbone.View.extend({
		tagName: 'div',
		className: 'house'
	});

	var Funny = Backbone.CompositeView.extend({

		itemViews: {
			'women': function () {
				return new People;
			},

			'cats': function () {
				return [new Cat, new Cat, new Cat];
			},

			'dogs': function () {
				return [new Dog, new Dog];
			},

			'house': function () {
				return new House;
			}
		},

		nestViews: {
			'body': ['house'],
			'house': ['women', 'cats', 'dogs']
		},

		viewsEvents: {
			'park dogs': ['cats.run', 'women.rage'],
			'rage women': ['dogs.run', 'houseMessUp']
		},

		initialize: function () {
			this.appendSubView('cats', new Cat);
		},

		funny: function () {
			this.getSubView('dogs')[0].park();
		},

		houseMessUp: function () {
			console.log('House Mess Up');
		}

	});

	var funny = new Funny;
	var dog = new Dog;

	funny.appendSubView('dogs', dog, {
		nest: true
	});

	funny.appendSubView('dogs', new Dog, {
		nest: true,
		bind: false
	});

	funny.appendSubView('cats', new Cat, {
		listen: false
	});

	dog.park();

})();