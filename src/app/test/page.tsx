/*"use client";

import { useState } from "react";
import { callBackend } from "../../utils";

export default function TestBackendPage() {
  const [data, setData] = useState(null);

  async function handleTest() {
    console.log("Button clicked!");
    const result = await callBackend();
    console.log("Backend result:", result);
    setData(result);
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Backend Connection Test</h1>

      <button
        onClick={handleTest}
        style={{ padding: "8px", marginTop: "20px" }}
      >
        Test Backend Connection take 2
      </button>

      {data && (
        <pre style={{ marginTop: "20px" }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}*/
export default function TestPage() {
  return <div style={{ padding: 40 }}>Test page disabled.</div>;
}

