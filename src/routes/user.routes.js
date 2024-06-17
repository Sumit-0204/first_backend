import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateUser, updateAvatar, updateCoverImage, getUserChannelProfile, getWatchHistory } from "../controllers/user.controllers.js";

import { upload } from "../middlewares/multer.middlewares.js"

import { verifyJwt } from "../middlewares/auth.middlwares.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )
router.route("/login").post(loginUser)

//secure route
router.route("/logout").post(verifyJwt, logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(changeCurrentPassword)

router.route("/current-user").get(verifyJwt,getCurrentUser)

router.route("/update-account").patch(verifyJwt,updateUser)

router.route("/avatar").patch(verifyJwt, upload.single("avatar"), updateAvatar)

router.route("cover-image").patch(verifyJwt, upload.single("/coverImage"), updateCoverImage)

router.route("/c/:username").get(verifyJwt, getUserChannelProfile)

router.route("/history").get(verifyJwt, getWatchHistory)
export default router