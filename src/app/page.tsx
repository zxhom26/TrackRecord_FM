//import Image from "next/image";

"use client";

import React, {Component} from "react";

class Home extends Component{
  render(){
    return (
      <main 
      // lines 12 - 23: sets background color
      style = {{
        padding: "2rem",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#d6d3e6",
        position: "relative",
        overflow: "hidden"
        }}
        

        // lines 27-75 create a wave at the top
        >
        <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "200px",
      zIndex: 0,
    }}

    >
      <svg
      xmlns = "http://www.w3.org/2000/svg"
      viewBox= "0 0 1440 320"
      preserveAspectRatio = "none"
      style={{
        width: "100%",
        height: "100%",
        display: "block"
      }}
    >   

    <path
    fill="url(#gradient)"
    fillOpacity = "1"
    d="M0,64
    L64,101.3
    C120,139,240,213,360,229.3
    C480,245,600,203,720,176
    C840,149,960,139,1080,160
    C1200,181,1320,235,1380,261.3
    L1440,288L1440,0
    L1380,0
    C1320,0,1200,0,1080,0
    C960,0,840,0,720,0
    C600,0,480,0,360,0
    C240,0,120,0,60,0L0,0Z"
    ></path>
<defs>
        <linearGradient id="gradient" x1="10%" y1="0%" x2="100%" y2="0%">
          <stop offset="25%" stopColor="rgba(73,18,87,0.8)" />
          <stop offset="50%" stopColor="rgba(204,88,142,0.8)"/>
          <stop offset="75%" stopColor="rgba(89,90,181,0.8)" />
          <stop offset="100%" stopColor="rgba(101,129,199,0.8)" />
        </linearGradient>
      </defs>
    </svg>
  </div>

        

        {/* home icon */}
        <div
        style={{
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          backgroundColor: "rgba(214, 211, 230,0.7)",
          position: "absolute",
          top: "7.5%",
          right: "0%",
          transform: "translate(-50%, -50%)",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "10px",
          textAlign: "center",
        }}
        >
           <p 
            style={{margin: 0, fontSize: "20px", fontWeight: "bold", fontFamily: "'Playfair Display', serif" }}
            >
              🏠
          </p>

        </div>

        

        {/* left panel*/}
        <div
        style={{
          width: "250px",
          height: "900px",
          background: "#e8e6f2",
          position: "absolute",
          top: "0%",
          left: "0%",
          transform: "transform(-50%, -50%)",
          zIndex: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "10px",
          textAlign: "center",
          color: "#4d4675",
        }}
        >
          <p style = {{marginBottom: "50rem", fontSize: "25px",fontWeight: "bold", fontFamily: "'Inter', sans-serif"}}>
          TrackRecordFM
          </p>
        </div>

        <div
        style={{
          width: "900px",
          height: "600px",
          borderRadius: "20px",
          backgroundColor: "rgba(232,230,242)",
          position: "absolute",
          top: "25%",
          left: "27.5%",
          transform: "transform(-50%, -50%)",
          zIndex: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "10px",
          textAlign: "center",
          color: "#000000",
        }}
        >
          <p style={{ margin: 0, fontSize: "20px", fontWeight: "bold", fontFamily: "'Playfair Display', serif" }}>
          Hi! just messing around with different stuff on next.js. we can change this interface layout later 
          </p>

        </div>
      </main>
    )
  }
}
export default Home;