/**
 * Created by guntars on 11/05/2016.
 */
define(()=> {
        'use strict';
        class None {
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

        let isNone = (obj)=> obj.toString && obj.toString() === '[object None]';
        let isSimple = (obj)=> typeof obj == 'boolean' || null == obj || 'object' != typeof obj;
        let isDate = (obj)=> Object.prototype.toString.call(obj) === '[object Date]';
        let isArray = (obj)=> Object.prototype.toString.call(obj) === '[object Array]';
        let isObject = (obj)=> Object.prototype.toString.call(obj) === '[object Object]';

        let applySimple = (simple)=> ()=> simple;

        let applyDate = (date)=> ()=> {
            let copy = new Date();
            copy.setTime(date.getTime());
            return copy
        };

        let applyArray = (arr)=> (fn)=> arr.map(node=>fn(node));

        let applyObj = (obj)=> (fn)=> {
            let copy = {};
            Object.keys(obj).forEach(attr=> {
                copy[attr] = fn(obj[attr]);
            })
            return copy;
        };


        let getOrElse = (list, obj) => {
            if (list) {
                let result = list[0](obj);
                return !isNone(result) ? result : getOrElse(list[1], obj)
            }
        };

        let functor = (type, action) => item=> type(item) ? action(item) : new None();
        let iterate = (list, fn)=> (obj)=> fn(list, obj)(children=>iterate(list, fn)(children));

        return obj=> iterate(new List(functor(isSimple, applySimple), functor(isArray, applyArray), functor(isDate, applyDate), functor(isObject, applyObj)), (list, children)=>getOrElse(list, children))(obj);
    }
);