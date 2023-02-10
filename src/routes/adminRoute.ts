import express  from 'express'
import * as adminController from '../controller/adminController'

const router = express.Router();

router.route('/createCategory').post(adminController.createCategory);

router.route('/getCategory').get(adminController.getCategory);

router.route('/getBlog').get(adminController.getBlog);

router.route('/createBlog').get(adminController.createBlog);

router.route('/getUsers').get(adminController.getUsers);


export default router;