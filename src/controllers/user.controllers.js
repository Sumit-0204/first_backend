import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessTokenAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken() 

        user.refreshToken =refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something Went Wrong while Generating tokens")
    }
}


const registerUser = asyncHandler( async (req, res) => {
   //get user details from frontend

   const {fullName, email, username, password} = req.body
//    console.log(req.body);

   //validation - not empty
//one method
//    if(fullName == ""){
//     throw new ApiError(400, "fullname is required")
//    }

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

   //check if user allready registrer: username, email

    const existedUser = await User.findOne({
        $or: [{ username },{ email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with username or email already exist")
    }

   //check img avtr

   const avatarLocalPath = req.files?.avatar[0]?.path;
//    const coverImageLocalPath = req.files?.coverImage[0]?.path;

//    console.log(req.files);
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

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
    email,
    password,
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

const loginUser = asyncHandler(async (req, res) =>{
    //req body se data
    const {email, password, username} =req.body
    //username or email
    if (!(username || email)) {  
        throw new ApiError(400, "username or email is required")
    }
    //find the user
    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new ApiError(400, "User does not exist")
    }
    //password check

    const isPassValid = await user.isPasswordCorrect(password)

    if(!isPassValid){
        throw new ApiError(401, "Check Your Password")
    }
    // access and refresh token
    const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id)

    const loggedinUser = await User.findById(user._id).select("-password -refreshToken")
    //send cookie
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken,options).json(
        new ApiResponse(
            200,
            {
                user: loggedinUser, accessToken, refreshToken
            },
            "User logged in suucessfully"
        )
    )


})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, {}, "user logged out"))
})

export { 
    registerUser,
    loginUser,
    logoutUser
}