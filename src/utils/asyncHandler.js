const asyncHandler = (fnc) => {
    (req,res,next) => {
        Promise.resolve(fnc(req,res.next)).catch((err) => next(err))
    }
}

export {asyncHandler}