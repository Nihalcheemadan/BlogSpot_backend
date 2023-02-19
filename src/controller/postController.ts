import { RequestHandler } from "express";
import blogModel from "../models/blogModel";
import userModel ,{ IUser } from "../models/userModel";

//Following
export const followingUsers:RequestHandler =  (async(req , res)=>{
  if(req.params.id !== req.body.user){
      const user:any = await userModel.findById(req.params.id);
      const otheruser:any = await userModel.findById(req.body.user);
      if(!user.Followers.includes(req.body.user)){
          await user.updateOne({$push:{Followers:req.body.user}});
          await otheruser.updateOne({$push:{Following:req.params.id}});
          return res.status(200).json("User has followed");
      }else{
          await user.updateOne({$pull:{Followers:req.body.user}});
          await otheruser.updateOne({$pull:{Following:req.params.id}});
          return res.status(200).json("User has Unfollowed");
      }
  }else{
      return res.status(400).json("You can't follow yourself")
  }
})

//Fetch post from following
export const followingPost:RequestHandler = (async(req , res)=>{
  try {
      const user:any = await userModel.findById(req.params.id);
      const followersPost:any = await Promise.all(
          user.Following.map((item:any)=>{
              return blogModel.find({user:item})
          })
      )
      const userPost = await blogModel.find({user:user._id});

      res.status(200).json(userPost.concat(...followersPost));
  } catch (error) {
      return res.status(500).json("Internal server error")
  }
})

//get user details for post
// router.get("/post/user/details/:id" , async(req , res)=>{
//   try {
//       const user = await userModel.findById(req.params.id);
//       if(!user){
//           return res.status(400).json("User not found")
//       }
//       const {email , password , phonenumber , ...others}=user._doc;
//       res.status(200).json(others);
//   } catch (error) {
//       return res.status(500).json("Internal server error")
//   }
// })



// get user to follow
export const getUserToFollow: RequestHandler = async (req, res) => {
  try {
    const allUsers: IUser[] = await userModel.find();
    const user: IUser | null = await userModel.findById(req.params.id);
    const followingUserIds: string[] = user ? user.Following : [];
    const followingUsers: IUser[] = await userModel.find({
      _id: { $in: followingUserIds },
    });
    const usersToFollow: IUser[] = allUsers.filter((val) => {
      return !followingUserIds.includes(val._id.toString());
    });
    // const filteredUsers: Omit<IUser, 'Followers' | 'Following'>[] =
    //   usersToFollow.map((item) => {
    //     const { email, ...others } = item.toObject();
    //     return others;
    //   });
    // res.status(200).json(filteredUsers);
  } catch (error) {
    console.log(error);
  }
};