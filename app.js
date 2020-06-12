const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const cors = require("cors");
const { request, response } = require("express");

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.all("/:protocol(https?)-:domain/:path*", (req, res) => {
    const protocol = req.params.protocol;
    const domain = req.params.domain;
    const path = req.params.path + req.params[0];
    const query = Object.keys(req.query).map(key => key + '=' + encodeURIComponent(req.query[key])).join('&');
    const newUrl = protocol + "://" + domain + "/" + path + (query ? "?" + query : "");

    res.setHeader("X-Forwarded-To", newUrl);

    axios({
        method: req.method,
        url: newUrl,
        data: req.body
    }).then(response => {
        res.status(response.status).send(response.data);
    }, (error) => {
        res.status(error.response.status).send(error.message);
    });
});

app.all("**", (req, res) => 
{
    res.statusCode = 400;
    res.send("Use this API to forward requests to another API. " +
             "For example, to send a request to http://acme.com/customers/123 " +
             "use the URL [this-url]/http-acme.com/customers/123");
});

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Listening on port ${port}...`));

