import { Router } from 'express';
import multer from 'multer';
import UserAdministratorController from './app/controllers/UserAdministratorController';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import DeliverymanController from './app/controllers/DeliverymanController';
import FileController from './app/controllers/FileController';

import AuthMiddleware from './app/middlewares/auth';

import multerConfig from './config/multer';

const routes = new Router();
const upload = multer(multerConfig);

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
routes.get('/users', UserAdministratorController.index);
routes.get('/users/:id', UserAdministratorController.show);
routes.put('/users', UserAdministratorController.update);
routes.delete('/users/:id', UserAdministratorController.delete);
routes.post('/files', upload.single('file'), FileController.store);

// Recipients
routes.get('/recipients', RecipientController.index);
routes.get('/recipients/:id', RecipientController.show);
routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);
routes.delete('/recipients/:id', RecipientController.delete);

// Couriers
routes.get('/couriers', DeliverymanController.index);
routes.get('/couriers/:id', DeliverymanController.show);
routes.post('/couriers', DeliverymanController.store);
routes.put('/couriers/:id', DeliverymanController.update);
routes.delete('/couriers/:id', DeliverymanController.delete);

export default routes;
