(function () {

	var ChatItem = Backbone.View.extend({

		tagName: 'li',

		events: {
			'click': 'beClick'
		},

		initialize: function () {
			this.render();
		},

		render: function () {
			this.$el.html(this.model.get('content'));
		},

		beClick: function () {
			this.trigger('beClick');
		}

	});

	var ChatWrapper = Backbone.View.extend({
		tagName: 'div',
		initialize: function () {
			this.$el.append('<ul class="chats"></ul>');
		}
	});


	var ChatModel = Backbone.Model.extend({
		idAttribute: "_id",
		defaults: {
			content: 'fuck'
		}
	});


	var ChatCollection = Backbone.Collection.extend({
		model: ChatModel, 
		appendChat: function (model) {
			this.push(model);
			this.trigger('chatAppend', model);
		},
		prependChat: function (model) {
			this.unshift(model);
			this.trigger('chatPrepend', model);
		}
	});


	var ChatComposite = Backbone.Composite.extend({

		items: {
			'wrapper': function () {
				return new ChatWrapper;
			}, 

			'items':  [],

			'chatCollection': new ChatCollection
		},

		nests: {
			'body': ['wrapper'],
			'wrapper ul.chats': ['items']
		},

		events: {
			'beClick items': ['liClick'],
			'chatAppend chatCollection': ['appendView'],
			'chatPrepend chatCollection': ['prependView'],
			'remove chatCollection': ['removeView']
		},

		exportAPI: {
			'chatCollection': ['appendChat', 'prependChat']
		},

		exportEvent: {
			'chatCollection': ['chatAppend', 'chatPrepend']
		},

		initialize: function () {
		},

		liClick: function () {
			console.log('fuck');
		},

		appendView: function (model) {
			this.pushItem('items', new ChatItem({
				model: model
			}));
		},

		prependView: function (model) {
			this.pushItem('items', new ChatItem({
				model: model
			}), {prepend: true});
		},

		removeView: function (model) {}

	});


	var chatComposite = new ChatComposite({
		_id: 'fuck'
	});

	chatComposite.on('chatAppend', function (model) {
		console.log(model);
	});

	chatComposite.appendChat(new ChatModel({
		content: 'fuck you shit'
	}));

	chatComposite.prependChat(new ChatModel({
		content: 'fuck you' + +new Date
	}));

var Box = Backbone.View.extend({
    name: 'Hi',
    sayName: function () {
        this.trigger('nameSay', this.name);
    }
});

var BoxWrapper = Backbone.Composite.extend({
    items: {
        'box': function () {
            return new Box;
        }
    },
    exportEvent: {
        'box': ['nameSay']
    }
});

var boxWrapper = new BoxWrapper;
boxWrapper.on('nameSay', function (name) {
    console.log('I have got ' + name + ' said');
});
boxWrapper.getItem('box').sayName(); // => I have got Hi said

})();