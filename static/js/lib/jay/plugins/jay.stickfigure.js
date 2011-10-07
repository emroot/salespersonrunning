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
				left: 0
			}
			this.duration = 10000;
			if(options)
				$.extend(true, this.settings, options);
			
			this.$element = $("<div>").addClass("jay-stickfigure");
			this.$head = $("<img>").addClass("jay-stickfigure-head").attr("src", this.settings.img);
			this.$head.css("width", this.settings.headSize);
			this.$head.css("left", this.settings.headLeft);
			this.$head.css("top", this.settings.headTop);
			this.$body = $("<div>").addClass("jay-stickfigure-body");

			this.leftArm = new Arm(this.$element, "left");
			this.rightArm = new Arm(this.$element, "right");
			this.leftLeg = new Leg(this.$element, "left");
			this.rightLeg = new Leg(this.$element, "right");
			
			this.$element.append(this.$head, this.$body, this.leftArm, this.rightArm, this.leftLeg, this.rightLeg);
			this.$element.css("left", this.settings.leftPos);
			this.$element.css("top", this.settings.topPos);
			//$this.$backdrop.one(transitionEnd, removeElement);
			
			this.$body = $(document.body);
			this.$body.append(this.$element);
		},
		move: function(left){
			this.settings.leftPos = left;
			this.$element.animate({
				left: this.settings.leftPos
			}, this.duration);
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