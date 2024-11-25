import React, { useState } from "react";
import { getContract } from "../contract";

function TransferOwnership() {
  const [tokenId, setTokenId] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [status, setStatus] = useState("");

  const transferOwnership = async () => {
    try {
      const contract = await getContract(); // 确保 ABI 和合约地址正确
      console.log("Contract instance:", contract);

      const tx = await contract.transferCertificateOwnership(tokenId, newOwner);
      console.log("Transaction sent:", tx);

      await tx.wait();
      console.log("Transaction confirmed:", tx);

      setStatus(`Ownership of Token ID ${tokenId} transferred to ${newOwner}`);
    } catch (error) {
      console.error("Error transferring ownership:", error.message || error);
      setStatus(`Failed to transfer ownership: ${error.message || error}`);
    }
  };

  return (
    <div className="component">
      <h2>Transfer Ownership</h2>
      <input
        type="text"
        placeholder="Token ID"
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
      />
      <input
        type="text"
        placeholder="New Owner Address"
        value={newOwner}
        onChange={(e) => setNewOwner(e.target.value)}
      />
      <button onClick={transferOwnership}>Transfer</button>
      <p>{status}</p>
    </div>
  );
}

export default TransferOwnership;