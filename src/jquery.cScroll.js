/**      
 * cScroll by JoeAO
**/
;(function ( $, window, undefined ) {

    "use strict";

    //  create the defaults once
    var pluginName = 'cScroll';
    var defaults   = {
        // Options                       
        initiate:                       function(){},                           // Happens when startTrigger is called
        start:                          function(){},                           // Happens when first move is made
        stop:                           function(){},
        step:                           function(){},
        throttle:                       false,                                  // Requires http://benalman.com/projects/jquery-throttle-debounce-plugin/ - Increases Performance
        throttleLimit:                  20,                                     // (ms) Rate at which movement functions are called
        useOuterWidth:                  false,                                  // Scrolling will stop when outer width is reached
        drawCursor:                     false,                                  // NOT SAFE FOR IE<=8 Draws a cursor on the screen. User can style #cscroll-pointer
        showDebugging:                  false,
        triggerOnChild:                 false,                                  // If false, trigger won't be called on child
        duration:                       250,                                    // Lower is quicker
        //useCSSTranslation:            false,                                  // TRUE NOT SAFE Default false until tested 
        startEvents:                    'mousedown',
        stopEvents:                     'mouseup'
    };

   /**
    * Main Object
   **/
    function cScroll( el, options ) {

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
        this.$window = $(window);
        this.$document  = $(this.$el[0].ownerDocument);
        this.$body      = this.$document.find('body');

        // drawCursor set to false if IE >= 8
        /* Currently bugged in latest version of jQuery 2.x, will uncomment and default to true when fixed
        http://forum.jquery.com/topic/jquery-support-leadingwhitespace-is-not-working-in-jquery-2-x
        if (! $.support.leadingWhitespace) {
            this.options.drawCursor = false;
        }*/

        if($.throttle == undefined) {
            this.options.throttle = false;
        }

        // this.cssTranslate = this.options.useCSSTranslation && this.cssAnimationsSupported ? true : false;

        //  Create our triggers based on touch/click device 
        this.moveTrigger = 'mousemove';
        this.startTrigger = this.options.startEvents;
        this.stopTrigger  = this.options.stopEvents;

        this.started = false;

        this.init();
    }

    //  init();
    cScroll.prototype.init = function () {
        var self = this;
        // Subscribe to our start event 
        self.$el.bind( self.startTrigger, function(ev){
            if(! self.options.triggerOnChild) {
                if($(ev.target).is(self.$el)) {
                    self.handleStart(ev);
                }
            } else {
                self.handleStart(ev);
            }            
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
    cScroll.prototype.handleStart = function(e) {
        var self = this;

        self.started = true;

        var startPosition = {
            x: e.clientX,
            y: e.clientY
        }

        self.options.start(e);

        self.$el.one( self.moveTrigger, function(e) {
            if(self.options.drawCursor) {
                $('*').css('cursor', 'none');
                $('body').append("<div id='cScroll-cursor-box' style='position:fixed; z-index:9999999; '></div>");
                $('#cScroll-cursor-box').append("<p id='cScroll-pointer' style='position:relative; font-size:44px; font-family: Arial, Helvetica, sans-serif; left:" + (e.clientX - 22) + "px; top:" + (e.clientY - 22) + "px;'>V</p>");
            }
            self.options.initiate(e);
        });
        if(self.options.thottle) {
            self.$el.bind( self.moveTrigger, $.throttle(self.options.throttleLimit, true, function(ev) {
                self.handleMove(startPosition, ev);
            }));
        } else {
            self.$el.bind( self.moveTrigger, function(ev) {
                self.handleMove(startPosition, ev);
            });
        }
        
    };

    //  handleMove();
    //  the logic for when the move event occurs
    cScroll.prototype.handleMove = function(startPosition, e) {
        if(this.started) {
            var self = this;
            var movePosition = {
                x: e.clientX,
                y: e.clientY
            }

            var scrollTo = self.calculatePosition(startPosition, movePosition);

            self.animate(scrollTo);

            if(self.options.drawCursor) {
                self.drawCursor(startPosition, movePosition)
            }
        }
    };

    //  handleStop();
    //    the logic for when the stop events occur
    cScroll.prototype.handleStop = function(e) {
        if(this.started) {
            var self = this;
            // fire user's stop event.
            self.options.stop(e);

            // this must be set to false after 
            // the user's stop event is called, so the dev
            // has access to it. 
            self.started = false;

            self.stopAnimate();

            self.$el.unbind(this.moveTrigger);

            if(self.options.showDebugging) {
                self.$body.find('#scroller-debugging').text('');
            }

            $('body #cScroll-cursor-box').remove();

            $('*').css('cursor', '');
        }
    };

    cScroll.prototype.calculatePosition = function(first, second) {
        var self = this;
        /**
         * @todo: turn if else into case
         * @todo: Handle edges better
        **/

        // Define Variables
        var frame = { // x0,y0
            x: self.$window.width(),
            y: self.$window.height()
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

        if(self.options.useOuterWidth) {
            var max = {
                x: self.$el.outerWidth(),
                y: self.$el.outerHeight()
            }
        } else {
            var max = {
                x: self.$el[0].clientWidth,
                y: self.$el[0].clientHeight
            }
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

    // Calculates the angle to get second point facing away from the first point
    cScroll.prototype.calculateAngle = function(first, second) {
        // Arrow is represented by a V
        var angle = Math.atan2(second.x - first.x, second.y - first.y) * 180 / Math.PI + 360;

        return angle;
    };

    cScroll.prototype.animate = function(scrollTo) {
        var self = this;
        /* CSS Translation
        var string = "all " + Math.round(scrollTo.n * self.options.duration) + "ms linear";

        this.$el.css({
            left: -scrollTo.x,
            top: -scrollTo.y,
            '-webkit-transition': string,
            '-moz-transition': string,
            '-ms-transition': string,
            '-o-transition': string,
            'transition': string
        });*/

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
    };

    cScroll.prototype.stopAnimate = function() {
        /* CSS Translation
        this.$el.css({
            left: -this.$el[0].offsetLeft,
            top: -this.$el[0].offsetTop,
            '-webkit-transition': '',
            '-moz-transition': '',
            '-ms-transition': '',
            '-o-transition': '',
            'transition': ''
        });*/

        this.$el.stop();
    };

    cScroll.prototype.drawCursor = function(startPosition, movePosition) {
        var self = this;

        var angle = self.calculateAngle(startPosition, movePosition);

        var rotate = 'rotate(-' + angle + 'deg)';
        var translate = 'translateX(' + (movePosition.x - startPosition.x) + 'px) translateY(' + (movePosition.y - startPosition.y) + 'px)';

        // According to http://caniuse.com/transform, only need -ms-, -webkit- and non-prefixed
        // Moves box
        $('body #cScroll-cursor-box').css({
            '-webkit-transform': translate,
            '-ms-transform': translate,
            'transform': translate
        });

        // Moves cursor rotation
        $('body #cScroll-pointer').css({
            '-webkit-transform': rotate,
            '-ms-transform': rotate,
            'transform': rotate
        });
    };

    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
          if (!$.data(this, 'plugin_' + pluginName)) {
            var scrollerObj = new cScroll( this, options );
            $.data(this, 'plugin_' + pluginName, scrollerObj);
          }
        });
    };

    $.cScroll = {};

}(jQuery, window));