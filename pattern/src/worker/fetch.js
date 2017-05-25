import {task} from 'functional/core/Task';
import {routes} from '../shared/shared';
import {htmlHeader} from './headers';


let standartResponse = evt => task(evt).map(async e => {
    let response = await caches.match(e.request);
    return response || await fetch(e.request);
});


let triggerRoute = (evt, res) => {
    let {request} = evt;
    let {pathname} = new URL(request.url);
    routes.trigger({
        path:   pathname,
        method: request.method
    })
        .then(cb => res(cb(evt).map(responseBody => new Response(responseBody, htmlHeader()))))
        .catch(() => res(standartResponse(evt)))
}

let response = event => task(event).flatMap((evt, res) => triggerRoute(evt, res));

export {response};