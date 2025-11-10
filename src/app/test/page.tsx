"use client";

import { useState } from "react";
import { callBackend } from "@/utils";  // uses absolute import

export default function TestBackendPage() {
  const [data, setData] = useState(null);

  async function handleTest() {
    const result = await callBackend();
    setData(result);
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Backend Connection Test</h1>

      <button
        onClick={handleTest}
        style={{ padding: "8px", marginTop: "20px" }}
      >
        Test Backend Connection
      </button>

      {data && (
        <pre style={{ marginTop: "20px" }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
