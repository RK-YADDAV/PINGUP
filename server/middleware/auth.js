export const protect =async (req, res, next) =>{
    try {
        const {userId} = req.auth();
        if(!userId) {
            return res.status(401).json({success: false, message: 'not Authorized' });
        }
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: error.message });
    }
}