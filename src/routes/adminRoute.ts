import express  from 'express'
import * as adminController from '../controller/adminController'
import { Auth } from '../middleware/auth'


const router = express.Router();

router.route('/login').post(adminController.adminLogin);
router.route('/userBlock').get(adminController.userBlock);
router.route('/userUnblock').get(adminController.userUnblock);
router.get('/dashboard',adminController.dashboard);

router.route('/createCategory').post(adminController.createCategory);
router.route('/getCategory').get(adminController.getCategory);
router.route('/editCategory').put(adminController.editCategory);
router.route('/deleteCategory').delete(adminController.deleteCategory)

router.get('/getBlog',adminController.getBlog);
router.route('/createBlog').post(adminController.createBlog);
router.route('/getUsers').get(adminController.getUsers);


export default router;