import { Router } from 'express';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';

const routes = new Router();

routes.post('/users', UserController.store);
routes.post('/login', SessionController.store);
routes.get('/test', (req, res) => res.json(req.headers));

export default routes;
