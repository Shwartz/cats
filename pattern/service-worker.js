(function () {
'use strict';

let some = (value) => new Some(value);
let none = () => new None();

class Some {
    constructor(value) {
        this.value = value;
    };

    isSome() {
        return ['[object Some]'].indexOf(this.toString()) !== -1
    };

    isOption() {
        return ['[object Some]', '[object None]'].indexOf(this.toString()) !== -1;
    }

    get() {
        return this.value;
    };

    map(fn) {
        return this.isSome() ? some(fn(this.get())) : none();
    };

    flatMap(fn) {
        let out = fn(this.get());
        if (out.isOption) {
            return out;
        }else{
            throw new ReferenceError('Must return an Option');
        }

    }

    set(value) {
        return some(value);
    };

    isEmpty() {
        return this.value ? false : true;
    };

    getOrElse(defaultVal) {
        return this.isSome() ? this.value : defaultVal
    };

    toString() {
        return '[object Some]';
    };
}

class None extends Some {
    constructor() {
        super();
    };

    isSome() {
        return false;
    };

    set(value) {
        return none();
    };

    toString() {
        return '[object None]';
    };

}

//Define Private methods;
const _create$1 = Symbol('_create');
const _reverse = Symbol('_reverse');
const _map$1 = Symbol('_map');
const _take = Symbol('_take');
const _flatMap$1 = Symbol('_flatMap');
const _filter = Symbol('_filter');

class List {
    constructor(head, ...tail) {
        // split the head and tail pass to new list
        this[_create$1](head, tail.length > 0 ? list(...tail) : none());
    };

    //Private Method
    [_create$1](head, tail) {
        this.head = head !== undefined ? some(head) : none();
        this.tail = tail && tail.isList && tail.isList() && tail.head.isSome && tail.head.isSome() ? tail.copy() : none();
        return this;
    };

    //Private Method
    [_reverse](list) {
        let {head, tail} = this;
        if (head.isSome()) {
            let insert = list.insert(head.get());
            if (tail.isSome && !tail.isSome()) {
                return insert;
            } else {
                return tail[_reverse](insert);
            }
        } else {
            return list;
        }
    };

    //private method
    [_map$1](fn, i = 0) {
        let {head, tail} = this;
        let empty = List.empty();
        return head.isSome() ? empty[_create$1](fn(head.get(), i), tail.isSome && !tail.isSome() ? none() : tail[_map$1](fn, i + 1)) : empty;
    };

    //private method
    [_take](count, i = 1) {
        let {head, tail} = this;
        let empty = List.empty();
        return head.isSome() ? empty[_create$1](head.get(), (tail.isSome && !tail.isSome()) || count <= i ? none() : tail[_take](count, i + 1)) : empty;
    }

    //private method
    [_flatMap$1](fn, i = 0) {
        let {head, tail} = this,
            list = head.isSome() ? fn(head.get(), i) : List.empty();
        return tail.isSome && !tail.isSome() ? list : list.concat(tail[_flatMap$1](fn, i));

    };

    //private method
    [_filter](fn, list = List.empty()) {
        let {head, tail} = this,
            value = head.get(),
            comparison = fn(value);
        let outList = comparison ? list.insert(value) : list;
        return tail.isList && tail.isList() ? tail[_filter](fn, outList) : outList.reverse();
    }

    getOrElse(fn) {
        return this.size() > 0 ? this.map(a => a) : list(fn())
    };

    insert(head) {
        return List.empty()[_create$1](head, this.head ? this : none());
    }

    add(head) {
        return this.reverse().insert(head).reverse();
    }

    copy() {
        return this.map(a => a);
    };

    concat(...lists) {
        let empty = List.empty();
        [this].concat(lists).forEach(list => {
            list.forEach(record => {
                empty = empty.insert(record);
            });
        });
        return empty.reverse();
    };

    reverse() {
        let {head} = this,
            empty = List.empty();
        if (!head.isSome()) {
            return empty;
        } else {
            return this[_reverse](empty);
        }

    };


    foldLeft(a, fn) {
        let func = fn || a,
            initialValue = fn ? a : undefined,
            {head, tail} = this;
        if (!head.isSome()) {
            return initialValue;
        } else if (head.isSome() && tail.isSome && !tail.isSome()) {
            return func(initialValue, head.get());
        } else {
            return tail.foldLeft(func(initialValue, head.get()), func)
        }
    }

    foldRight(a, fn) {
        return this.reverse().foldLeft(a, fn);
    };

    find(fn) {
        let {head, tail} = this,
            value = head.get(),
            comparison = fn(value);

        return comparison ? value : tail.isList && tail.isList() ? tail.find(fn) : none();
    };


    filter(fn) {
        return this[_filter](fn);
    };

    map(fn) {
        return this[_map$1](fn);
    };

    forEach(fn) {
        return this.map(item => {
            fn(item);
            return item;
        })

    }

    flatMap(fn) {
        return this[_flatMap$1](fn);
    };

    size() {
        let count = 0;
        this.forEach(() => count++);
        return count;
    };

    take(count) {
        return this[_take](count);
    };

    toString() {
        return '[object List]'
    };

    isList() {
        return this.toString() === '[object List]';
    };

    toArray() {
        let array = [];
        this.forEach(item => array.push(item));
        return array;
    }

    static empty() {
        return list();
    }


}
let list = (...fns) => new List(...fns);

let pair = (guard, action) => {
        return {guard, action}
    };
let objCopy = obj => {
        let copy = Object.assign({}, obj);
        return (fn) => {
            Object.keys(copy).forEach(attr => {
                copy[attr] = fn(copy[attr]);
            });
            return copy;
        }
    };
let isSimple = (obj) => typeof obj == 'boolean' || null == obj || 'object' != typeof obj;
let isDate = (obj) => Object.prototype.toString.call(obj) === '[object Date]';
let isArray = (obj) => Object.prototype.toString.call(obj) === '[object Array]';
let isObject = (obj) => (!!obj) && (obj.constructor === Object);
let isOther = (obj) => !isDate(obj) && !isArray(obj) && !isObject(obj);
let cloneSimple = (simple) => () => simple;
let cloneDate = (date) => () => {
        let copy = new Date();
        copy.setTime(date.getTime());
        return copy
    };
let cloneArray = (arr) => (fn) => arr.map(fn);
let cloneObj = (obj) => (fn) => objCopy(obj)(fn);
let arrayFunctor = pair(isArray, cloneArray);
let dateFunctor = pair(isDate, cloneDate);
let objectFunctor = pair(isObject, cloneObj);
let otherFunctor = pair(isOther, cloneSimple);
let functors = list(arrayFunctor, dateFunctor, objectFunctor, otherFunctor);
let getFunctor = (obj) => functors.find(fn => fn.guard(obj)).action(obj);
let clone = (obj) => getFunctor(obj)(children => clone(children));

let isFunction = (obj) => !!(obj && obj.constructor && obj.call && obj.apply);
let toFunction = (job) => isFunction(job) ? job : (_, resolve) => resolve(job);
let emptyFn = () => {
    };
/**
 * Task class is for asyns/sync jobs. You can provide 3 types on tasks
 *      @Task((resolve,reject)=>resolve()) // resolve reject params
 *      @Task(()=>3) synchronus function with returning value !important argumentList have to be empty
 *      @Task(3) // Static values
 * */
//Define Private methods;
const _parent = Symbol('_parent');
const _topRef = Symbol('_topRef');
const _topParent = Symbol('_topParent');
const _children = Symbol('_children');
const _resolvers = Symbol('_resolvers');
const _rejecters = Symbol('_rejecters');
const _resolve = Symbol('_resolve');
const _reject = Symbol('_reject');
const _bottomRef = Symbol('_bottomRef');
const _uuid = Symbol('_uuid');
const _create = Symbol('_create');
const _task = Symbol('_task');
const _setPromise = Symbol('_setPromise');
const _setParent = Symbol('_setParent');
const _addParent = Symbol('_addParent');
const _setChildren = Symbol('_setChildren');
const _resolveRun = Symbol('_resolveRun');
const _rejectRun = Symbol('_rejectRun');
const _triggerUp = Symbol('_triggerUp');
const _triggerDown = Symbol('_triggerDown');
const _run = Symbol('_run');
const _map = Symbol('_map');
const _flatMap = Symbol('_flatMap');
const _copyJob = Symbol('_copyJob');
const _getTopRef = Symbol('_getTopRef');
const _getBottomRef = Symbol('_getBottomRef');
const _copy = Symbol('_copy');

class Task {

    constructor(job, parent) {
        this[_parent] = none();
        this[_topRef] = none();
        this[_topParent] = none();
        this[_children] = List.empty();
        this[_resolvers] = List.empty();
        this[_rejecters] = List.empty();
        this[_resolve] = none();
        this[_reject] = none();
        this[_bottomRef] = none();
        this[_uuid] = Symbol('uuid');
        this[_create](job, parent);
    }

    //private function.
    [_create](job, parent) {
        this[_setParent](parent);
        this[_task] = job !== undefined ? some(toFunction(job)) : none();
        return this;
    };

    [_setPromise](job) {
        return (data, res) => new Promise((resolve, reject) => {
            let out = clone(data),
                fn = job.getOrElse((_, resolve) => resolve(out));
            if (res) {
                return (fn.length <= 1) ? resolve(fn(out)) : fn(out, resolve, reject);
            } else {
                return reject(out);
            }
        });
    };

    [_setParent](parent) {
        if (parent && parent.isTask && parent.isTask()) {
            this[_parent] = some(parent[_triggerUp].bind(parent));
            this[_topRef] = some(parent[_getTopRef].bind(parent));
            this[_topParent] = some(parent[_addParent].bind(parent));
        }
    };

    [_addParent](parent) {
        this[_topParent].getOrElse((parent) => {
            parent[_setChildren](this);
            this[_setParent](parent);
        })(parent);
    };

    [_setChildren](children) {
        if (children && children.isTask && children.isTask()) {
            this[_children] = this[_children].insert(children[_run].bind(children));
            this[_bottomRef] = some(children[_getBottomRef].bind(children));
        }

    };

    [_resolveRun](data) {
        this[_resolvers].forEach(fn => fn(data));
        this[_resolve].getOrElse(emptyFn)(clone(data));
        this[_resolve] = none();
        this[_triggerDown](data, true);
        return clone(data);
    };

    [_rejectRun](data) {
        this[_rejecters].forEach(fn => fn(clone(data)));
        this[_reject].getOrElse(emptyFn)(clone(data));
        this[_reject] = none();
        this[_triggerDown](data, false);
        return clone(data);
    };

    [_triggerUp]() {
        return this[_parent].getOrElse(() => this[_run]())();
    };


    [_triggerDown](data, resolve) {
        this[_children].map(child => child(data, resolve));
    };

    [_run](resp, resolve = true) {
        return this[_setPromise](this[_task])(resp, resolve)
            .then(this[_resolveRun].bind(this))
            .catch(this[_rejectRun].bind(this));
    };

    [_map](fn) {
        let job = task(fn, this);
        this[_setChildren](job);
        return job;
    };

    [_flatMap](fn) {
        return this[_map](fn)
            .map((responseTask, res, rej) => {
                if (!(responseTask.isTask && responseTask.isTask())) {
                    rej('flatMap has to return task');
                }
                responseTask.unsafeRun().then(res).catch(rej);
            });
    };

    [_copyJob](parent) {
        let job = task(this[_task].get(), parent);
        job[_resolvers] = this[_resolvers];
        job[_rejecters] = this[_rejecters];


        if (parent) {
            parent[_setChildren](job);
        }
        return job;
    };

    [_getTopRef](uuid, parent) {
        return this[_topRef].getOrElse((uuid, parent) => this[_copy](uuid, parent))(uuid, parent);
    };

    [_getBottomRef](uuid, parent, goNext = false) {
        let copyJob = goNext ? parent : this[_copyJob](parent);
        let next = goNext || this[_uuid] === uuid ? true : false;
        return this[_bottomRef].getOrElse((uuid, job) => job)(uuid, copyJob, next);
    }

    [_copy](uuid) {
        return this[_getBottomRef](uuid);
    };

    copy() {
        return this[_getTopRef](this[_uuid]);
    };


    map(fn) {
        return this[_map](fn);
    };

    flatMap(fn) {
        return this[_flatMap](fn)
    };

    through(joined) {
        let clone$$1 = joined.copy();
        clone$$1[_addParent](this);
        return clone$$1;
    };

    forEach(fn) {
        return this.map((d, res) => {
            fn(d);
            res(d);
        });
    };

    resolve(fn) {
        this[_resolvers] = this[_resolvers].insert(fn);
        return this;
    };

    reject(fn) {
        this[_rejecters] = this[_rejecters].insert(fn);
        return this;
    }

    isTask() {
        return this.toString() === '[object Task]';
    }

    toString() {
        return '[object Task]'
    };

    clear() {
        this[_resolvers] = List.empty();
        this[_rejecters] = List.empty();
        return this;
    }

    /**
     * Method running executor and return Promise.
     * @param resolve executed when resolved
     * @param reject executed when rejected
     * */
    unsafeRun(resolve = emptyFn, reject = emptyFn) {
        return new Promise((res, rej) => {
            this[_resolve] = some((data) => {
                resolve(data);
                res(data);
            });
            this[_reject] = some((data) => {
                reject(data);
                rej(data);
            });
            this[_triggerUp]();
        });
    };


    static empty() {
        return task();
    };
}

let task = (...tasks) => new Task(...tasks);

let load = async (opt) => {
        let res = await fetch(opt.uri, Object.assign({}, opt, {
            headers: Object.assign({
                'Accept':       'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }, opt && opt.headers ? opt.headers : {})
        }));
        return res.json();
    };
let str = obj => Object.keys(obj)
        .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]))
        .join('&');
let fetchTask = task(opt => load(opt));
let getBase = task(opt => Object.assign(
        opt,
        {
            uri:  opt.uri + (opt.body ? '?' + str(opt.body) : ''),
            body: undefined
        }
    ));
let get = getBase.copy()
        .map(opt => Object.assign(
            opt,
            {method: 'get'}
        ))
        .through(fetchTask);
let del = getBase.copy()
        .map(opt => Object.assign(
            opt,
            {method: 'delete'}
        ))
        .through(fetchTask);
let postBase = task(opt => Object.assign(
        {method: 'post'},
        opt,
        {body: JSON.stringify(opt.body || {})})
    );
let post = postBase.copy()
        .map(opt => Object.assign(
            opt,
            {method: 'post'}
        ))
        .through(fetchTask);
let put = postBase.copy()
        .map(opt => Object.assign(
            opt,
            {method: 'put'}
        ))
        .through(fetchTask);

let addScript = (scripts = []) => scripts.map(script => `<script src="${script}"></script>`).join('\n');
let addCss = (css = []) => css.map(style => `<link rel="stylesheet" href="${css}">`).join('\n');
let base = (body, scripts = [], css = []) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Javascrript modifying html pattern</title>
    ` + addScript(scripts) + `
    ` + addCss(css) + `
</head>
<body>
${body}
</body>`;

/**
 * Created by guntars on 24/05/2017.
 */
let combineHeaders = (source = {}, target = {}) => Object.assign({}, source, target, {headers: Object.assign({}, source.headers, target.headers)});
let htmlHeader = (extra = {}) => combineHeaders({
        status:     200,
        statusText: 'OK',
        headers:    {
            'Content-Type':     'text/html',
            'X-Local-Response': 'yes'
        }
    }, extra);

let data = false;
let request = opt => data ? task(data) : task(opt => Object.assign({
    uri:     './products.json',
    headers: {'X-Local-Response': 'yes'}
}, opt))
    .map(opt=>{
        console.log(opt);
        return opt;
    })
    .through(get)
    .resolve(resp => data = resp);

let count = 0;
let addId = task((data) => data.map(item => Object.assign(item, {id: count++})));
/*Just simple template for js arrays*/
let templateInner = data => `<li>${data.id} <strong>Name:</strong> <span>${data.Name}</span> <strong>Price: </strong><span>${data.Price}</span></li>`;
let templateOuter = data => `<ul>${data}</ul>`;


let applyTemplate = addId
/*Apply inner template*/
    .map(data => data.map(item => templateInner(item)))
    .map(data => data.join(''))
    .map(data => templateOuter(data))
    .map(responseBody => new Response(base(responseBody), htmlHeader()));


let customResponse = evt => {
    return task(evt).map(e => new URL(e.request.url))
        // .map(searchParams => searchParams.get('filter'))
        .flatMap(filter => request().map(out => out['products']))
        .through(applyTemplate);
};


let standartResponse = evt => task(evt).map(async e => {
    let response = await caches.match(e.request);
    return response || await fetch(e.request);
});


let response = event => event.request.url.indexOf('index.html')!==-1 ? customResponse(event) : standartResponse(event);

let CACHE_VERSION = 2;
let CURRENT_CACHES = {
        prefetch: `window-cache-v ${CACHE_VERSION}`
    };
let urlsToPrefetch = [
        './index.html',
        './dist/main.js'
    ];


self.addEventListener('install', (event) => {
    console.log('Install event:', event);
    event.waitUntil(
        caches.open(CURRENT_CACHES.prefetch)
            .then(cache => cache.addAll(urlsToPrefetch)
                .then(() => self.skipWaiting()))
            .catch(error => console.error('Pre-fetching failed:', error)));
});

self.addEventListener('activate', (event) => {
    console.log('Activate event:', event);
    self.clients.claim();
    let expectedCacheNames = Object.keys(CURRENT_CACHES).map(key => CURRENT_CACHES[key]);
    event.waitUntil(
        caches.keys()
            .then(cacheNames => Promise.all(
                cacheNames.map(cacheName => {
                    if (expectedCacheNames.indexOf(cacheName) === -1) {
                        console.log('Deleting out of date cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            )));
});

self.addEventListener('fetch', event => {
    console.log('Handling fetch event for', event.request.url);
    event.respondWith(response(event).unsafeRun());
});

}());