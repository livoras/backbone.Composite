# backbone.Composite

这个插件致力于用组合模式更好地处理 backbone.js 中的视图关系。有下面几个特性：

* 使应用程序的整体视图关系达到一个树形结构，尽可能地降低视图模块之间的耦合性。
* 使用中介者模式，充分利用事件机制，使不同视图之间的可以进行通信。
* 批量处理视图 DOM 的添加
* 多对多事件的触发。
* 动态事件自动绑定。

使用Composite的时机：

如果你发现自己需要在一个视图中用到另外一个视图，那么请考虑用组合视图，把那两个视图组合起来，而不是在一个视图的实现中参杂另外一个视图。

## How to use

### 加载

要使用本插件，只要在 backbone.js 加载完成以后加载本插件就可以使用插件的功能。

```html
<script src='jquery.js'></script>
<script src='underscore.js'></script>
<script src='backbone.js'></script>
<script src='backbone.Composite.js'></script>
```

### 基本用法

```javascript

var SomeView = Backbone.Composite.extend({

        // 设置该组合视图用到的子视图
        items: {
			'container': function () {
				return new Container;
			},

			'subviews': function() {
				return [new Sub, new Sub, new Sub];
			}
		},

        // 设置视图的包含关系
		nests: {
			'container': 'subviews'
		},

        // 处理视图间的事件
		events: {
			'remove subviews': 'container.resize'
		}
		
});

var sv = new SomeView;
sv.getItem('container');
sv.setItem('specialView', new Sub);

````

详细用法请看 API

## API
使用 backbone.Composite 要需要五个参数，四个方法。

### 参数 
* items
* nests
* events
* exportAPI
* exportEvent

### 方法
* setItem()
* getItem()
* pushItem()
* deleteItem()

* * *

### items

这个对象声明了该组合视图需要用到的子视图，它是树形结构的关键，在定义一个组合视图类时传入。格式为：
```javascript
    items: {
        
        itemId1: function () {
            return view;
        },
        
        itemId2: function () {
            return [view, view, view,....];
        }
    }
```
<code>itemId</code>是你为该子视图所设定的唯一标识，键值则是一个函数，返回一个 Backbone 视图对象
或者存放视图对象的数组。

```javascript
    var CommentWrapper = Backbone.Composite.extend({

		items: {

			// 设置 `deleteBtn` 这个 id 对应的是一个 Button 视图实例
			'deleteBtn': function () {
				return new Button;
			},

			// `comments` 这个 id 则对应的是一组 Comment 的视图实例
			'comments': function () {
				return [new Comment, new Comment, new Comment];
			}
		}

	});
    
    // 实例化组合视图
    new CommentWrapper;
    
```

也许你会疑惑为什么要用函数作为键值，为什么我们不直接这样：

```javascript
    var CommentWrapper = Backbone.Composite.extend({

    	items: {
		
			'deleteBtn':  new Button,
		
			'comments': [new Comment, new Comment, new Comment]
		}

	});
    
    // 实例化组合视图
    new CommentWrapper;
```

如果你这样做，那么所有的<code>CommentWrapper</code>组合视图之间会共用
<code>'deleteBtn'</code>和<code>'comment'</code>
，假设你实例化两次CommentWrapper：
```javascript
    var cw1 = new CommentWrapper;
    var cw2 = new CommentWrapepr;
```
那么<code>cw1</code>和<code>cw2</code>的<code>'deleteBtn'</code>和<code>'comment'</code>将是同一个实例。
如果你需要在在组合视图之间共用子视图实例，可以用实例取代函数作为键值。但是通常情况下建议大家使用函数。

* * *

### nests

这个参数处理视图的 DOM 元素之间的父子节点关系，接受数组或者返回数组的函数作为键值，
格式为：

```javascript
    nests: {
        parent: [child, child, child,...],
        parent: function () {
            return [child, child, child,....];
        }
    }
```

其中<code>parent</code>可以是：
* 本组合视图的任意非数组子视图 id
* jQuery选择器

<code>child</code>可以为：
* 本组合视图中任意视图 id，包括数组
* 任意 Backbone 的视图实例
* jQuery 对象
* jQuery 选择器

当实例化一个组合视图的时候，插件会自动将数组中所有的 <code>child</code> 添加到 <code>parent</code> 的 DOM 结构中。

```javascript
    var CommentWrapper = Backbone.Composite.extend({

        items: {
		
			'deleteBtn':  function () { return new Button; },
		
			'comments': function () { return [new Comment, new Comment, new Comment]},
            
            'containier': function () {return new Container;}
		},
        
        nests: {
            // 视图id     数组视图id    视图id    jQuery选择器   jQuery对象
            'container ul': ['comments', 'deleteBtn', '#sample', $('<li>item</li>')],
            
            // 选择器   视图id
            'body':     ['container']
        }

	});
    
    // 实例化组合视图
    new CommentWrapper;
