var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
var isIE = navigator.userAgent.toLowerCase().indexOf('msie') > -1 || navigator.userAgent.toLowerCase().indexOf('trident') > -1;
var pageLoaded = false;
var isNavOpen = false;

function ready(fn) {
    if (document.readyState != 'loading'){
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

function isMobile() {
    return ('ontouchstart' in document.documentElement);
}

var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
var requestFrame = function() { // requestAnimationFrame cross browser
    return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(func) {
            window.setTimeout(func, 1000 / 60);
        }
    );
}();

window.requestTimeout = function(fn, delay) {
    if( !window.requestAnimationFrame      	&&
        !window.webkitRequestAnimationFrame &&
        !(window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame) && // Firefox 5 ships without cancel support
        !window.oRequestAnimationFrame      &&
        !window.msRequestAnimationFrame)
        return window.setTimeout(fn, delay);

    var start = new Date().getTime(),
        handleTimeout = new Object();

    function loop(){
        var current = new Date().getTime(),
            delta = current - start;
        if (typeof fn !== 'undefined') {
            delta >= delay ? fn.call() : handleTimeout.value = requestFrame(loop);
        }
    };

    handleTimeout.value = requestFrame(loop);
    return handleTimeout;
};


Math.inOutQuintic = function(t, b, c, d) {
    var ts = (t/=d)*t,
        tc = ts*t;
    return b+c*(6*tc*ts + -15*ts*ts + 10*tc);
};

//Global Nav Easing Fn
function cubicInOut(t) {
    return t < 0.5
        ? 4.0 * t * t * t
        : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
};

class ShapeOverlays {
    constructor(elm) {
        this.elm = elm;
        this.path = elm.querySelectorAll('path');
        this.numPoints = 10;
        this.duration = 900;
        this.delayPointsArray = [];
        this.delayPointsMax = 300;
        this.delayPerPath = 250;
        this.timeStart = Date.now();
        this.isOpened = false;
        this.isAnimating = false;
    }
    toggle() {
        this.isAnimating = true;
        for (var i = 0; i < this.numPoints; i++) {
            this.delayPointsArray[i] = Math.random() * this.delayPointsMax;
        }
        if (this.isOpened === false) {
            this.open();
        } else {
            this.close();
        }
    }
    open() {
        this.isOpened = true;
        isNavOpen = true;
        //this.elm.classList.add('is-opened');
        this.timeStart = Date.now();
        this.renderLoop();
    }
    close() {
        this.isOpened = false;
        isNavOpen = false;
        //this.elm.classList.remove('is-opened');
        this.timeStart = Date.now();
        this.renderLoop();
    }
    updatePath(time) {
        const points = [];
        for (var i = 0; i < this.numPoints; i++) {
            points[i] = (cubicInOut(Math.min(Math.max(time - this.delayPointsArray[i], 0) / this.duration, 1)));

            points[i] = (this.isOpened ? points[i] : 1 - points[i])*100;
        }

        let str = '';
        str += `M 0 ${points[0]}`;
        for (var i = 0; i < this.numPoints - 1; i++) {
            const p = (i + 1) / (this.numPoints - 1) * 100;
            const cp = p - (1 / (this.numPoints - 1) * 100) / 2;
            str += `C ${cp} ${points[i]} ${cp} ${points[i + 1]} ${p} ${points[i + 1]} `;
        }
        str += `V 0 H 0`;
        return str;
    }
    render() {
        if (this.isOpened) {
            for (var i = 0; i < this.path.length; i++) {
                this.path[i].setAttribute('d', this.updatePath(Date.now() - (this.timeStart + this.delayPerPath * i)));
            }
        } else {
            for (var i = 0; i < this.path.length; i++) {
                this.path[i].setAttribute('d', this.updatePath(Date.now() - (this.timeStart + this.delayPerPath * (this.path.length - i - 1))));
            }
        }
    }
    renderLoop() {
        this.render();
        if (Date.now() - this.timeStart < this.duration + this.delayPerPath * (this.path.length - 1) + this.delayPointsMax) {
            requestAnimationFrame(() => {
                this.renderLoop();
            });
        }
        else {
            this.isAnimating = false;
        }
    }
}

ready(function() {
    Pace.on('done', function() {pageLoaded = true});

    // Global Navigation Liquid effect
    var $elmntHamburger = document.querySelector('#menu-hamburger');
    var $globalNav = document.querySelector('#global-nav');
    var $elmntOverlay = document.querySelector('.shape-overlays');
    var overlay = new ShapeOverlays($elmntOverlay);
    var body = document.querySelector('body');

    var navFunction = function (e, contactsClick) {
        if (overlay.isAnimating) {
            return false;
        }
        overlay.toggle();

        if (contactsClick) {
            $globalNav.classList.add('contact-triggered');
        }

        if (overlay.isOpened === true) {
            body.classList.add('nav-open');
            $elmntHamburger.classList.add('is-opened');
            $globalNav.classList.add('is-opened');
        } else {
            $elmntHamburger.classList.remove('is-opened');
            $globalNav.classList.remove('is-opened');
            $globalNav.classList.remove('contact-triggered');
            body.classList.remove('nav-open');

        }
    }

    $elmntHamburger.addEventListener('click', navFunction);
    //Fix class for sticky hover effects.
    if (isMobile()) {
        $elmntHamburger.classList.add('remove-touch-efx');
    }

});

