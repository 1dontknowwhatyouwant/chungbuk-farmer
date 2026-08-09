const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.MOCK_AUTH_PORT || 4000);
const USERS_FILE = path.resolve(__dirname, "../data/users.json");

const ensureUsersFile = () => {
  if (!fs.existsSync(USERS_FILE)) {
    fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
    fs.writeFileSync(USERS_FILE, "[]\n");
  }
};

const readUsers = () => {
  ensureUsersFile();

  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
  } catch {
    return [];
  }
};

const writeUsers = (users) => {
  ensureUsersFile();
  fs.writeFileSync(USERS_FILE, `${JSON.stringify(users, null, 2)}\n`);
};

const sendJson = (response, statusCode, data) => {
  response.writeHead(statusCode, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(data));
};

const readRequestBody = (request) =>
  new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });

const server = http.createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    sendJson(response, 200, {});
    return;
  }

  if (request.url === "/users" && request.method === "GET") {
    sendJson(response, 200, readUsers());
    return;
  }

  if (request.url === "/users" && request.method === "POST") {
    try {
      const user = await readRequestBody(request);
      const users = readUsers();
      const nextUsers = [
        ...users.filter((savedUser) => savedUser.email !== user.email),
        user,
      ];

      writeUsers(nextUsers);
      sendJson(response, 201, user);
    } catch {
      sendJson(response, 400, { message: "Invalid request body" });
    }
    return;
  }

  if (request.url === "/login" && request.method === "POST") {
    try {
      const { email, password } = await readRequestBody(request);
      const user = readUsers().find(
        (savedUser) =>
          savedUser.email === email && savedUser.password === password
      );

      if (!user) {
        sendJson(response, 401, { message: "Invalid credentials" });
        return;
      }

      sendJson(response, 200, user);
    } catch {
      sendJson(response, 400, { message: "Invalid request body" });
    }
    return;
  }

  if (request.url === "/users" && request.method === "DELETE") {
    try {
      const { email } = await readRequestBody(request);
      const users = readUsers();
      const nextUsers = users.filter((savedUser) => savedUser.email !== email);

      writeUsers(nextUsers);
      sendJson(response, 200, { deleted: users.length !== nextUsers.length });
    } catch {
      sendJson(response, 400, { message: "Invalid request body" });
    }
    return;
  }

  sendJson(response, 404, { message: "Not found" });
});

server.listen(PORT, () => {
  console.log(`Mock auth server running at http://localhost:${PORT}`);
  console.log(`Users are stored in ${USERS_FILE}`);
});