```

上面的<code>CommentWrapper</code>在实例化的时候，会执行:

1. 将`comments`这个id对应的数组子视图的三个`comment`的`$el`都添加到`container`这个id对应的视图的DOM元素的子元素'ul'中。
2. 将`deleteBtn`对应的视图的`$el`添加到`container`
3. 将`#sample`选择器获得的DOM元素添加到`container`
4. 将`<li>item</li>`元素插入`container`
5. 然后最终将`container`添加到`body`元素中

如果parent为`itemId selector`，那么就相当于向该`itemId`对应的子视图的子DOM元素，相当于`$el.find(selector)`，进行`append`操作。

假如你的子视图也是一个组合视图，你想往子视图的子视图中添加元素应该怎么做呢？插件提供强大的“点”操作，
你可以通过`itemId.itemId`来获取视图后继视图。继续上面的代码：

```javascript
    var App = Backbone.CompositeView.extend({
        
        items: {
            // wrapper 对应的视图也是一个组合视图，也就是上面的 CommentWrapper
            'wrapper': function () {return new CommentWrapper;}
        },
        
        nests {
            // 往 wrapper 这个子视图的子视图 container 插入两个 Comment
            'wrapper.container': [new Comment, new Comment]
        }
        
    });
    
    new App;
```

理论上你可以通过`.`无限获取组合视图的子视图，`itemId.itemId.itemId.itemId....`。
当然，所有的点操作都应该是在你给视图所标识的id上进行。

* * *

### events

视图之间都是通过事件来进行消息的传递的，
插件提供了良好的事件处理机制，
让你可以对视图进行一对多，多对一，多对多的事件绑定。

格式为：
```javascript
    events: {
        'eventName itemId': [handler, hander, handler,...],
        'eventName itemId': function () {
            return [handler, hander, handler,...];
        }
    }
```
1. `eventName`为事件的名称，
2. `itemId`为触发事件子视图的id
3. `handler`可以是一个字符串，也可以是一个函数。如果是字符串，则可能绑定组合视图本身或者组合视图子视图的事件，
   根据是否有`.`操作来判断。
4. 当实例化的时候，会把数组中所有的函数绑定到`itemId`对应视图的`eventName`事件下。

参考例子：
```javascript
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

	var House = Backbone.Composite.extend({

		items: {
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

		events: {
			'park dogs': ['cats.run', 'women.rage'],
			'rage women': ['dogs.run', 'houseMessUp', function () {console.log('~~~funny');}]
		},

		initialize: function () {
			this.getItem('dogs')[0].park();
		},

		houseMessUp: function () {
			console.log('House Mess Up');
		}

	});

	new House;

```
上面的例子中，讲述了这样一个故事。一个房子里面（组合视图House）里面住着一个叫`women`的人（子视图`People`），
养了三只猫`cats`（子视图`Cat`），和两条狗`dogs`（子视图`Dog`）。在一个销魂的早上大概发生了这样事情：
其中一条狗大吠了一声，于是：

* 把所有的猫都吓跑了，惹怒了女主人，
* 女主人怒了，狗也全跑了。女主人追着狗跑，让房子全乱了。

于是控制台中输出：
```javascript
Dog park // 一条狗吠了
Cat run... :3 // 三只猫跑了
People rage  // 主人怒了
Dog run :2 // 两条狗跑了
House Mess Up // 房子乱成一团
~~~~funny // 好好玩不是么？
```

我们代码中的`events`就通过事件达到了这种效果
```javascript
    events: {
		'park dogs': ['cats.run', 'women.rage'],
		'rage women': ['dogs.run', 'houseMessUp', function () {console.log('~~~funny');}]
	},
```

`dogs`是一个存放了两个`Dog`视图实例的数组，`cats`是放了三个`Cat`视图实例的数组，`women`是一个`People实例`。
当`dogs`中任意一个视图触发了`park`事件，会使`cats`所有视图执行`run`方法，`women`执行`rage`方法。
当`women`触发了`rage`事件，会使`dogs`中所有视图调用`run`方法，以及执行`house`的`houseMessUp`方法和一个自定义的匿名方法。

从上面的例子我们可以看出，我们的插件可以让一组或者一个子视图元素的事件监听一系列方法，
这些方法可以是

* 自定义的
* 子视图的
* 组合视图的

（如果有`.`则是绑定子视图的方法，否则就是在该组合视图中寻找该方法
，如上面的`dogs.run`绑定子视图的方法，`houseMessUp`绑定组合视图的方法）。

你甚至可以监听子视图的子视图的事件，
假如有比`House`更高层的组合视图`App`，
在其中可以监听`Houese`中的`dogs`的`park`事件：
```javascript

    var App = Backbone.Composite.extend({
        items: {
            'house': function () {return new House;}
        },
        events: {
    	    'park house.dogs': [function () {}...]
	    }
    });
    
    new App;
```

