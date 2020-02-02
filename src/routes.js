import { Router } from 'express';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';

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
routes.post('/recipients', RecipientController.store);

export default routes;
