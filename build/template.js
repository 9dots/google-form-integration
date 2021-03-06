module.exports = html => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <script
      src="https://browser.sentry-cdn.com/4.1.0/bundle.min.js"
      crossorigin="anonymous"
    ></script>
    <link rel="shortcut icon" href="/favicon.ico" />
    <title>React App</title>
    <link href="/static/css/main.5487d647.css" rel="stylesheet" />
  </head>
  <body>
    <div id="root">${html}</div>
    <script type="text/javascript" src="/static/js/main.a2fee29c.js"></script>
  </body>
</html>
`
