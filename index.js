const MyLib = require('./lib/myLib');

const server = new MyLib();

server.get("/hello/world", (req, res) => {
    console.log("Hello from the get endpoint")


});

server.post("/post", (req, res) => {
    console.log("Hello from post endpoint");
    res.status(200).json({ message: "Hello world" });
});

server.patch('/patching/:name', (req, res) => {
    const name = req.params.name;
});

server.delete("/post", (req, res) => {

})

server.listen(3000, () => {
    console.log(`Server listening on http://localhost:${3000}`)
})

