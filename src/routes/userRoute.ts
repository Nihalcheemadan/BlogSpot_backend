import express  from 'express'
import * as userController from '../controller/userController'
import { Auth, localVariables } from '../middleware/auth'

const router = express.Router();

router.route('/login').post(userController.verifyUser, userController.userLogin);

router.post('/signup',userController.userSignup);

router.route('/update/:uId').put( Auth,userController.updateUser);

router.delete('/:id',userController.deleteUser);

router.get('/users/:userId',userController.getUser);

router.route('/generateOtp').get(userController.verifyUser, localVariables , userController.generateOtp);

router.route('/verifyOtp').get(userController.verifyOtp)

router.route('/createResetSession').get(userController.createResetSession)

router.route('/resetPassword').put(userController.resetPassword);

router.route('/createMail').post(userController.createMail)


export default router; 