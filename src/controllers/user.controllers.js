import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";



const registerUser = asyncHandler( async (req, res) => {
   //get user details from frontend

   const {fullName, email, username, password} = req.body
   console.log("email: ", email);

   //validation - not empty
//one method
//    if(fullName == ""){
//     throw new ApiError(400, "fullname is required")
//    }

    if (
        [fullName, email, username, password].some((field) => 
            field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

   //check if user allready registrer: username, email

    const existedUser = User.findOne({
        $or: [{ username },{ email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with username or email already exist")
    }

   //check img avtr

   const avatarLocalPath = req.files?.avatar[0]?.path;
   const coverImageLocalPath = req.files?.coverImage[0]?.path;

   if (!avatarLocalPath) {
    throw new ApiError(400, "avatar file is required")
   }

   //upload them cloudinary
   const avatar = await uploadOnCloudinary(avatarLocalPath)
   const coverImage = await uploadOnCloudinary(coverImageLocalPath)

   if (!avatar) {
    throw new ApiError(400, "avatar file is required")
   }

   //create user object - create entry  in db

    const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,password,
    username: username.toLowerCase()
   })

   //remove pass and refresh token
   //check for user creation
   //return res

   const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
   )

   if(!createdUser){
    throw new ApiError(500, "Something went wrong while creating")
   }

   return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
   )

})


export { 
    registerUser,
}