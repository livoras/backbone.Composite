(function () {
	// test for `backbone.CompositeView.nestViews` 

	var Dog = Backbone.View.extend({

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
		run: function () {
			// do stuff
			console.log('Cat run...');
			this.trigger('run');
		}
	});

	var People = Backbone.View.extend({
		rage: function () {
			// do stuff
			console.log('People rage');
			this.trigger('rage');
		}
	});

	var House = Backbone.CompositeView.extend({

		itemViews: {
			'women': function () {
				return new People;
			},

			'cats': function () {
				return [new Cat, new Cat, new Cat];
			},

			'dogs': function () {
				return [new Dog, new Dog];
			}
		},

		viewsEvents: {
			'park dogs': ['cats.run', 'women.rage'],
			'rage women': ['dogs.run', 'houseMessUp']
		},

		initialize: function () {
			this.getSubView('dogs')[0].park();
		},

		houseMessUp: function () {
			console.log('House Mess Up');
		}

	});

	new House;

})();