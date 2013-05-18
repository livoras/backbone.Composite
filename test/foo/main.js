(function () {
	// test for `backbone.Composite.nestViews` 

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

	var DogMod = Backbone.Model.extend({
		defaults: {
			test: 'khhhshhh'
		}
	});

	var DogCol = Backbone.Collection.extend({
		url: '/',
		model: DogMod
	});

	var dogCol  = new DogCol;

	dogCol.add(new DogMod({test: 'youllll'}));
	console.log(dogCol.pluck('test'));

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

	var Funny = Backbone.Composite.extend({

		items: {
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

		nests: {
			'body': ['house'],
			'house': ['women', 'cats', 'dogs']
		},

		events: {
			'park dogs': ['cats.run', 'women.rage'],
			'rage women': ['dogs.run', 'houseMessUp']
		},

		initialize: function () {
			this.pushItem('cats', new Cat);
		},

		funny: function () {
			this.getItem('dogs')[0].park();
		},

		houseMessUp: function () {
			console.log('House Mess Up');
		}

	});

	var funny = new Funny;
	var dog = new Dog;

	funny.pushItem('dogs', dog, {
		nest: true
	});

	funny.pushItem('dogs', new Dog, {
		nest: true,
		bind: false
	});

	funny.pushItem('cats', new Cat, {
		listen: false
	});

	dog.park();

})();