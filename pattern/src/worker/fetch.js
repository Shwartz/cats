import {task} from 'functional/core/Task';
import {get} from 'functional/async/Fetch';
import {base} from './template';
import {jsonHeader, htmlHeader} from './headers';

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
}


let standartResponse = evt => task(evt).map(async e => {
    let response = await caches.match(e.request);
    return response || await fetch(e.request);
});


let response = event => event.request.url.indexOf('index.html')!==-1 ? customResponse(event) : standartResponse(event);

export {response};