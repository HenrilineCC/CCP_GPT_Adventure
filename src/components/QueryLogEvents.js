import React, { useState, useEffect } from "react";
import { getContract } from "../contract";
import { ethers } from "ethers";

function QueryLogEvents() {
  const [tokenId, setTokenId] = useState("");
  const [logEvents, setLogEvents] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [owner, setOwner] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!window.ethereum) {
        setStatus("MetaMask is not detected. Please install it to continue.");
        return;
      }

      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();

        if (accounts.length > 0) {
          setCurrentUser(accounts[0]);
        } else {
          setStatus("No account connected. Please connect your wallet.");
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
        setStatus("Failed to fetch current user. Please connect your wallet.");
      }
    };

    fetchCurrentUser();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setCurrentUser(accounts[0]);
          setStatus(""); // Clear status on successful account change
        } else {
          setCurrentUser("");
          setStatus("No account connected.");
        }
      });

      // Listen for chain changes
      window.ethereum.on("chainChanged", () => {
        window.location.reload(); // Reload page on network change
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", () => {});
        window.ethereum.removeListener("chainChanged", () => {});
      }
    };
  }, []);

  const fetchLogEvents = async () => {
    if (!tokenId || isNaN(tokenId) || parseInt(tokenId) < 0) {
      setStatus("Please enter a valid positive Token ID.");
      return;
    }

    try {
      setLoading(true);
      setLogEvents([]);
      setStatus("Fetching log events...");

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = await getContract(signer);

      const tokenOwner = await contract.ownerOf(tokenId);
      setOwner(tokenOwner);

      // 检查当前用户是否为授权用户
      const isApproved = await contract.getApproved(tokenId);
      const isApprovedForAll = await contract.isApprovedForAll(tokenOwner, currentUser);
      const isUserAuthorized = await contract.isAuthorized(currentUser);

      if (
        currentUser.toLowerCase() !== tokenOwner.toLowerCase() &&
        isApproved.toLowerCase() !== currentUser.toLowerCase() &&
        !isApprovedForAll &&
        !isUserAuthorized
      ) {
        setStatus("You are not authorized to view events for this Token ID.");
        return;
      }

      setIsAuthorized(true);
      setStatus("You are authorized to view events for this Token ID.");

      const events = await contract.getEvents(tokenId);
      setLogEvents(events);
      setStatus(`Successfully fetched ${events.length} events.`);
    } catch (error) {
      console.error("Error fetching events:", error);

      if (error.code === "CALL_EXCEPTION") {
        setStatus("Token ID does not exist or you are not authorized.");
      } else if (error.message.includes("MetaMask")) {
        setStatus("Please connect your MetaMask wallet.");
      } else {
        setStatus(`An unexpected error occurred: ${error.message || error}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="component">
      <h2>Query Log Events</h2>
      <p>
        <strong>Current User:</strong> {currentUser || "Not connected to MetaMask"}
      </p>
      <input
        type="text"
        placeholder="Token ID"
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
      />
      <button onClick={fetchLogEvents} disabled={loading || !currentUser}>
        {loading ? "Fetching..." : "Fetch Events"}
      </button>
      <p>{status}</p>
      {owner && (
        <p>
          <strong>Owner of Token ID {tokenId}:</strong> {owner}
        </p>
      )}
      {isAuthorized && logEvents.length > 0 && (
        <div>
          <h3>Log Events:</h3>
          <ul>
            {logEvents.map((event, index) => (
              <li key={index}>
                <strong>Description:</strong> {event.description} <br />
                <strong>Timestamp:</strong> {new Date(event.timestamp * 1000).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default QueryLogEvents;
