const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");

const port = Number(process.env.PORT || 5173);
const host = process.env.HOST || "0.0.0.0";
const root = path.join(__dirname, "public");

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

function localUrls() {
  const urls = [`http://localhost:${port}`];
  for (const details of Object.values(os.networkInterfaces())) {
    for (const item of details || []) {
      if (item.family === "IPv4" && !item.internal) {
        urls.push(`http://${item.address}:${port}`);
      }
    }
  }
  return urls;
}

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);
  const pathname = decodeURIComponent(requestUrl.pathname);
  const safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  const requestedFile = safePath === "/" ? "index.html" : safePath.slice(1);
  const filePath = path.join(root, requestedFile);

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "content-type": types[path.extname(filePath)] || "application/octet-stream",
      "cache-control": "no-store"
    });
    response.end(content);
  });
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Try PORT=5174 npm start.`);
  } else if (error.code === "EPERM") {
    console.error(`Could not bind to ${host}:${port}. Try HOST=127.0.0.1 npm start for local-only access.`);
  } else {
    console.error(error);
  }
  process.exit(1);
});

server.listen(port, host, () => {
  console.log("Snake is running:");
  for (const url of localUrls()) {
    console.log(`  ${url}`);
  }
});
