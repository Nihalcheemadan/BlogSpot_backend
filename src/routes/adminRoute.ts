import express  from 'express'
import * as adminController from '../controller/adminController'
import { Auth } from '../middleware/auth'


const router = express.Router();

router.route('/login').post(adminController.adminLogin);
router.route('/authenticate').get(Auth ,adminController.verifyAdmin); //authenticate user
router.route('/userBlock').get(Auth,adminController.userBlock);
router.route('/userUnblock').get(Auth,adminController.userUnblock);
router.get('/dashboard', Auth , adminController.dashboard);

router.route('/createCategory').post(Auth,adminController.createCategory);
router.route('/getCategory').get(Auth,adminController.getCategory);
router.route('/editCategory').put(Auth,adminController.editCategory);
router.route('/deleteCategory').delete(Auth,adminController.deleteCategory)

router.get('/getBlog',Auth,adminController.getBlog);
router.route('/createBlog').post(Auth,adminController.createBlog);
router.route('/getUsers').get(Auth,adminController.getUsers);


export default router;