import { ethers } from "ethers";
import JewelryCertificateABI from "./JewelryCertificateABI.json";

export const getContract = async () => {
  // 使用 MetaMask 的 provider
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed. Please install MetaMask to continue.");
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);

  try {
    // 请求用户连接钱包
    await provider.send("eth_requestAccounts", []);

    // 获取网络信息
    const network = await provider.getNetwork();
    console.log("Connected to Network:", {
      chainId: network.chainId,
      name: network.name || "unknown",
    });
  } catch (error) {
    console.error("Failed to connect to MetaMask or fetch network details:", error);
    throw error;
  }

  // 确认环境变量中合约地址是否正确
  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error("Contract address is not defined in the .env file.");
  }

  // 使用签名者连接合约
  const signer = provider.getSigner();
  return new ethers.Contract(contractAddress, JewelryCertificateABI, signer);
};
