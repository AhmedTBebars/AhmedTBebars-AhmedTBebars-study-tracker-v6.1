import { useState, useEffect } from "react";
import { PictureInPicture } from "lucide-react";

export function PiPCircularTimer() {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (running) {
      timer = setInterval(() => setTime((t) => t + 1), 1000);
    } else if (timer) {
      clearInterval(timer);
    }
    return () => timer && clearInterval(timer);
  }, [running]);

  const minutes = Math.floor(time / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (time % 60).toString().padStart(2, "0");

  const openPiP = async () => {
    const pipWindow = window.open(
      "",
      "PiPTimer",
      "width=200,height=200,alwaysOnTop=yes"
    );
    if (!pipWindow) return;

    pipWindow.document.write(`
      <body style="display:flex;align-items:center;justify-content:center;height:100%;margin:0;background:#111;color:white;font-family:sans-serif;">
        <div style="text-align:center">
          <h2 style="margin-bottom:8px">${minutes}:${seconds}</h2>
          <button onclick="window.close()" style="padding:4px 8px;background:#444;color:white;border:none;border-radius:4px;cursor:pointer">Close</button>
        </div>
      </body>
    `);
    pipWindow.document.close();
  };

  return (
    <button
      onClick={openPiP}
      title="Picture-in-Picture Timer"
      className="p-2 border rounded hover:bg-accent"
    >
      <PictureInPicture className="w-4 h-4" />
    </button>
  );
}
