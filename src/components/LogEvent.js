import React, { useState } from "react";
import { getContract } from "../contract";

function LogEvent() {
  const [tokenId, setTokenId] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const logEvent = async () => {
    if (!tokenId || !description) {
      setStatus("Token ID and Event Description are required.");
      return;
    }

    setLoading(true);
    setStatus("Processing event log...");

    try {
      const contract = await getContract();

      // 检查用户是否有权限
      const tokenOwner = await contract.ownerOf(tokenId);
      const currentUser = await contract.signer.getAddress();

      if (currentUser.toLowerCase() !== tokenOwner.toLowerCase()) {
        setStatus("You are not authorized to log events for this Token ID.");
        return;
      }

      // 调用智能合约的 logEvent 方法
      const tx = await contract.logEvent(tokenId, description);
      console.log("Transaction sent:", tx);

      // 等待交易完成
      await tx.wait();
      console.log("Transaction confirmed:", tx);

      setStatus(`Event logged for Token ID ${tokenId}: "${description}"`);
    } catch (error) {
      console.error("Error logging event:", error.message || error);

      if (error.message.includes("Caller is not authorized")) {
        setStatus("You are not authorized to log events for this Token ID.");
      } else if (error.message.includes("Token does not exist")) {
        setStatus("The specified Token ID does not exist.");
      } else {
        setStatus(`Failed to log event: ${error.message || error}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="component">
      <h2>Log Event</h2>
      <input
        type="text"
        placeholder="Token ID"
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
        disabled={loading}
      />
      <input
        type="text"
        placeholder="Event Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={loading}
      />
      <button onClick={logEvent} disabled={loading}>
        {loading ? "Logging..." : "Log Event"}
      </button>
      <p>{status}</p>
    </div>
  );
}

export default LogEvent;
