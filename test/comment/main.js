(function () {
	// test for `backbone.CompositeView.viewsEvents` 

	var $body = $(document.body); 

	var Button = Backbone.View.extend({

		tagName: 'button',

		events: {
			'click':  'click',
		},

		initialize: function () {

		},

		click: function () {
			this.trigger('click');
		}

	});

	var Comment = Backbone.View.extend({

		tagName: 'div',

		initialize: function () {
			this.render();
		},

		render: function () {
			this.$el.append('fuck');
		},

		remove: function () {
			this.$el.remove();
			this.trigger('remove');
		}

	});

	var CommentWrapper = Backbone.CompositeView.extend({

		itemViews: {
			'comment': function () {
				return new Comment;
			},
			'button': function () {
				return new Button;
			}
		},

		viewsEvents: {

			// * listen subview button's click event 
			// => use string
			'click button': ['removeComment'],

			// * listen subview comment's remove event 
			// => use function
			'remove comment': [function () {
				alert('CommentWrapper says: Someone is deleted');
			}]
		},

		nestViews: {
			'comment': ['button'],
			'body': ['comment'],
		},

		removeComment: function () {
			this.getSubView('comment').remove();
		}

	});

	var App = Backbone.CompositeView.extend({

		itemViews: {
			'wrapper': new CommentWrapper,
			'wrapper2': new CommentWrapper
		},

		viewsEvents: {
			// * listen subview(wrapper)'s subview(comment)'s remove event 
			// => subview's subview
			'remove wrapper.comment': ['say']
		},

		say: function () {
			alert('App says: Someone is deleted');
		}

	}); 
	
	new App();
})();