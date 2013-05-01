(function () {
	// test for `backbone.CompositeView.nestViews` 

	var $body = $(document.body); 

	var Foo = Backbone.CompositeView.extend({
		itemViews: {
			'link': function () {
				$body.append('link');
			}
		},
		initialize: function () {
			$body.append($('<div>foo</div>'));
		}
	});

	var Foo2 = Backbone.CompositeView.extend({
		itemViews: {
			'foo': function () { 
				return new Foo;
			},
			'foo2': function () { 
				return new Foo;
			}
		},
		time: new Date(),
		initialize: function () {
			console.log(this.time);
		}
	});

	new Foo2;
	new Foo2;

})();