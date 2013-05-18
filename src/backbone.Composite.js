;(function (Backbone, $) {

	function _isArray (obj) {
		return Object.prototype.toString.apply(obj) === '[object Array]';
	}


	// @param str {String} : A string like 'remove subview'
	// @return {Object} : 
	//		{
	//			target: 'targetName', 
	//			event: 'eventName'
	//		}
	function _getEventAndTargetName (str) {
		var evtandview = str.split(' ')
		,	eventName = evtandview[0]
		,	targetName = evtandview[1];

		return {
			target: targetName,
			event: eventName
		}
	} 

	function _iterateHandlers (handlers, callback) {
		var i, len, dot, method, handler, view, tmpView, id;  

		for (i = 0, len = handlers.length; i < len; i++) {
			handler = handlers[i]; 

			if (typeof handler === 'string') {

				dot = handler.lastIndexOf('.');

				if (dot === -1) {
					handler = this[handler];
					view = this;
				} else {

					method = handler.slice(dot + 1);
					id = handler.slice(0, dot);
					view = this.getItem(id);

					if (_isArray(view)) {

						for (j = 0, len = view.length; j < len; j++) {
							tpmView = view[j];
							callback(id, method, tpmView, tpmView[method]);
						}

						continue;

					} else {
						handler = view[method];
					}
				}
			}
			callback('function', 'function', view, handler);
		}
	}


	function _singleBindWithArray (target, name, handlers) {

		_iterateHandlers.call(this, handlers, function (id, method, view, handler) {
			target.on(name, handler, view);
		});

	}


	function _universalBinding (targets, name, handlers) {
		var i, len; 

		if (_isArray(targets)) {

			for (i = 0, len = targets.length; i < len; i++) {
				_singleBindWithArray.call(this, targets[i], name, handlers);
			} 

		} else {
			_singleBindWithArray.call(this, targets, name, handlers);
		}
	}


	// @param id {String}
	// @param target {Object}
	// @return {boolean}
	// find subview througth id, then  
	// bind the subview's all events to target
	function _dynamicBinding (id, target) {
		var events = this.ve[id]['bind']
		,	eventName;

		if (!events) return false;

		for (eventName in events) {
			_universalBinding.call(this, target, eventName, events[eventName]); 
		}

		return true;
	}

	function _dynamicListening (id, view) {
		var listens = this.ve[id]['listen']
		,	method
		,	evt
		,	targets;  

		for (method in listens) {
			evt = listens[method].split(' ');
			targets = this.getItem(evt[1]);
			_universalBinding(targets, evt[0], [view[method]]);
		}
	}

	function _dynamicNesting (id, view, prepend) {
		var parent = this.nv[id], $parent
		,	parentView, viewsInfo;

		if (parent === '') return;
		else {
			viewsInfo = parent.split(' ');
		}

		parentView = this.getItem(viewsInfo[0]);

		if (parentView) {
			$parent = parentView.$el;

			if (viewsInfo[1]) {
				$parent = $parent.find(viewsInfo[1]);
			}

		} else {
			$parent = $(parent);
		}

		if (prepend) {
			$parent.prepend(view.$el);
		} else {
			$parent.append(view.$el);
		}
	}


	// init all SubView
	function _initItemViews () {
		var itemViews = this.itemViews
		,	iv = this.iv
		,	i, view 
		,	ve, apis, events;

		for(i in itemViews) {
			view = iv[i] = itemViews[i]; 
			ve = this.ve[i] = {};
			this.nv[i] = '';

			ve['bind'] = {};
			ve['listen'] = {};

			// User May be set it as a function which returns an array
			if (typeof view === 'function') {
				view = iv[i] = view();
			}

			apis = this.exportAPI[i];
			events = this.exportEvent[i];

			if (view) {
				if(apis) _exportAPI.call(this, view, apis);
				if(events) _exportEvent.call(this, view, events);
			}

		} 
	}


	// listen events to subviews,
	// you can recursively listen subview's subview event
	function _bindEvents () {
		var	events = this.viewsEvents
		,	handlers, evtAndView, eventName
		,	targetName, views, id, handler
		,	i, listens, ve, dot, method, evt;

		for (i in events) {

			// handler must be an array container like this
			// ['say', 'comment.say', function () {...}]
			handlers = events[i]; 
			if (typeof handlers === 'function') handlers = handlers();

			evtAndView = _getEventAndTargetName(i);
			eventName = evtAndView.event;
			targetName = evtAndView.target;

			views = this.getItem(targetName);
			
			// cache self's subview events
			if (targetName.indexOf('.') === -1) {
				binds = this.ve[targetName]['bind'];
				binds[eventName] = handlers;
			}

			if (views && handlers.length) {  
				_universalBinding.call(this, views, eventName, handlers); 

				for (var j = 0, len = handlers.length; j < len; j++) {
					handler = handlers[j];
					if (typeof handler === 'function') continue;
					evt = handler.split('.')
					if (evt.length !== 2) continue;
					if (dot !== -1) {
						this.ve[evt[0]]['listen'][[evt[1]]] = i;
					}
				}
			}	
		}
	}


	// nest views, some parallel view need to nest to another view
	// this fucntion will make it happen
	function _nestAll () {
		var nestViews = this.nestViews
		,	view, parent, child, children, len
		,	$parent, $child, $fragment, values 
		,	parents, toFind, i, l, count = 0;

		for (parents in nestViews) {
			$fragment = $();
			$child = null; 

			values = parents.split(' ');
			parent = values[0];
			toFind = values[1] ? values[1] : null;

			view = this.getItem(parent);

			// Because you can get parent node from view's id 
			// of this Composite, you might get an array 
			// contains views object. When it accurs, we have no reason
			// to appen every nodes to every views. So we will append nodes
			// to the first view of the array (if it really got an array).
			if (view) {

				// If array, get its first element 
				// We will nest all views to first view
				if (_isArray(view)) {
					view = view[0];
				} 

				// As to here, the view must be a Backbone.View 
				$parent = view.$el;

				if (toFind) {
					$parent = $parent.find(toFind);
				}


			} else {

				// if view is null, then we get parent
				//  fron jQuery selector
				$parent = $(parents);
			}

			if ($parent.size() < 1) continue; 

			children = nestViews[parents]; 

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

					view = this.getItem(item);

					// for dynamicNesting 
					if (view && item.indexOf('.') === -1) {
						this.nv[item] = parents;
					}

					// You may attain an array from `getItem`
					if (_isArray(view)) {

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

	// exports subviews or object's API
	function _exportAPI (item, apis) {
		var method, i, len, api;

		if (typeof item === 'string') {
			item = this.getItem(item);
			if (!!!item) {
				throw Error("item " + item + " not found");
			}
		}

		for (var i = 0, len = apis.length; i < len; i++) {
			method = apis[i]; 
			api = item[method];

			if (!!!api) {
				throw new Error("API " + method + " not found");
			} else {
				// use to closure to make it work
				this[method] = (function (api) {
					return function () {
						api.apply(item, arguments);
					}
				})(api);
			}
		}
	};

	function _exportEvent (item, events) {
		var i, len, that;

		if (typeof item === 'string') {
			item = this.getItem(item);
			if (!!!item) {
				throw Error("item " + item + " not found");
			}
		}

		for (var i = 0, len = events.length; i < len; i++) {
			that = this;

			function getRealCallBack(eventName) {
				return function () {
					Array.prototype.unshift.call(arguments, eventName);
					that.trigger.apply(that, arguments);
				}
			}

			this.listenTo(item, events[i], getRealCallBack(events[i]));
		}
	}

	Backbone.Composite = Backbone.View.extend({

		items: {

			// 'id': view
			// 'id': [view, view, view]
			// 'id': function () {return [...];};
		},

		events: {
			// 'eventName view.subview': [handler, handler, handler]
			// 'eventName view.subview': function () {retun []} ;

			// the handler can be a function or string
			// string lik 'say' without '.', find event handler in current view
			// string lik 'comment.say' with '.', find subview 'comment' an bind its say method!
			// if the subviews is array, it also works
		},

		nests: {
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

		exportAPI: {
			// itemId: [api1, api2, api2]
		},

		exportEvent: {
			// itemId: [event1, event2, event3]
		},

		constructor: function (opt) {
			// It spends my hold day to deal with this....  
			//  use iv to cache the insitance's itemViews  
			// itemViews belongs to prototye, so for every Composite
			// we need to creat its own itemView, that is iv
			this.iv = {};
			this.ve = {};
			this.nv = {};

			// dirty code,
			// I want to change the params' name, but it's difficult
			// so I hold the old names inside, but export new names to clients
			this.itemViews = this.items;
			this.viewsEvents = this.events;
			this.nestViews = this.nests;

			_initItemViews.apply(this);
			_bindEvents.apply(this);
			_nestAll.apply(this);
			this.initialize();
		},

		// Set subview and its id
		// It cannot set subview's subview
		// You can chose to bind the events which already exists below the id's subview
		// or not to by setting the optional `bind` argument to false 
		setItem: function (id, view, bind) {
			var	bind = bind || true;

			this.trigger('set', id, view);
			this.trigger('set:' + id, id, view);

			if (!this.iv[id]) {
				this.iv[id] = view; 
				this.trigger('add', id, view);
				this.trigger('add:' + id, id, view);
				return ;
			}   

			if (bind) {
				_dynamicBinding.call(this, id, view);
			}
		},

		// getItem('subviewId.subviewId.subviewId') to get child view 
		// or subview's subviews
		getItem: function (id) {
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
					if (typeof superView.getItem === 'function') {
						return superView.getItem(subId);
					} else {
						return superView;
					}
				}
			}
		},

		// append a new subview to a subview that is an array 
		// You can chose to bind the events which already exists below the id's subview
		// or not to by setting the optional `bind` argument to false 
		pushItem: function (id, view, opt) {
			var views = this.getItem(id)
			,	isBind, isListen, listens, setting;

			setting = {
				bind: true,
				listen: true,
				nest: true,
				prepend: false
			};

			_.extend(setting, opt);

			if (!views)	{
				throw "subview not found";
			} 

			if (_isArray(views)) {

				views.push(view);
				if (setting.bind) _dynamicBinding.call(this, id, view);
				if (setting.listen) _dynamicListening.call(this, id, view);
				if (setting.nest) _dynamicNesting.call(this, id, view, setting.prepend);

			} else {
				throw "Subview is not an array";
			}

			this.trigger('append', id, view);
			this.trigger('append:' + id, view);
		},

		// removeSubView by id, 
		// But for safety, you cannot remove subview's subview 
		deleteItem: function (id) {
			if (this.iv[id]) {
				delete this.iv[id];
				if (this.ve[id]) delete this.ve[id];
				this.trigger('remove');
				this.trigger('remove:' + id);
				return true;
			} else {
				return false;
			}
		},

		// exports subviews or object's API
		_exportAPI: _exportAPI,

		// exports subitems or object's Event
		_exportEvent: _exportEvent

	});

})(Backbone, jQuery);