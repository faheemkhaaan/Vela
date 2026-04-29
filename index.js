const MyLib = require('./lib/myLib');
const userRouter = require("./router/userRouter")


const app = new MyLib();

// TODO: add middlewars
// TODO: compression 



app.use((req, res, next) => {
    console.log("Global middleware");
    next()
})

function helloWorld(req, res, next) {
    console.log("Hello world from GET /hello endpoint middleware");

    // next();
}
app.use('/users', userRouter);

app.get("/hello", helloWorld, (req, res) => {
    console.log("Hello from the get endpoint callback")



    res.status(200).json({ message: "Success" })
});

// app.post("/post", (req, res) => {
//     console.log("Hello from post endpoint");
//     res.status(200).json({ message: "Hello world" });
// });

// app.patch('/patching/:name', (req, res) => {
//     const name = req.params.name;
// });

// app.delete("/post", (req, res) => {

// })

app.listen(3000, () => {
    console.log(`app listening on http://localhost:${3000}`)
})

