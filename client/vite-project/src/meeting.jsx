// src/ZoomMeeting.js
import React, { useState, useEffect } from "react";
import _ from "lodash";
window._ = _;
import { ZoomMtg } from "@zoomus/websdk";

ZoomMtg.setZoomJSLib("https://source.zoom.us/2.7.0/lib", "/av");
ZoomMtg.preLoadWasm();
ZoomMtg.prepareJssdk();

const ZoomMeeting = () => {
  const [meetingNumber, setMeetingNumber] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [signature, setSignature] = useState("");
  const [zoomApiKey, setZoomApiKey] = useState("");

  const handleCreateMeeting = async () => {
    if (!meetingNumber || !userName || !userEmail) {
      alert("Please fill all fields");
      return;
    }

    // Request Zoom signature from the backend
    try {
      const response = await fetch(
        "http://localhost:4000/api/zoom/createZoomMeeting",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ meetingNumber, userName, userEmail }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Set the signature and API key from the response
        setSignature(data.signature);
        setZoomApiKey(data.zoomApiKey);

        // Automatically start the Zoom meeting
        startMeeting(data.signature, data.zoomApiKey);
      } else {
        alert(data.message || "Error generating signature");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error generating Zoom signature");
    }
  };

  const startMeeting = (signature, apiKey) => {
    ZoomMtg.init({
      leaveUrl: "http://localhost:3000", // Redirect URL after leaving the meeting
      isSupportAV: true, // Ensure audio/video support
      success: function () {
        ZoomMtg.join({
          signature: signature,
          meetingNumber: meetingNumber,
          userName: userName,
          apiKey: apiKey,
          passWord: "", // If your meeting has a password, set it here
          success: function (res) {
            console.log("Join meeting success");
          },
          error: function (res) {
            console.error(res);
          },
        });
      },
      error: function (res) {
        console.error(res);
      },
    });
  };

  return (
    <div>
      <h1>Create and Join a Zoom Meeting</h1>
      <div>
        <input
          type="text"
          placeholder="Meeting Number"
          value={meetingNumber}
          onChange={(e) => setMeetingNumber(e.target.value)}
        />
        <input
          type="text"
          placeholder="Your Name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Your Email"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
        />
        <button onClick={handleCreateMeeting}>Create Zoom Meeting</button>
      </div>
    </div>
  );
};

export default ZoomMeeting;
