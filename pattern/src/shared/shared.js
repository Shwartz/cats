import {task} from 'functional/core/Task';
import {base} from '../html/base';
import {test} from '../widgets/test/Test';
import {testA} from '../widgets/testA/TestA';
import {router} from './router';


let routes = router();

routes.get('/test', () => task(() => base(test())));
routes.get('/testa', () => task(() => base(testA())));

export {routes};