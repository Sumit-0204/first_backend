// require('dotenv').config({path: './env'});

import dotnev from "dotenv"
import connectDb from "./db/db.js";

dotnev.config({
    path: './env'
})

connectDb()