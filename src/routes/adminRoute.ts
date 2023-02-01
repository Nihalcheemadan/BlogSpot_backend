import express  from 'express'
import * as adminController from '../controller/adminController'

const router = express.Router();

router.get('/',adminController.adminDetails);

export default router;