import express from 'express';
import {routes} from './shared/shared';
import {join} from 'path';
import {URL} from 'url';
const app = express();

app.use('/dist', express.static(join(__dirname, 'dist')));
app.use('/service-worker.js', express.static(__dirname + '/service-worker.js'));
app.use('/products.json', express.static(__dirname + '/products.json'));

app.use((req, res, next) => {
    routes.trigger({
        path:   req.originalUrl,
        method: req.method
    })
        .then(async cb => {
            let resp = await cb().unsafeRun();
            res.send(resp);
        })
        .catch(() => next())
});

app.use('/dist', express.static('dist'))

app.get('/hello', (req, res) => {
    res.send('hello');
});


app.listen(3000, () => {
    console.log('Example app listening on port 3000!')
});