const asyncHandler = (fnc) => {
    return (req,res,next) => {
        Promise.resolve(fnc(req,res,next)).catch((err) => next(err))
    }
}

export {asyncHandler}