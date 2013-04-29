;(function (Backbone) {
	Backbone.CompositeView = Backbone.View.extend({

		itemViews: {
			// 'id': view
		},

		viewsEvents: {
			// 'eventName view.subview': handler

			// the handler can be a function or string
			// if is string, find event handler in current view
		},

		nestViews: {
			// 'viewId or Selector': [viewId1 or Selector, viewId2 or Selector]

			// You can append arbitary subview or DOM jQuery 
			// to certain subview or DOM 
		},

		constructor: function (opt) {
			_.extend(this, opt);
			Backbone.View.apply(this, arguments);
			this.bindEvents();
			this.nestAll();
		},

		// Set subview and its id
		// It cannot set subview's subview
		setSubView: function (id, view) {

			if (!itemViews[id]) {
				this.trigger('add', id, view);
			}   

			itemViews[id] = view; 
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
				return this.itemViews[id] ? this.itemViews[id] : null;
			} else {
				var superView; 

				subId = id.slice(firstDot + 1)
				superId = id.slice(0, firstDot);
				superView = this.itemViews[superId];

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
		remove: function (id) {
			if (this.itemViews[id]) {
				delete this.itemViews[id];
				return true;
			} else {
				return false;
			}
		},

		// listen events to subviews,
		// You can listen recursively listen subview's subview event
		bindEvents: function () {
			var handler
			,	events = this.viewsEvents
			,	evtAndView
			,	eventName
			,	viewName
			,	view
			,	i; 

			for (i in events) {

				// if handler is a function, bind it directly 
				// if it's a string, then find the event handler in current
				// view, and bind it to view's certain event
				handler = events[i]; 
				if (typeof handler === 'string') handler = this[handler]; 

				evtAndView = i.split(' ');
				eventName = evtAndView[0];
				viewName = evtAndView[1];
				view = this.getSubView(viewName);

				if (view && handler) {  
					view.on(eventName, handler);
				}	
			}
		},

		// nest views, some parallel view need to nest to another view
		// this fucntion will make it happen
		nestAll: function () {
			var nestViews = this.nestViews
			,	view
			,	parent
			,	child
			,	children 
			,	len
			,	$parent
			,	$child  
			,	$fragment;

			for (parent in nestViews) {
				$fragment = $();

				view = this.getSubView(parent);
				$parent = view ? view.$el : $(parent);

				if ($parent.size() < 1) continue; 

				children = nestViews[parent]; 

				for (len = children.length, child = 0; child < len; child++) {
					view = this.getSubView(children[child]);
					$child = view ?  view.$el : $(children[child]);
					if ($child.size() >= 1) {
						$fragment = $fragment.add($child);
					}
				} 

				$parent.append($fragment);
			}
		}

	});

})(Backbone);