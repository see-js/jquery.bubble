$(function() {
    var _DEFAULT = {
        // 气泡元素Class
        itemClass: 'J_BubbleItem',
        // 气泡大小范围[最小值, 最大值]，单位px
        size: [60, 120],
        // 气泡吹大时间范围[最小值, 最大值]，单位s
        blowTime: [0.5, 1],
        // 气泡出现的方向，left/right
        direction: 'right',
        // 位置偏移量，[x, y]，效果与 direction 相关
        offset: [0, 60],
        // 气泡产生时间间隔，单位s
        interval: 1.2,
        // 自动停止的时间，为0则不停止，单位s
        autoStop: 10
    };

    var DIRFLAG = {
        left: true,
        right: true
    };

    function Bubble(wrap, cfg) {
        var config = $.extend(true, {}, cfg || {});

        this.wrap = wrap;
        this.get = function(n) {
            return config[n];
        };
        this.set = function(n, v) {
            config[n] = v;
        };

        this.init();
    }

    Bubble.prototype.init = function() {
        var that = this;
        // 格式化气泡容器
        that.formatWrap();
        // 启动动画
        that.blow();
        // 自动停止
        if (that.get('autoStop')) {
            setTimeout(function() {
                that.stop.call(that);
            }, that.get('autoStop') * 1000);
        }
    };

    Bubble.prototype.formatWrap = function() {
        var pos = this.wrap.css('position');
        if (!pos || pos === 'static') {
            this.wrap.css('position', 'relative');
        }
    };

    Bubble.prototype.blow = function() {
        var that = this;
        var wrap = that.wrap;
        var timer = that.get('timer');
        if (timer) {
            clearInterval(timer);
        }
        timer = setInterval(function() {
            var item = $('<div class="' + that.get('itemClass') + ' bubbles">');
            var size = that.get('size');
            var dir = that.get('direction');
            var offset = that.get('offset');
            var width = (size[1] - size[0]) * Math.random() + size[0];
            var bTime = that.get('blowTime');
            var blowTime = (bTime[1] - bTime[0]) * Math.random() + bTime[0];
            var toTop = offset[1] - width / 2;
            var style = {
                position: 'absolute',
                width: 0,
                height: 0
            };

            if (!DIRFLAG[dir]) {
                dir = 'left';
            }

            style[dir] = offset[0];
            style['top'] = offset[1];

            item.css(style);
            wrap.append(item);
            item.animate({
                top: toTop,
                width: width,
                height: width
            }, blowTime * 1000, function() {
                setTimeout(function() {
                    that.fall.call(that, item);
                }, 150);
            });
            // clearInterval(timer);
        }, that.get('interval') * 1000);
        that.set('timer', timer);
    };

    Bubble.prototype.fall = function(item) {
        var that = this;
        var dir = that.get('direction');
        var wrapWdith = that.wrap.width();
        var wrapHeight = that.wrap.height();
        var itemWidth = item.outerWidth();
        var itemHeight = item.outerHeight();
        var speedx = Math.random() * wrapWdith * 0.05 + 10;
        var speedy = 0;
        var decay = Math.random() * 0.4 + 0.6;
        var startx;
        var starty;
        var endx;
        var endy;
        var interval;
        speedx = dir === 'right' ? speedx * -1 : speedx;
        interval = setInterval(function() {
            var nT;
            var nL;
            startx = parseFloat(item.css('left'));
            starty = parseFloat(item.css('top'));
            speedy += 2;
            nT = starty + speedy;
            nL = startx + speedx;

            if (nT < 0) {
                nT = 0;
                speedy *= -1 * decay;
                speedy < 0 ? Math.ceil(speedy) : Math.floor(speedy);
                speedx *= decay;
                speedx < 0 ? Math.ceil(speedx) : Math.floor(speedx);
            } else if (nT > wrapHeight - itemHeight) {
                nT = wrapHeight - itemHeight;
                speedy *= -1 * decay;
                speedy < 0 ? Math.ceil(speedy) : Math.floor(speedy);
                speedx *= decay;
                speedx < 0 ? Math.ceil(speedx) : Math.floor(speedx);
            }

            if (nL < 0) {
                nL = 0;
                speedx *= -1 * decay;
                speedx < 0 ? Math.ceil(speedx) : Math.floor(speedx);
            } else if (nL > wrapWdith - itemWidth) {
                nL = wrapWdith - itemWidth;
                speedx *= -1 * decay;
                speedx < 0 ? Math.ceil(speedx) : Math.floor(speedx);
            }

            item.css({
                left: nL,
                top: nT
            });

            if (nL === endx && nT === endy) {
                clearInterval(interval);
                setTimeout(function() {
                    that.remove.call(that, item);
                }, 300);
            }
            endx = nL;
            endy = nT;
        }, 35);
    };

    Bubble.prototype.remove = function(item) {
        item.fadeOut(function() {
            item.remove();
        });
    };

    Bubble.prototype.stop = function() {
        var timer = this.get('timer');
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    };

    $.fn.bubble = function(cfg) {
        var config = $.extend({}, _DEFAULT, cfg || {});
        if (!this.length) {
            throw('Elements not found.');
        }
        return this.each(function(idx, ele) {
            var $this = $(ele);
            if (!$this.parents('body').length) {
                $this = $('body');
            }
            $this.data('bubble', new Bubble($this, config));
        });
    };
});
