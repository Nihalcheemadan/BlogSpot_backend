import express  from 'express'
import * as userController from '../controller/userController'
import { Auth, localVariables } from '../middleware/auth'

const router = express.Router();

//  post requests //
router.route('/signup').post(userController.userSignup);
router.route('/login').post(userController.verifyUser, userController.userLogin);
router.route('/authenticate').post(userController.verifyUser,(req,res) => res.end()); //authenticate user
router.route('/createMail').post(userController.createMail);

// get requests //
router.route('/generateOtp').get( localVariables , userController.generateOtp);
router.route('/users/:username').get(userController.getUser);
router.route('/verifyOtp').get(userController.verifyOtp);
router.route('/createResetSession').get(userController.createResetSession);
router.route('/verifySignup').post(userController.verifySignup);

// put requests // 
router.route('/update').put( Auth,userController.updateUser);
router.route('/resetPassword').put(userController.verifyUser,userController.resetPassword);

// delete requests //
router.route('/:id').delete(userController.deleteUser);

 
export default router;