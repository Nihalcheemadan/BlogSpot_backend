import express  from 'express'
import * as userController from '../controller/userController'
import { Auth, localVariables } from '../middleware/auth'
import * as chatController from '../controller/chatController'
import * as postController from '../controller/postController'

const router = express.Router();

//  post requests //
router.route('/signup').post(userController.userSignup);
router.route('/login').post( userController.userLogin);
router.route('/authenticate').get(Auth ,userController.verifyUser); //authenticate user
router.route('/createMail').post(userController.createMail);

router.route('/sendMessage').post(Auth, chatController.sendMessage); 


// get requests //
router.route('/generateOtp').get( localVariables , userController.generateOtp);
router.route('/users/:username').get(userController.getUser);
router.route('/verifyOtp').get(userController.verifyOtp);
router.route('/createResetSession').get(userController.createResetSession);
router.route('/verifySignup').post(userController.verifySignup);

router.route('/getMessages').get(Auth, chatController.getMessage)
router.get('/getBlogs',Auth,userController.getBlog);


// put requests // 
router.route('/updateProfile').put( Auth,userController.updateUser);
router.post('/premiumUser',Auth,userController.premiumUser);
router.route('/resetPassword').put(userController.verifyUser,userController.resetPassword);

// delete requests //

router.route("/following/:id").put( Auth ,userController.userFollowing )
router.get("/getFollowers" , userController.followUser)
router.get("/categories",userController.getCategories)
router.get("/userDetails", Auth, userController.userDetails)

router.post("/updateGallery", Auth,userController.updateGallery);
router.post("/galleryDelete",Auth,userController.galleryDelete) 



// router.get("/flw/:id" , Auth , userController.followingPost);
// router.get("/post/user/details/:id" , userController.getUserDetailsforPost);


export default router;