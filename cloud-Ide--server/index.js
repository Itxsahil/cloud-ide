const http = require("http");
const express = require("express");
const { Server: SocketServer } = require("socket.io");
const os = require("os");
const pty = require("node-pty");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const chokidar = require("chokidar");

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],

  })
);
const server = http.createServer(app);
const io = new SocketServer({
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.attach(server);

io.on("connection", (socket) => {
  // console.log("a user connected", socket.id);
  socket.on("terminal:write", (data) => {
    ptyProcess.write(data);
  });

  socket.on("fileData:change", async ({ path, code }) => {
    console.log(path, code);
    console.log(path.replaceAll('+', '/'));
  
    fs.writeFile(`./App${path.replaceAll('+', '/')}`, code, (err) => {
      if (err) {
        console.error("Error writing file", err);
        return;
      }
      console.log("File written successfully");
    });
  });
  
});

const shell = os.platform() === "win32" ? "powershell.exe" : "bash";

const ptyProcess = pty.spawn(shell, [], {
  name: "xterm-color",
  cols: 80,
  rows: 30,
  cwd: `${process.env.INIT_CWD}/App` || process.cwd(),
  env: process.env,
});

ptyProcess.onData((data) => {
  // console.log("go data",data);
  io.emit("terminal:read", data);
});

// API to get file structure
app.get("/files", async (req, res) => {
  try {
    const fileTree = await readFileTree("./App");
    res.json({
      tree: fileTree,
    });
  } catch (err) {
    res.status(500).json({ error: "Error reading file tree" });
  }
});

// Start server
server.listen(9000, () => {
  console.log("listening on *:9000");
});

// Function to build the file tree
async function readFileTree(dir) {
  const tree = {};
  async function buildTree(currentDir, currentFile) {
    const files = await fs.promises.readdir(currentDir);
    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const stat = await fs.promises.stat(filePath);
      if (stat.isDirectory()) {
        currentFile[file] = {};
        await buildTree(filePath, currentFile[file]);
      } else {
        currentFile[file] = null; // It's a file
      }
    }
    return currentFile;
  }
  return buildTree(dir, tree);
}



chokidar.watch('./App').on('all', (event, path) => {
  io.emit('file:change', path);
});




app.get("/getFileData/:ipath", async (req, res) => {
  const { ipath } = req.params;
  console.log(ipath)
  // const ipath = "app"
  const filePath = path.join("./App", ipath.replace(/\+/g, '/'));  
  try {
    const data = await fs.promises.readFile(filePath, "utf-8");
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: "Error reading file" });
  }
});