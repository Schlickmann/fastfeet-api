import { Router } from 'express';
import UserAdministratorController from './app/controllers/UserAdministratorController';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import DeliverymanController from './app/controllers/DeliverymanController';

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
routes.get('/recipients', RecipientController.index);
routes.get('/recipients/:id', RecipientController.show);
routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);
routes.delete('/recipients/:id', RecipientController.delete);

// Deliveryman
routes.get('/couriers', DeliverymanController.index);
routes.get('/couriers/:id', DeliverymanController.show);
routes.post('/couriers', DeliverymanController.store);
routes.put('/couriers/:id', DeliverymanController.update);
routes.delete('/couriers/:id', DeliverymanController.delete);

export default routes;
