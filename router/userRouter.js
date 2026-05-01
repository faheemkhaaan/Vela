const Router = require('../lib/router')



const router = new Router();

router.get("/testing-router/:userId/posts/:postId", (req, res) => {
    const { userId, postId } = req.params;
    console.log(userId, postId)
    res.status(200).json({ message: "Hello from test-router" })
})
module.exports = router