import "./styles/App.css";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import * as fcl from "@onflow/fcl";
import { Buffer } from "buffer";
import stringify from "fast-stable-stringify";

const SAMPLE_CID =
  "bafybeiaumgwp7p6cw3ej3xkg74dp3atfwlzin2pr3ml3j7qlrci23wwxze";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [cid, setCid] = useState(SAMPLE_CID);

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
    } else {
      console.log("No authorized account found");
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const askToSign = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const domain = {
          name: "Verifiable Video",
          version: "1",
        };
        const types = {
          Video: [
            { name: "video", type: "string" },
            { name: "attestations", type: "Attestation[]" },
            { name: "timestamp", type: "uint256" },
          ],
          Attestation: [
            { name: "role", type: "string" },
            { name: "address", type: "address" },
          ],
        };
        const message = {
          video: `ipfs://${cid}`,
          attestations: [
            {
              role: "creator",
              address: signer.address,
            },
          ],
          signer: signer.address,
          timestamp: Date.now(),
        };

        // Sign EIP-712 data
        const signature = await signer.signTypedData(domain, types, message);
        console.log("Signature: ", signature);

        // Send to Studio
        const payload = {
          primaryType: "VideoAttestation",
          domain,
          message,
          signature,
        };
        console.log("Payload: ", JSON.stringify(payload));
        // This may return error because of CORS, but it still works fine
        const response = await fetch(
          "https://livepeer.studio/api/experiment/-/attestation",
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );
        console.log("Response: ", response);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const askToSignFlow = async () => {
    try {
      await fcl.config({
        "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
      });

      await fcl.authenticate();

      const address = (await fcl.currentUser().snapshot()).addr;

      const message = {
        video: `ipfs://${cid}`,
        attestations: [
          {
            role: "creator",
            address: address,
          },
        ],
        signer: address,
        timestamp: Date.now(),
      };

      // Sign Flow data
      const signatures = await fcl
        .currentUser()
        .signUserMessage(Buffer.from(stringify(message)).toString("hex"));

      // Send to Studio
      const payload = {
        primaryType: "VideoAttestation",
        domain: {
          name: "Verifiable Video",
          version: "1",
        },
        message,
        signature: signatures[0].signature,
      };
      console.log("Payload: ", JSON.stringify(payload));
      // This may return error because of CORS, but it still works fine
      const response = await fetch(
        "https://livepeer.studio/api/experiment/-/attestation",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      console.log("Response: ", response);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [cid]);

  const renderNotConnectedContainer = () => (
    <button
      onClick={connectWallet}
      className="cta-button connect-wallet-button"
    >
      Connect to Wallet
    </button>
  );

  const renderCid = () => (
    <div>
      <input
        style={{ width: "320px" }}
        type="text"
        placeholder={cid}
        onChange={(e) => setCid(e.target.value)}
      ></input>
    </div>
  );

  const renderEthUI = () => (
    <div className="column main-box">
      <h2 style={{ color: "#00FF00" }}>SIGN</h2>
      <button
        style={{ marginTop: "10px" }}
        onClick={askToSign}
        className="cta-button connect-wallet-button"
      >
        SIGN EIP-712
      </button>
    </div>
  );

  const renderFlowUI = () => (
    <div className="column main-box">
      <h2 style={{ color: "#00FF00" }}>SIGN FLOW</h2>
      <button
        style={{ marginTop: "10px" }}
        onClick={askToSignFlow}
        className="cta-button connect-wallet-button"
      >
        SIGN Flow
      </button>
    </div>
  );

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">EIP-712 Playground</p>
          {renderCid()}
          {currentAccount === ""
            ? renderNotConnectedContainer()
            : renderEthUI()}
          {currentAccount === ""
            ? renderNotConnectedContainer()
            : renderFlowUI()}
        </div>
      </div>
    </div>
  );
};

export default App;
