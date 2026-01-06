import React from "react";

export default function ChatbotEmbed() {
  return (
    <div className="fixed bottom-6 right-6 w-[350px] h-[550px] z-50">
      <div className="w-full h-full rounded-2xl shadow-2xl overflow-hidden border bg-white">
        <iframe
          src="http://192.168.0.120:8000/embed"
          allow="microphone"
          className="w-full h-full border-0"
        ></iframe>
      </div>
    </div>
  );
}
