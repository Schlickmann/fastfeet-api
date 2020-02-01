import { Router } from 'express';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';

import AuthMiddleware from './app/middlewares/auth';

const routes = new Router();

/**
 * External Routes
 */
routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(AuthMiddleware);
/**
 * Internal Routes
 */

export default routes;
