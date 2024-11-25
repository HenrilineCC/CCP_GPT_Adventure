import React, { useState } from "react";
import { getContract } from "../contract";

function CreateCertificate() {
  const [tokenId, setTokenId] = useState("");
  const [owner, setOwner] = useState("");
  const [status, setStatus] = useState("");

  const createCertificate = async () => {
    if (!tokenId || isNaN(tokenId) || !owner) {
      setStatus("Please enter a valid Token ID and Owner Address.");
      return;
    }

    try {
      const contract = await getContract();
      console.log("Contract instance:", contract);

      // 调用 createCertificate 方法
      const tx = await contract.createCertificate(tokenId, owner);
      console.log("Transaction sent:", tx);

      await tx.wait();
      console.log("Transaction confirmed:", tx);

      setStatus(`Certificate ${tokenId} created successfully for ${owner}!`);
    } catch (error) {
      console.error("Error creating certificate:", error.message || error);

      // 错误处理
      if (error.message.includes("Token ID already exists")) {
        setStatus(`Token ID ${tokenId} already exists. Cannot create.`);
      } else if (error.message.includes("Caller is not authorized")) {
        setStatus("You are not authorized to create certificates.");
      } else {
        setStatus(`Failed to create certificate: ${error.message || error}`);
      }
    }
  };

  return (
    <div className="component">
      <h2>Create Certificate</h2>
      <input
        type="text"
        placeholder="Token ID"
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
      />
      <input
        type="text"
        placeholder="Owner Address"
        value={owner}
        onChange={(e) => setOwner(e.target.value)}
      />
      <button onClick={createCertificate}>Create</button>
      <p>{status}</p>
    </div>
  );
}

export default CreateCertificate;
