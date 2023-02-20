import express  from 'express'
import * as postController from '../controller/postController'
import { Auth } from '../middleware/auth'


const router = express.Router();

router.post("/createBlog", Auth , postController.createBlog ) 

router.put("/comment/post" , Auth, postController.commentBlog);
router.post("/comments" ,  postController.getComments);
// router.post('/getUserComment',Auth, postController.getUserComment);
router.put("/likeBlog" ,Auth , postController.likeBlog)

router.get("/get/post/:id",postController.uploadBlog )
router.put("/update/post/:id" , Auth , postController.updateBlog)
router.delete("/delete/post/:id" , Auth, postController.deleteBlog);

router.get("/following/:id" , postController.getFollowing);
router.get("/followers/:id" , postController.getFollowers);

export default router;  