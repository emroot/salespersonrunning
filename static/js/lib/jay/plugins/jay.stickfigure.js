(function(Jay, $){
	var transitionEnd;
	$.support.transition = (function (){
		var thisBody = document.body || document.documentElement,
		    thisStyle = thisBody.style,
		    support = thisStyle.transition !== undefined || thisStyle.WebkitTransition !== undefined || thisStyle.MozTransition !== undefined || thisStyle.MsTransition !== undefined || thisStyle.OTransition !== undefined;
		    return support
 	})();

	if ($.support.transition) {
		transitionEnd = "TransitionEnd"
		if ($.browser.webkit) {
			transitionEnd = "webkitTransitionEnd"
		} else if ($.browser.mozilla) {
			transitionEnd = "transitionend"
		} else if ($.browser.opera) {
			transitionEnd = "oTransitionEnd"
		}
	};
	
	var stickfigure = Jay.StickFigure = Jay.Klass({
		constructor: function(options){
			this.settings = {
				name: "",
				img: "",
				bottom: 0,
				left: 0,
				bubbleText: 0
			}
			this.duration = 5000;
			if(options)
				$.extend(true, this.settings, options);
				
			this.settings.name = this.settings.name.split("_")[0];
			this.$element = $("<div>").addClass("jay-stickfigure");
			this.$head = $("<img>").addClass("jay-stickfigure-head").attr("src", this.settings.img);
			this.$head.css("width", this.settings.headSize);
			this.$head.css("left", this.settings.headLeft);
			this.$head.css("top", this.settings.headTop);
			this.$body = $("<div>").addClass("jay-stickfigure-body");
			this.$bubble = $("<div>").addClass("jay-stickfigure-bubble").hide();//.html(this.settings.name + "<br />"+Jay.utils.format.dollars(this.settings.bubbleText));
			this.leftArm = new Arm(this.$element, "left");
			this.rightArm = new Arm(this.$element, "right");
			this.leftLeg = new Leg(this.$element, "left");
			this.rightLeg = new Leg(this.$element, "right");
			this.lastValue = 0;
			
			this.$element.append(this.$bubble, this.$head, this.$body, this.leftArm, this.rightArm, this.leftLeg, this.rightLeg);
			this.$element.css("left", this.settings.leftPos);
			this.$element.css("bottom", this.settings.topPos);
			
			this.$body = $(document.body);
			this.$body.append(this.$element);
		},
		move: function(left, bubbleText, callback, reset){
			this.settings.leftPos = left;
			this.$element.stop().animate({
				left: this.settings.leftPos
			}, {duration: this.duration,
				complete: callback,
				queue: false
			});
			var times = 0;
			var intervalD = this.duration/5;
			var scope = this;
			if(reset === undefined)
				var f = setInterval(function(){
					if(times == scope.duration){
						scope.lastValue = parseInt(bubbleText);
						clearInterval(f);
					}
					scope.settings.bubbleText += (parseInt(bubbleText-scope.lastValue)/5);
					scope.$bubble.show().html(scope.settings.name + "<br />"+Jay.utils.format.dollars(scope.settings.bubbleText));
					times += intervalD;
				}, intervalD);
		}
	});
	
	var Arm = Jay.Klass({
		constructor: function(element, type){
			var type = (type == "left" ? "left" : "right");
			this.$element = element;
			this.$arm = $("<div>").addClass("jay-stickfigure-arm "+type).appendTo(this.$element);
		}
	});
	
	var Leg = Jay.Klass({
		constructor: function(element, type){
			var type = (type == "left" ? "left" : "right");
			this.$element = element;
			this.$arm = $("<div>").addClass("jay-stickfigure-leg "+type).appendTo(this.$element);
		}
	});
	
}(this.Jay = this.Jay || {}, jQuery));