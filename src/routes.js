import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/Multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import ProviderController from './app/controllers/ProviderController';
import AppointmentController from './app/controllers/AppointmentController';
import ScheduleController from './app/controllers/ScheduleController';
import NotificationsController from './app/controllers/NotificationsController';

import tokenVal from './middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/login', SessionController.store);

routes.use(tokenVal);

routes.put('/update', UserController.update);
routes.post('/files', upload.single('file'), FileController.store);
routes.get('/providers', ProviderController.index);
routes.post('/appointment', AppointmentController.store);
routes.get('/appointment', AppointmentController.index);

routes.get('/schedule', ScheduleController.index);
routes.get('/notifications', NotificationsController.index);
routes.put('/notifications/:id', NotificationsController.update);

export default routes;
