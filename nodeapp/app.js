const express = require("express");

const app = express();

const PORT = 8080;

app.get("/", (req, res) => {
    res.send("Infra-deploy-aws-2 application is running!");
});

app.get("/hello", (req, res) => {
    res.send("Hello from Infra-deploy-aws-2!");
});

app.listen(PORT, () => {
    console.log(`Application is running on port ${PORT}`);
});