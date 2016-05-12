/**
 * Created by guntars on 11/05/2016.
 */
define(()=> {
        'use strict';
        class None extends Object {
            toString() {
                return '[object None]';
            }
        }

        class List {
            constructor(...fns) {
                let list = [()=>new None()];
                fns.forEach(fn=> {
                    list = [fn, list.slice()];
                })
                return list
            };
        }

        function isNone(obj) {
            return obj.toString && obj.toString() === '[object None]';
        };

        function isSimple(obj) {
            return typeof obj == 'boolean' || null == obj || 'object' != typeof obj;
        };

        function isDate(obj) {
            return Object.prototype.toString.call(obj) === '[object Date]';
        };

        function isArray(obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        };

        function isObject(obj) {
            return Object.prototype.toString.call(obj) === '[object Object]';
        };


        function applySimple(simple) {
            return ()=> simple
        };

        function applyDate(date) {
            return ()=> {
                let copy = new Date();
                copy.setTime(date.getTime());
                return copy
            }
        };

        function applyArray(arr) {
            return (fn)=> arr.map(node=>fn(node));
        };

        function applyObj(obj) {
            return (fn)=> {
                let copy = {};
                Object.keys(obj).forEach(attr=> {
                    copy[attr] = fn(obj[attr]);
                })
                return copy;
            }
        };


        function getOrElse(list, obj) {
            if (list) {
                let result = list[0](obj);
                return !isNone(result) ? result : getOrElse(list[1], obj)
            }
        };

        function functor(type, action) {
            return (item)=> {
                return type(item) ? action(item) : new None();
            }
        }

        function iterate(list, fn) {
            return (obj)=> fn(list, obj)(children=>iterate(list, fn)(children));
        }

        return obj=> iterate(new List(functor(isSimple, applySimple), functor(isArray, applyArray), functor(isDate, applyDate), functor(isObject, applyObj)), (list, obj)=>getOrElse(list, obj))(obj);
    }
);