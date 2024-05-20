// require('dotenv').config({path: './env'});

import dotnev from "dotenv"
import connectDb from "./db/db.js";

dotnev.config({
    path: './env'
})

connectDb()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed!!", err);
})