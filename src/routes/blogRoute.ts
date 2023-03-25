import express  from 'express'
import * as postController from '../controller/postController'
import { Auth } from '../middleware/auth'


const router = express.Router();

router.post("/createBlog", Auth , postController.createBlog ) 

router.put("/comment/post" , Auth, postController.commentBlog);
router.post("/comments" ,  postController.getComments);
// router.post('/getUserComment',Auth, postController.getUserComment);
router.put("/likeBlog" ,Auth , postController.likeBlog);
router.put("/saveBlog" ,Auth , postController.saveBlog);
router.post('/getSingleBlog',Auth,postController.getSingleBlog);

router.get("/get/post/:id",postController.uploadBlog );
router.post("/updateBlog" , Auth , postController.updateBlog);
router.delete("/deleteBlog" , Auth, postController.deleteBlog);

router.post("/following" , Auth, postController.getFollowing); 
router.get("/followers/:id" , postController.getFollowers);

router.route('/blockBlog').patch(postController.blockBlog);
router.route('/unblockBlog').patch(postController.unblockBlog);
router.route('/reportBlog').post( Auth, postController.reportBlog)

export default router;  