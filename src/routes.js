import { Router } from 'express';
import UserAdministratorController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';

import AuthMiddleware from './app/middlewares/auth';

const routes = new Router();

/**
 * External Routes
 */
routes.post('/users', UserAdministratorController.store);
routes.post('/sessions', SessionController.store);

routes.use(AuthMiddleware);
/**
 * Internal Routes
 */

// Administrator users
routes.put('/users', UserAdministratorController.update);

// Recipients
routes.post('/recipients', RecipientController.store);

export default routes;