* * *
### exportAPI

设置该属性可以把item的方法暴露为自己的方法：

格式为：
```javascript
exportAPI: {
	'itemId': ['method1','method2',....]
}
```

给出一个栗子：
```javascript
var Box = Backbone.View.extend({
	name: 'Hi',
	sayName: function () {
		console.log(this.name);	
	}
});

var BoxWrapper = Backbone.Composite.extend({
	items: {
		'box': function () {
			return new Box;
		}
	},
	exportAPI: {
		'box': ['sayName']
	}
});

var boxWrapper = new BoxWrapper;
boxWrapper.sayName(); // => Hi
```
如上面的代码，`sayHi`函数属于`Box`的方法，但是我们想把它暴露出去作为组合视图的方法，那么就可以用`exportAPI`。


* * *
### exportEvent
设置该属性可以把item的事件暴露为自己的事件

格式为：
```javascript
exportEvent: {
	'itemId': ['Event1','Event2',....]
}
```

给出一个栗子：
```javascript
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
```
如上面的代码，`nameSay`函数属于`Box`的事件，但是我们想把它暴露出去作为组合视图的事件，那么就可以用`exportEvent`。

* * *
### getItem(itemId:String)

获取组合视图的子视图，支持`.`操作获取更底层的视图：
```javascript
var app = new App();
app.getItem('house'); // => new House
app.getItem('house.dogs'); // => [dog, dog, dog]
```
若视图存不存在，返回`null`

* * *
### pushItem(itemId:String, view:Object [, options:Object])
该方法可以往组合视图的数组形式子视图中添加元素，同时，你可以通过可选参数`options`来设置是否需要配置函数的行为。
options的有三个可以设置的属性：`nest`，`bind`，`listen`，都是`Boolean`类型。实例用法（回忆我们`House`的例子）：
```javascript
 	// 此处省略代码
	
	var House = Backbone.Composite.extend({

		items: {
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

		events: {
			'park dogs': ['cats.run', 'women.rage'],
			'rage women': ['dogs.run', 'houseMessUp', function () {console.log('~~~funny');}]
		},

		initialize: function () {
			this.getItem('dogs')[0].park();
		},

		houseMessUp: function () {
			console.log('House Mess Up');
		}

	});
	
	var house = new House;
	var dog = new Dog;
	
	house.pushItem('dogs', dog, {
		nest: true,
		bind: true,
		listen: true,
		prepend: false
	});
	
	dog.park();
```
* `nest`：新增的视图是否也按照`nests`的规则进行 DOM 元素的插入。

* `bind`：设置子视图的触发事件是否也按照`viewsEvents`的规则来执行一系列的函数。
   如上面的`dog`的`park`事件的触发会导致`cats.run`，`women.rage`函数的执行。
   如果你希望新插入的小`dog`不会吓跑`cats`，不会让`women`发怒。那么简单地设置`bind`为`false`即可。

* `listen`：如果在`viewsEvents`的规则中，子视图监听了一些其他子视图的事件，那么你可以通过设置这个参数来规定
   新插入的视图元素是否按照规则来继续监听其他子视图的事件。如我们的`dogs`是监听了`women`的`rage`事件的，一旦
   `women`触发了`rage`事件，所有的`dogs`都会跑光光。如果你希望新插入的`dog`不会被`women`吓跑，那么简单设置`listen`
   为`false`就可以。

* `prepend`：默认是false，当插入 DOM 的时候是以`$el.append`方式插入；如果设置为true，那么就以`$el.prepend`方式插入DOM

假如不传入参数`options`，那么前三个属性默认都为`true`，后面一个默认为`false`

该方法会触发`push`，`push:itemId`事件

* * *
### setItem(itemId:String, view:Object [, options:Object])
设置子视图，不支持`.`操作，也就说处于安全考虑，不可以让你设置后继子视图。
```javascript
var app = new App();
app.setItem('anotherHouse', new House, {
	nest: true,
	bind: true,
	listen: true,
	remove: true
});
```
该方法会触发`get`和`get:itemId`事件，如果是添加本身不存在的视图同时会触发`add`事件。
参数 `nest`，`bind`，`listen`和 `pushItem` API含义相同，`remove` 参数用来设置是否把原来的item对应的DOM元素也一并删除。
默认所有参数都为`true`
* * *
### deleteItem(itemId:String [,options:Object])
让你可以从实例中删除子视图，相应的DOM元素并不会删除。需要你手动删除。
```javascript
var app = new App();
app.deleteItem('house', {
	remove: true
});
```
该方法会触发`delete`和`delete:ItemId`事件
接受一个参数 `remove`， 用来设置在删除item的时候是否把item对应的DOM元素也从DOM树中删除。

## Licence
MIT
