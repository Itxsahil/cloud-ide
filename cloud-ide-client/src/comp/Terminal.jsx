
import {Terminal as XTerminal} from "@xterm/xterm";
import { useRef, useEffect, useState } from "react";
import "@xterm/xterm/css/xterm.css";
import socket from "../socket";

const Terminal = () => {
  const terminalRef = useRef();
  const isRended = useRef(false);
  useEffect(() => {
    if(isRended.current) return;
    isRended.current = true;
    const term = new XTerminal({
      rows: 17,
    });
    term.open(terminalRef.current);
    
    term.onData((data) => {
      socket.emit("terminal:write", data);
    })

    socket.on("terminal:read", onTerminalData);

    function onTerminalData(data) {
      term.write(data);
    }
  }, []);



  return (
    <div>
      <div ref={terminalRef}  id="terminal"/>
    </div>
  )
}

export default Terminal