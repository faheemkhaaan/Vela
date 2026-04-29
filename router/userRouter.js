const Router = require('../lib/router')



const router = new Router();

router.get("/testing-router", (req, res) => {
    res.status(200).json({ message: "Hello from test-router" })
})
module.exports = router