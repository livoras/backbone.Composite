(function () {
	// test for `backbone.CompositeView.nestViews` 

	var $body = $(document.body); 


	var BigBox = Backbone.View.extend({

		className: 'box large-box'

	}); 


	var SmallBox = Backbone.View.extend({

		className: 'box small-box'

	});


	var BoxManager = Backbone.Composite.extend({

		items: {
			'largeBox': new BigBox(),
			'smallBox': new SmallBox()
		},

		nests: {

			// * viewid  * Selector * jQuery Object 
			'largeBox': ['smallBox', '<div class="box small-box">test</div>', $('<div>Foo</div>')],

			'body': function () {
				var boxes = ['largeBox'];
				for (var i = 0, len = 10; i < len; i++) {
					// * backbone.view object 
					boxes.push(new SmallBox());
				}
				return boxes;
			}

		}

	});

	new BoxManager();

})();