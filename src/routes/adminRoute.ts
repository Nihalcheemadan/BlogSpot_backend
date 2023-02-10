import express  from 'express'
import * as adminController from '../controller/adminController'

const router = express.Router();

router.route('/createCategory').post(adminController.createCategory);


export default router;