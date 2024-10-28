
import { useState } from "react";
import { FaFolder, FaFolderOpen, FaFile } from "react-icons/fa";

const FileTreeNode = ({ filename, nodes, onSelect, path }) => {
    const [isOpen, setIsOpen] = useState(false);
    const isDirectory = nodes !== null;

    const toggleOpen = () => {
        if (isDirectory) setIsOpen(!isOpen);
    };

    return (
        <div className="flex flex-col ml-4">
            <div
                className={`flex items-center cursor-pointer gap-2 p-1 rounded hover:bg-pink-100 transition-colors`}
                onClick={toggleOpen}
            >
                {/* Icons for files and folders */}
                {isDirectory ? (
                    isOpen ? <FaFolderOpen className="text-yellow-500" /> : <FaFolder className="text-yellow-500" />
                ) : (
                    <FaFile className="text-gray-500" />
                )}
                {/* File or folder name */}
                <span 
                onClick={() => {
                  if(!isDirectory) onSelect(path);

                }}
                className={`text-gray-800 ${isDirectory ? "font-semibold" : ""}`}>
                    {filename}
                </span>
            </div>

            {/* Render nested nodes if directory is open */}
            {isOpen && nodes && (
                <ul className="ml-6">
                    {Object.keys(nodes).map((key) => (
                        <li key={key}>
                            <FileTreeNode key={key} path={path + "/" + key} filename={key} nodes={nodes[key]}  onSelect={onSelect}/>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

const FileTree = ({ tree, onSelect }) => {
  return (
      <div className="flex flex-col gap-2">
          <FileTreeNode filename="/" path="" nodes={tree} onSelect={onSelect} />
      </div>
  );
};


export default FileTree;