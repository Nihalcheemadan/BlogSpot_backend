import express  from 'express'
import * as adminController from '../controller/adminController'
import { Auth } from '../middleware/auth'


const router = express.Router();

router.route('/login').post(adminController.adminLogin);

router.route('/userBlock/:id').get(adminController.userBlock);

router.route('/userUnblock/:id').get(adminController.userUnblock);

router.route('/createCategory').post(adminController.createCategory);

router.route('/getCategory').get(adminController.getCategory);

router.get('/getBlog',adminController.getBlog);

router.route('/createBlog').post(adminController.createBlog);

router.route('/getUsers').get(adminController.getUsers);


export default router;