(function () {
	// test for `backbone.CompositeView.itemViews` 
	// test for `backbone.CompositeView.viewsEvents` 

	var $body = $(document.body); 
	$body.append("<div id='wrapper'></div>");

	var Link = Backbone.View.extend({

		tagName: 'a',

		events: {
			'click': 'remove'
		},

		initialize: function () {
			this.render();
		},

		render: function () {
			this.$el.append('This is a link<br/>');
			this.$el.attr('href', '#');
		},

		remove: function () {
			alert('Link is clicked');
			this.$el.remove();
			this.trigger('remove');
		},

		sad: function () {
			console.log('One of our sibling is killed....');
		}


	});

	var LinkWrapper = Backbone.View.extend({

		tagName: 'div',

		className: 'box',

		initialize: function () {
			this.$el.append('<div id="fuck"></div>');
		},

		say: function () {
			alert('LinkWrapper says: I say~!');
		}

	}); 

	var LinkComposite = Backbone.CompositeView.extend({

		initialize: function () {},

		itemViews: {

			'wrapper1': function() {
				 return new LinkWrapper;
			},

			'wrapper2': function () { 
				return new LinkWrapper;
			},

			'links1': function () {
				return [new Link, new Link];
			},

			'links2': function () {
				return [new Link, new Link, new Link];
			}

		},

		nestViews: {

			'wrapper1 div#fuck': function () {
				return ['links1', '<a href="#">jQuery Selector Test</a>', $('<a href="#">22</a>')];
			},

			'wrapper2': function () {
				return ['links2'];
			},

			'body #wrapper': function () {
				return ['wrapper1', 'wrapper2'];
			}
		},

		viewsEvents: {
			'remove links1': ['yell', 'wrapper1.say', 'links1.sad'],
			'remove links2': function () {
				return ['yell', 'wrapper2.say', 'links2.sad'];
			}
		},

		yell: function () {
			alert('Something was deleted from wrapper');
		}


	});

	var Button = Backbone.View.extend({
		tagName: 'button',

		initialize: function () {
			this.render();
		},

		render: function () {
			this.$el.append('button');
			$('#wrapper').append(this.$el);
		},

		remove: function () {
			this.$el.remove();
		}
	});

	var App = Backbone.CompositeView.extend({

		itemViews: {
			'lc': function () {
				return new LinkComposite;
			},
			'buttons': function () {
				return [new Button, new Button, new Button];
			}
		},

		nestViews: {},

		viewsEvents: {
			// Multiple triggerr multiple
			// any view of lc.links2 trigger one 'remove' event 
			// will invoke all buttons' remove method
			'remove lc.links2': ['getMessage', 'buttons.remove']
		},

		getMessage: function () {
			console.log('App get message');
		}

	});

	new App();
	var app = new App();
	app.setSubView('lc2', new LinkComposite);
	console.log(app.getSubView('lc2'));
	app.delSubView('lc2');
	console.log(app.getSubView('lc2'));
})();