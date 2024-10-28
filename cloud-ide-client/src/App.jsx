import AceEditor from "react-ace";
import { useEffect, useState } from "react";
import Terminal from "./comp/Terminal";
import FileTree from "./comp/Tree";
import axios from "axios";
import socket from "./socket";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";

function App() {
  const [fileTree, setFileTree] = useState({});
  const [fileData, setFileData] = useState('');
  const [path, setPath] = useState('');

  // Function to load the file tree from the server
  const loadFileTree = async () => {
    try {
      const res = await axios.get("http://localhost:9000/files");
      setFileTree(res.data.tree);
    } catch (error) {
      console.error("Error loading file tree", error);
    }
  };

  useEffect(() => {
    // Load the file tree when the component mounts
    loadFileTree();

    // Listen for the 'file:change' event from the server
    socket.on("file:change", loadFileTree);
  }, []);

  useEffect(() => {
    if (fileData) {
      const timer = setTimeout(() => {
        socket.emit("fileData:change", { path: path.replace(/\//g, "+"), code: fileData });
      }, 3000);
      return () => clearTimeout(timer);  // Clear the timer when unmounting or when fileData changes
    }
  }, [fileData]);
  



  const loadFileData = async (path) => {
    if(!path) return;
    try {
      const res = await axios.get(
        `http://localhost:9000/getFileData/${path.replace(/\//g,"+")}`
      );
      console.log(res.data.data);
      setFileData(res.data.data);
    } catch (error) {
      console.error("Error loading file data", error);
    }
  };


  useEffect(() => {
    if(!path) return;
    loadFileData(path);
  },[path]);

  return (
    <>
      <div className="min-h-screen p-4 bg-gray-100">
        <div className="flex w-full h-[65vh] gap-4">
          {/* Tree Section */}
          <div className="w-1/4 bg-white p-4 border text-gray-700 rounded-lg shadow-md">
            <FileTree onSelect={(path) => {
              setPath(path);
              console.log(path);
            }} tree={fileTree} />
          </div>

          {/* Input Section */}
          <div className="w-full">
            <AceEditor
              mode="javascript"
              theme="github"
              onChange={(e) => setFileData(e)}
              value={fileData}
              name="UNIQUE_ID_OF_DIV"
              editorProps={{ $blockScrolling: true }}
              width="100%" // Ensure it takes the full width of its container
              height="100%" // Ensure it takes the full height
              fontSize={20}
            />
          </div>
        </div>

        {/* Terminal Section */}
        <div className="mt-6">
          <Terminal />
        </div>
      </div>
    </>
  );
}

export default App;
