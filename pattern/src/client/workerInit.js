'use strict';

let waitUntilInstalled = (registration) => new Promise((resolve, reject) => {
    let {installing} = registration;
    if (installing) {
        installing.addEventListener('statechange', (e) => {
            if (e.target.state == 'activated') {
                resolve();
            } else if (e.target.state == 'redundant') {
                reject();
            }
        });
    } else {
        resolve();
    }
});

let swRun = (opt ={scope: './'}) => new Promise((res, rej) => {
    if ('serviceWorker' in navigator) {
        (async () => {
            let registration = await navigator.serviceWorker.register('./service-worker.js', opt)
            await waitUntilInstalled(registration);
            res();
        })()
    } else {
        // The current browser doesn't support service workers.
        rej('Service Worker not available!');
    }
});

export {
    swRun
};