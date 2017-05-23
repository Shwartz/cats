(function(global, factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        // AMD
        define(function() {
            return factory();
        });
    } else if (typeof exports !== 'undefined') {
        // Node/CommonJS
        exports.Mediator = factory();
    } else {
        // Browser global
        global.DOM = factory();
    }
}(this, function() {
    'use strict';
    let on = (el, ev, cb, context, ...args) => {
            let events = ev.split(' '),
                fn = (e) => {
                    cb.apply(context || this, [e].concat(args));
                };

            events.forEach((event) => {
                el.addEventListener(event, fn);
            });
            return {
                remove: () => {
                    events.forEach(event => el.removeEventListener(event, fn));
                }
            }
        },
        addTemplate = (container, template) => {
            return new Promise((res, rej) => {
                container.innerHTML = template;
                res(container);
            });
        },
        select = (selector, cb) => (el) => cb(el.querySelector(selector)),
        selectAll = (selector, cb) => (el) => cb(el.querySelectorAll(selector));

    class Container {
        constructor(el) {
            this.el = el;
            this._handlers = [];
        };

        on(ev, cb) {
            let evt = on(this.el, ev, cb, this);
            this._handlers.push(evt);
        };

        addTemplate(template) {
            return addTemplate(this.el, template).then(container => this);
        };

        remove() {
            let parent = this.el.parentNode;
            this._handlers.forEach(hd => hd.remove());
            parent.removeChild(this.el);
        }
    }
    ;

    let DOM = {
        on,
        Container,
        select,
        selectAll,
        container: (selector) => new Container(document.querySelector(selector))
    };

    return DOM;

}));