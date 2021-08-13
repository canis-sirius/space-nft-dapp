import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import contractABI from "../space-nft-contract.json";
import { pinJSONToIPFS } from './pinata.js'

const web3 = createAlchemyWeb3(process.env.REACT_APP_ALCHEMY_KEY);
const contractAddress = "0xf328aabac1d5fe30ea2085345e5e4b4d36832c6f";

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      return {
        status: "👆🏽 Write a message in the text-field above.",
        address: addressArray[0],
      };
    } catch (e) {
      return {
        address: "",
        status: "😥 " + e.message,
      };
    }
  }

  return {
    address: "",
    status: (
      <span>
        <p>
          {" "}
          🦊{" "}
          <a target="_blank" href={`https://metamask.io/download.html`}>
            You must install Metamask, a virtual Ethereum wallet, in your
            browser.
          </a>
        </p>
      </span>
    ),
  }
}

export const getCurrentWalletConnected = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (addressArray.length > 0) {
        return {
          address: addressArray[0],
          status: "👆🏽 Write a message in the text-field above.",
        };
      }

      return {
        address: "",
        status: "🦊 Connect to Metamask using the top right button.",
      };
    } catch (err) {
      return {
        address: "",
        status: "😥 " + err.message,
      };
    }
  }

  return {
    address: "",
    status: (
      <span>
        <p>
          {" "}
          🦊{" "}
          <a target="_blank" href={`https://metamask.io/download.html`}>
            You must install Metamask, a virtual Ethereum wallet, in your
            browser.
          </a>
        </p>
      </span>
    ),
  };
};

export const mintNFT = async (url, name, description) => {
  // error handling
  if (url.trim() === "" || name.trim() === "" || description.trim() === "") {
    return {
      success: false,
      status: "❗Please make sure all fields are completed before minting.",
    }
  }

  const metadata = {
    name,
    image: url,
    description,
  };

  const pinataResponse = await pinJSONToIPFS(metadata);
  if (!pinataResponse.success) {
    return {
      success: false,
      status: "😢 Something went wrong while uploading your tokenURI.",
    };
  }

  const tokenURI = pinataResponse.pinataUrl;

  // load smart contract
  window.contract = await new web3.eth.Contract(contractABI, contractAddress);

  // set up your Ethereum transaction
  const transactionParameters = {
    to: contractAddress, // Required except during contract publications.
    from: window.ethereum.selectedAddress, // must match user's active address.
    data: window.contract.methods.mintNFT(window.ethereum.selectedAddress, tokenURI).encodeABI()//make call to NFT smart contract
  };

  // sign the transaction via metamask
  try {
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters]
    });
    return {
      success: true,
      status: "✅ Check out your transaction on Etherscan: https://ropsten.etherscan.io/tx/" + txHash
    }
  } catch (e) {
    return {
      success: false,
      status: "😥 Something went wrong: " + e.message
    }
  }
};
