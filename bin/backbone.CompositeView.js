;(function (Backbone, $) {

	Backbone.CompositeView = Backbone.View.extend({

		itemViews: {

			// 'id': view
			// 'id': [view, view, view]
			// 'id': function () {return [...];};

		},

		viewsEvents: {
			// 'eventName view.subview': [handler, handler, handler]
			// 'eventName view.subview': function () {retun []} ;

			// the handler can be a function or string
			// string lik 'say' without '.', find event handler in current view
			// string lik 'comment.say' with '.', find subview 'comment' an bind its say method!
			// if the subviews is array, it also works
		},

		nestViews: {
			// subview or selector: [subview, selector, $obj....] => array 
			// subview or selector:  function which return array like above => function

			// You can append :
			// 
			// * arbitary subview 
			// * DOM jQuery   
			// * function the return an array
			// 	
			// to certain subview or DOM 
		},

		constructor: function (opt) {
			// It spends my hold day to deal with this....  
			//  use iv to cache the insitance's itemViews  
			// itemViews belongs to prototye, so for every CompositeView
			// we need to creat its own itemView, that is iv
			this.iv = {};
			this._initItemViews();
			this._bindEvents();
			this._nestAll();
			this.initialize();
		},

		// Set subview and its id
		// It cannot set subview's subview
		setSubView: function (id, view) {

			if (!this.iv[id]) {
				this.trigger('add', id, view);
			}   

			this.iv[id] = view; 
			this.trigger('set', id, view);
		},

		// getSubView('subviewId.subviewId.subviewId') to get child view 
		// or subview's subviews
		getSubView: function (id) {
			var subId
			,	superId
			,	firstDot; 

			if (typeof id !== 'string') return null;

			firstDot = id.indexOf('.');

			if (firstDot === -1) {
				return this.iv[id] ? this.iv[id] : null;
			} else {
				var superView; 

				subId = id.slice(firstDot + 1)
				superId = id.slice(0, firstDot);
				superView = this.iv[superId];

				if (!superView) {
					return null;
				} else {
					if (typeof superView.getSubView === 'function') {
						return superView.getSubView(subId);
					} else {
						return superView;
					}
				}
			}
		},

		// removeSubView by id, 
		// But for safety, you cannot remove subview's subview 
		delSubView: function (id) {
			if (this.iv[id]) {
				delete this.iv[id];
				this.trigger('remove');
				this.trigger('remove:' + id);
				return true;
			} else {
				return false;
			}
		},

		_initItemViews: function () {
			var itemViews = this.itemViews
			,	iv = this.iv
			,	i
			,	view;

			for(i in itemViews) {
				view = iv[i] = itemViews[i]; 

				// User May be set it as a function which returns an array
				if (typeof view === 'function') {
					iv[i] = view();
				}
			} 
		},

		_bindWithArray: function (target, name, handlers) {
			var handler 
			,	dot = -1
			,	view
			,	method
			,	i, len, j;

			for (var i = 0, len = handlers.length; i < len; i++) {

				handler = handlers[i]; 

				if (typeof handler === 'string') {

					dot = handler.lastIndexOf('.');

					if (dot === -1) {
						handler = this[handler];
						view = this;
					} else {

						method = handler.slice(dot + 1);
						view = this.getSubView(handler.slice(0, dot));

						if (Object.prototype.toString.apply(view) === '[object Array]') {

							for (j = 0, len = view.length; j < len; j++) {
								target.on(name, view[j][method], view[j]);
							}

							continue;

						} else {
							handler = view[method];
						}
					}
				}

				target.on(name, handler, view);
			}
		},

		// listen events to subviews,
		// You can recursively listen subview's subview event
		_bindEvents: function () {
			var handlers
			,	events = this.viewsEvents
			,	evtAndView
			,	eventName
			,	viewName
			,	views
			,	len
			,	i
			,	j;


			for (i in events) {

				// handler must be an array container like this
				// ['say', 'comment.say', function () {...}]
				handlers = events[i]; 
				if (typeof handlers === 'function') handlers = handlers();

				evtAndView = i.split(' ');
				eventName = evtAndView[0];
				viewName = evtAndView[1];
				views = this.getSubView(viewName);

				if (views && handlers.length) {  

					// Because you can set itemViews with:  
					// id => object
					// id => array
					// then you may atttain an array by `getSubView` 
					// which contains Backbone.View insitance
					// If it is, iterate views, listen every element's same event 
					if (Object.prototype.toString.apply(views) === '[object Array]') {

						for (j = 0, len = views.length; j < len; j++) {
							this._bindWithArray(views[j], eventName, handlers); 
						}

					} else {

						this._bindWithArray(views, eventName, handlers); 

					} 

				}	
			}
		},

		// nest views, some parallel view need to nest to another view
		// this fucntion will make it happen
		_nestAll: function () {
			var nestViews = this.nestViews
			,	view
			,	parent
			,	child
			,	children 
			,	len
			,	$parent
			,	$child  
			,	$fragment
			,	i, l;

			for (parent in nestViews) {
				$fragment = $();
				$child = null; 

				view = this.getSubView(parent);

				// Because you can get parent node from view's id 
				// of this CompositeView, you might get an array 
				// contains views object. When it accurs, we have no reason
				// to appen every nodes to every views. So we will append nodes
				// to the first view of the array (if it really got an array).
				if (view) {

					// If array, get its first element 
					// We will nest all views to first view
					if (Object.prototype.toString.apply(view) === '[object Array]') {
						view = view[0];
					} 

					// As to here, the view must be a Backbone.View 
					$parent = view.$el;

				} else {

					// if view is null, then we get parent
					//  fron jQuery selector
					$parent = $(parent);
				}

				if ($parent.size() < 1) continue; 

				children = nestViews[parent]; 

				if (typeof children === 'function') children = children();

				for (len = children.length, child = 0; child < len; child++) {
					var item = children[child];

					if (typeof item === 'object') {

						// if the item has $el property,
						// that says item in array is an Backbone.View Object
						// then get its view
						if (item.$el) {

							$child = item.$el;

						// if has no $el property, it is jQuery Object
						} else {

							 $child = item;

						}

					// item is string, ite may be is subview's id 
					// or a jQuery Selector
					} else if (typeof item === 'string') {

						view = this.getSubView(item);

						// You may attain an array from `getSubView`
						if (Object.prototype.toString.apply(view) === '[object Array]') {

							for (i = 0, l = view.length; i < l; i++) {
								$fragment = $fragment.add(view[i].$el);
							}

						} else {

							$child = view ? view.$el : $(item);

						} 

					}

					// finally to judge the if DOM really exist
					// then appen it to DOM fragment
					if ($child && $child.size() >= 1) {
						$fragment = $fragment.add($child);
					}
				} 

				if ($fragment.size () >= 1) {
					$parent.append($fragment);
				}
			}
		}

	});

})(Backbone, jQuery);