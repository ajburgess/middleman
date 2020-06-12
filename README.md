# Middleman

Simple workaround to the problem of a borwser-based application (e.g. AngularJS) needing to call an external API which CORS would normally block (becuase the API doesn't include the relevant header).

Let's say you host this node server on http://localhost:8000.

Let's assume the real API URL your browser code is trying to call is https://acme.com/customers/north?sort=name

To bypass CORS, change the URL that the browser code calls to http://localhost:8000/https-acme.com/customers/north?sort=name

Note the slight manginlg you need to do with the start of the real URL: replace http(s)://domain/... with /http(s)-domain/...

Note that this is a simple workaround. Things that should work include:

- Request's HTTP verb is preseved
- Request's (JSON) body is preseved
- Response's HTTP status code and status text is preserved
- Response's (JSON) body is preserved

Note the following limitations:

- Might only work for JSON payloads
- Request's headers are not passed through to target API
- Target API's response headers are not passed through back to browser

Because of the above limitations, this workaround may only be suitable for relatively simple API calls.
