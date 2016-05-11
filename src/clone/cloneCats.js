/**
 * Created by guntars on 11/05/2016.
 */
define(()=> {
    'use strict';

    function isSimple(obj) {
        return null == obj || "object" != typeof obj;
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
        return simple;
    }

    function applyDate(date) {
        let copy = new Date();
        copy.setTime(date.getTime());
        return copy;
    }

    function applyArray(arr) {
        return arr.map(node=>clone(node));
    }

    function applyObj(obj) {
        let copy = {};
        Object.keys(obj).forEach(attr=> {
            copy[attr] = clone(obj[attr]);
        })
        return copy;
    }

    function apply(...args) {
       return (item)=>args.filter(arg=>arg[0](item)).map(arg=>arg[1](item))[0];
    };


    function clone(obj) {
        return apply([isSimple, applySimple],[isArray, applyArray],[isDate, applyDate],[isObject, applyObj])(obj);
        throw new Error("Unable to copy obj! Its type isn't supported.");
    }

    return clone;
});