/**
 * Created by guntars on 11/05/2016.
 */
define(()=> {
        'use strict';
        // defining none for empty placement (null, false, undefined or -1 can be part of object
        class None {
            toString() {
                return '[object None]';
            }
        }
        // shortcut for avoiding new
        let none = ()=> new None();

        // list class will take a list of functors, and execute them
        class List {
            constructor(...fns) {
                // split the head and tail pass to new list
                this.head = fns[0];
                var slice = fns.slice(1);
                this.tail = slice.length > 0 ? list(...slice) : none();
            };

            getOrElse(obj) {
                //take functor and executes returnin none or some
                let head = this.head,
                    tail = this.tail,
                    result = head(obj);
                return !isNone(result) ? result : tail.getOrElse(obj)
            };

            traverse(obj) {
                // traverse function will traverse over object childrens
                return this.getOrElse(obj)(children=>this.traverse(children))
            };
        }
        let list = (...fns)=>new List(...fns);

        //functor taking guard and doing action
        let functor = (guard, action) => item=> guard(item) ? action(item) : none();

        //Guards
        let isNone = (obj)=> obj.toString && obj.toString() === '[object None]',
            isSimple = (obj)=> typeof obj == 'boolean' || null == obj || 'object' != typeof obj,
            isDate = (obj)=> Object.prototype.toString.call(obj) === '[object Date]',
            isArray = (obj)=> Object.prototype.toString.call(obj) === '[object Array]',
            isObject = (obj)=> Object.prototype.toString.call(obj) === '[object Object]';

        // Cloning actions, for different types
        let cloneSimple = (simple)=> ()=> simple,
            cloneDate = (date)=> ()=> {
                let copy = new Date();
                copy.setTime(date.getTime());
                return copy
            },
            cloneArray = (arr)=> (fn)=> arr.map(node=>fn(node)),
            cloneObj = (obj)=> (fn)=> {
                let copy = {};
                Object.keys(obj).forEach(attr=> {
                    copy[attr] = fn(obj[attr]);
                })
                return copy;
            };
        // Define functors, with guards and actions
        let simpleFunctor = functor(isSimple, cloneSimple),
            arrayFunctor = functor(isArray, cloneArray),
            dateFunctor = functor(isDate, cloneDate),
            objectFunctor = functor(isObject, cloneObj);
        //take all functors in a list.
        let functors =list(simpleFunctor, arrayFunctor, dateFunctor, objectFunctor);

        //take object and traverse over the list of functors
        return obj=> functors.traverse(obj);
    });