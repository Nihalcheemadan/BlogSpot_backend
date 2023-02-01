import express  from 'express'
import * as userController from '../controller/userController'

const router = express.Router();

router.get('/',userController.userLogin);

router.post('/',userController.userSignup);

export default router;