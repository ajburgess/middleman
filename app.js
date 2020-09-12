const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.disable('etag');
app.disable('x-powered-by');

// Serve static files from the public folder, if the url matches the filename
app.use(express.static('public'));

// Convert / to /home.html
app.get('/', (req, res, next) => {
    res.status(200).sendFile(__dirname + '/public/home.html');
});

// Handle ALL requests to this middleman server
app.all("**", async (req, res, next) => {
    let protocol = undefined;
    let domain = undefined;
    let path = undefined;

    // Regex for the special pattern http(s)-domain/path
    const regex1 = /(?<protocol>https?)-(?<domain>[^\/]+)\/?(?<path>.*)/;
    const urlMatch = regex1.exec(req.url);

    // Regex for extracting the protocol and domain from the referer (when request is /path)
    const regex2 = /(?<protocol>https?)-(?<domain>[^\/]+)\/?(?<path>.*)/;
    const refererMatch = regex2.exec(req.headers.referer);

    if (urlMatch) {
        // URL contained the special pattern to forwrd the request to another domain
        protocol = urlMatch.groups.protocol;
        domain = urlMatch.groups.domain;
        path = urlMatch.groups.path;
    } else if (refererMatch) {
        // URL is just a plain path, like /images/logo.gif
        // So stay on the new domain
        protocol = refererMatch.groups.protocol;
        domain = refererMatch.groups.domain;
        path = req.url.startsWith('/') ? req.url.substring(1) : req.url;
    } else {
        // Some file within this domain was asked for - can't do that
        // So display information to the user about how this website works
        res.status(200).sendFile(__dirname + '/public/home.html');
        return;
    }

    const newUrl = `${protocol}://${domain}/${path}`;

    res.setHeader("X-Forwarded-To", newUrl);

    try {
        const response = await axios({
            method: req.method,
            url: newUrl,
            data: req.body,
            responseType: 'arraybuffer'
        });

        let content = Buffer.from(response.data, 'binary');
        res.status(response.status).contentType(response.headers['content-type']).send(content);
    }
    catch (error) {
        res.status(error.response.status).send(error.message);
    }
});

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Listening on port ${port}...`));

