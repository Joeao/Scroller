/**      
 * Scroller by JoeAO
**/
;(function ( $, window, undefined ) {

    "use strict";

    //  create the defaults once
    var pluginName = 'scroller';
    var defaults   = {
        // Options                       
        initiate:                       function(){},
        start:                          function(){},                                
        stop:                           function(){},
        step:                           function(){},
        showDebugging:                  false,
        duration:                       250,                                    // Lower is quicker
        //useCSSTranslation:            false,                                  // TRUE NOT SAFE Default false until tested 
        startEvents:                    'mousedown',
        stopEvents:                     'mouseup'
    };

   /**
    * Main Object
   **/
    function Scroller( el, options ) {

        this.name = pluginName;

        // reference to our DOM object 
        // and it's jQuery equivalent.
        this.el  = el;
        this.$el = $(el);

        //  merge in defaults
        this.defaults   = defaults;
        this.options    = $.extend( {}, this.defaults, options) ;

        // store document/body so we don't need to keep grabbing them
        // throughout the code
        this.$document  = $(this.$el[0].ownerDocument);
        this.$body      = this.$document.find('body');

        this.cssTranslate = this.options.useCSSTranslation && this.cssAnimationsSupported ? true : false;

        //  Create our triggers based on touch/click device 
        this.moveTrigger = 'mousemove';
        this.startTrigger = this.options.startEvents;
        this.stopTrigger  = this.options.stopEvents;

        this.started        = false;

        this.init();
    }

    //  init();
    Scroller.prototype.init = function () {
        var self = this;
        // Subscribe to our start event 
        self.$el.bind( self.startTrigger, function(ev){
          self.handleStart(ev);
        });

        // Subscribe to our stop event
        self.$document.bind( self.stopTrigger, function(ev) {
          self.handleStop(ev);
        });

        if(self.options.showDebugging) {
            self.$body.append('<p id="scroller-debugging" style="position:fixed; bottom:10px; right:10px; font-size:22px; z-index:9999;"></p>');
        }
    };

    /**
    * handleStart()
    *
    * Finds start position based on event
    * Binds move event and initial event
    **/
    Scroller.prototype.handleStart = function(e) {
        var self = this;

        self.started = true;

        var startPosition = {
            x: e.clientX,
            y: e.clientY
        }

        self.$document.one( self.moveTrigger, function() {
            self.options.initiate();
        });

        self.$document.bind( self.moveTrigger, function(ev){
          self.handleMove(startPosition, ev);
        });
    };

  //  handleMove();
  //    the logic for when the move events occur 
    Scroller.prototype.handleMove = function(startPosition, e) {
        if(this.started) {
            var self = this;
            var movePosition = {
                x: e.clientX,
                y: e.clientY
            }
            var scrollTo = self.calculatePosition(startPosition, movePosition);
            self.animate(scrollTo);
        }
    };

    //  handleStop();
    //    the logic for when the stop events occur
    Scroller.prototype.handleStop = function(e) {
        if(this.started) {
            var self = this;
            // fire user's stop event.
            self.options.stop.call(this, e, this);

            // this must be set to false after 
            // the user's stop event is called, so the dev
            // has access to it. 
            self.started = false;

            self.stopAnimate();

            self.$document.unbind(this.moveTrigger);

            if(self.options.showDebugging) {
                self.$body.find('#scroller-debugging').text('');
            }
        }
    };

    Scroller.prototype.calculatePosition = function(first, second) {
        var self = this;
        /**
         * @todo: turn if else into case
         * @todo: Handle edges better
        **/

        // Define Variables
        var frame = { // x0,y0
            x: self.$body[0].clientWidth,
            y: self.$body[0].clientHeight
        }

        var topLeft = { // Ξ0,η0
            x: -this.$el[0].offsetLeft,
            y: -this.$el[0].offsetTop
        }

        var start = { // x1,y1
            x: topLeft.x + first.x,
            y: topLeft.y + first.y
        }

        var target = { // x2,y2
            x: topLeft.x + second.x,
            y: topLeft.y + second.y
        }

        var m = { // Direction
            x: target.x - start.x,
            y: target.y - start.y
        }

        var max = {
            x: self.$el[0].clientWidth,
            y: self.$el[0].clientHeight
        }

        var n; // Distance between both clicks
        
        // Calculate position to scroll towards
        if(m.x >= 0 && m.y >= 0) {
            // Down Right
            n = Math.min( ((max.x - frame.x - topLeft.x) / m.x), ( (max.y - frame.y - topLeft.y) / m.y) )
        } else if (m.x >= 0 && m.y <= 0) {
            // Up Right
            n = Math.min( ((max.x - frame.x - topLeft.x) / m.x), (-topLeft.y / m.y));
        } else if (m.x <= 0 && m.y >= 0) {
            // Down Left
            n = Math.min( (-topLeft.x / m.x), ((max.y - frame.y - topLeft.y) / m.y));
        } else if (m.x <= 0 && m.y <= 0) {
            // Up Left
            n = Math.min( (-topLeft.x / m.x), (-topLeft.y / m.y) );
        }

        var scrollTo = { // Ξ1, η1
            x: Math.round(topLeft.x + (n * m.x)),
            y: Math.round(topLeft.y + (n * m.y)),
            n: n
        }

        return scrollTo;
    };

    Scroller.prototype.animate = function(scrollTo) {
        var self = this;
        // Scroll with jQuery
        if(this.cssTranslate) {
             // Scroll with CSS
            var string = "all " + Math.round(scrollTo.n * self.options.duration) + "ms linear";

            this.$el.css({
                left: -scrollTo.x,
                top: -scrollTo.y,
                '-webkit-transition': string,
                '-moz-transition': string,
                '-ms-transition': string,
                '-o-transition': string,
                'transition': string
            });
        } else {
            this.$el.stop(true, false).animate({
                left: -scrollTo.x,
                top: -scrollTo.y
            }, {
                step: function() {
                    self.options.step();
                    if(self.options.showDebugging) {
                        self.$body.find('#scroller-debugging').text("Left:" + -self.$el[0].offsetLeft + "; Top:" + -self.$el[0].offsetTop + "; N:" + (scrollTo.n).toFixed(4));
                    }
                },
                duration: scrollTo.n * self.options.duration,
                easing: 'linear'
            });
        }
    };

    Scroller.prototype.stopAnimate = function() {
        if(this.cssTranslate) {
            this.$el.css({
                left: -this.$el[0].offsetLeft,
                top: -this.$el[0].offsetTop,
                '-webkit-transition': '',
                '-moz-transition': '',
                '-ms-transition': '',
                '-o-transition': '',
                'transition': ''
            });
        } else {
            this.$el.stop();
        }
    };

    /**
     * Taken from https://github.com/briangonzalez/jquery.pep.js
    **/
    Scroller.prototype.cssAnimationsSupported = function() {

        if ( typeof(this.cssAnimationsSupport) !== "undefined" ){
          return this.cssAnimationsSupport;
        }

        // If the page has Modernizr, let them do the heavy lifting.
        if ( ( typeof(Modernizr) !== "undefined" && Modernizr.cssanimations) ){
          this.cssAnimationsSupport = true;
          return true;
        }

        var animation = false,
            elm = document.createElement('div'),
            animationstring = 'animation',
            keyframeprefix = '',
            domPrefixes = 'Webkit Moz O ms Khtml'.split(' '),
            pfx  = '';

        if( elm.style.animationName ) { animation = true; }    
         
        if( animation === false ) {
          for( var i = 0; i < domPrefixes.length; i++ ) {
            if( elm.style[ domPrefixes[i] + 'AnimationName' ] !== undefined ) {
              pfx = domPrefixes[ i ];
              animationstring = pfx + 'Animation';
              keyframeprefix = '-' + pfx.toLowerCase() + '-';
              animation = true;
              break;
            }
          }
        }

        this.cssAnimationsSupport = animation;
        return animation;
    };

    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
          if (!$.data(this, 'plugin_' + pluginName)) {
            var scrollerObj = new Scroller( this, options );
            $.data(this, 'plugin_' + pluginName, scrollerObj);
          }
        });
    };

    $.scroller = {};

}(jQuery, window));