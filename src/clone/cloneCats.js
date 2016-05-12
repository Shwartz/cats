/**
 * Created by guntars on 11/05/2016.
 */
define(()=> {
        'use strict';
        function None() {
            return {
                toString(){
                    return 'none';
                }
            };
        }

        function isNone(obj) {
            return obj.toString && obj.toString() === 'none';
        }

        function isSimple(obj) {
            return typeof obj == 'boolean' || null == obj || 'object' != typeof obj;
        }

        function isDate(obj) {
            return obj instanceof Date;
        }

        function isArray(obj) {
            return obj instanceof Array;
        }

        function isObject(obj) {
            return obj instanceof Object;
        }


        function applySimple(simple) {
            return ()=> simple
        }

        function applyDate(date) {
            return ()=> {
                let copy = new Date();
                copy.setTime(date.getTime());
                return copy
            }
        };
        function applyArray(arr) {
            return (fn)=> arr.map(node=>fn(node));
        }

        function applyObj(obj) {
            return (fn)=> {
                let copy = {};
                Object.keys(obj).forEach(attr=> {
                    copy[attr] = fn(obj[attr]);
                })
                return copy;
            }
        };


        function functor(type, action) {
            return (item)=> type(item) ? action(item) : ()=>None();
        }


        function apply(...args) {
            let iterate = (obj)=> args.map(arg=>arg(obj)((children)=>iterate(children))).filter(item=>!isNone(item))[0];
            return iterate;
        };

        return apply(functor(isSimple, applySimple), functor(isArray, applyArray), functor(isDate, applyDate), functor(isObject, applyObj));
    }
);