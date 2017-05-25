import express from 'express';
import {routes} from './shared/shared';
import {join} from 'path';
import {URL} from 'url';
const app = express();

app.use('/dist', express.static(join(__dirname, 'dist')));
app.use('/service-worker.js', express.static(__dirname + '/service-worker.js'));

app.use((req, res, next) => {
    routes.trigger({
        path:   req.originalUrl,
        method: req.method
    })
        .then(async cb => res.send(await cb().unsafeRun()))
        .catch(() => next());
});

app.get('/:id', (req, res) => {
    res.send(req.params.id);
});

app.listen(3000, () => {
    console.log('Example app listening on port 3000!')
});