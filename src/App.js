import "./styles/App.css";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import * as fcl from "@onflow/fcl";
import {Buffer} from "buffer"
import stringify from "fast-stable-stringify"

const CONTRACT_ADDRESS = "0x349E832e461309c00a2432E258403C2b6Aa1C47D";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [contract, setContract] = useState(CONTRACT_ADDRESS);

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
        console.log(signer);
        const address = await signer.getAddress();

        console.log("Clicked SIGN");

        const data = {
          types: {
            EIP712Domain: [
              { name: "name", type: "string" },
              { name: "version", type: "string" },
            ],
            Video: [
              { name: "video", type: "string" },
              { name: "attestations", type: "Attestation[]" },
              { name: "timestamp", type: "uint256" }
            ],
            Attestation: [
                { name: "role", type: "string" },
                { name: "address", type: "address" },
            ]
          },
          primaryType: "Video",
          domain: {
            name: "Verifiable Video",
            version: "1",
          },
          message: {
            video: "ipfs://bafybeihhhndfxtursaadlvhuptet6zqni4uhg7ornjtlp5qwngv33ipv6m",
            attestations: [{
                role: "creator",
                address: "0xB7D5D7a6FcFE31611E4673AA3E61f21dC56723fC",
            }],
            signer: "0xB7D5D7a6FcFE31611E4673AA3E61f21dC56723fC",
            timestamp: 1684241365
          },
        };

        console.log("Provider: ", provider);

        const domain = {
          name: 'Verifiable Video',
          version: '1',
        };

        const types = {
          Video: [
            { name: "video", type: "string" },
            { name: "attestations", type: "Attestation[]" },
            { name: "timestamp", type: "uint256" }
          ],
          Attestation: [
              { name: "role", type: "string" },
              { name: "address", type: "address" },
          ]
        };

        const message = {
          video: "ipfs://bafybeiaumgwp7p6cw3ej3xkg74dp3atfwlzin2pr3ml3j7qlrci23wwxze",
          attestations: [{
              role: "creator",
              address: "0xB7D5D7a6FcFE31611E4673AA3E61f21dC56723fC",
          }],
          signer: "0xB7D5D7a6FcFE31611E4673AA3E61f21dC56723fC",
          timestamp: 1685704750393
        };

        // console.log("message stringified: ", stringify(message))
        // const encoded = ethers.TypedDataEncoder.encode(domain, types, message);
        // console.log("encoded: ", encoded);
        // const decoded = ethers.TypedDataEncoder.from(encoded, types);
        // console.log("decoded: ", decoded) 

        const signature = await signer.signTypedData(domain, types, message);

        // const signature = await signer.provider.send("eth_signTypedData_v4", [
        //   address,
        //   JSON.stringify(data),
        // ]);

        const recoveredAddress = ethers.verifyTypedData(domain, types, message, signature);

        // const signature = await signer.signMessage(stringify(message));
        // const recoveredAddress = ethers.verifyMessage(stringify(message), signature);

        console.log("Signature: ", signature);
        console.log("Verified Public Key: ", recoveredAddress)
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const askToSignFlow = async () => {
    try {

      // fcl.config({
      //   "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
      //   "flow.network": "testnet",
      //   "accessNode.api": "https://access-testnet.onflow.org"
      // })
      
      // await fcl.authenticate()
      
      // const currentUserSnapshot = await fcl.currentUser().snapshot()
      // const currentUserAddress = currentUserSnapshot.addr
      // console.log("Address: ", currentUserAddress);

      // const message = Buffer.from("FOO").toString("hex")

      // const signatures = await fcl.currentUser().signUserMessage(message);

      // console.log("signatures: ", signatures);

      // const isVerified = await fcl.AppUtils.verifyUserSignatures(
      //     message,
      //     signatures
      // )

      // console.log("isVerified: ", isVerified);

    await fcl.config({
      "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
      "flow.network": "testnet",
      "accessNode.api": "https://access-testnet.onflow.org"
    })

    await fcl.authenticate()
    // await fcl.unauthenticate()

    const domain = {
      name: 'Verifiable Video',
      version: '1',
    };

    const types = {
      Video: [
        { name: "video", type: "string" },
        { name: "attestations", type: "Attestation[]" },
        { name: "timestamp", type: "uint256" }
      ],
      Attestation: [
          { name: "role", type: "string" },
          { name: "address", type: "address" },
      ]
    };

    const message2 = "a1b2"
    const message = {
      video: "ipfs://bafybeiaumgwp7p6cw3ej3xkg74dp3atfwlzin2pr3ml3j7qlrci23wwxze",
      attestations: [{
          role: "creator",
          address: "0xd10f88cea4ef9a06",
      }],
      signer: "0xd10f88cea4ef9a06",
      timestamp: 1685704750393
    };
    const signatures = await fcl.currentUser().signUserMessage(Buffer.from(stringify(message)).toString("hex"));
    const payload = {
      primaryType: "VideoAttestation",
      domain: {
        name: "Verifiable Video",
        version: "1",
      },
      message,
      signature: signatures[0].signature
    }
    console.log("payload: ", payload);
    console.log("signatures: ", signatures)

    console.log("Signature: " + signatures[0].signature)

  const compSig = {
    f_type: "CompositeSignature",
    f_vsn: "1.0.0",
    addr: "0xd10f88cea4ef9a06",
    keyId: 0,
    signature: signatures[0].signature,
  }

    const isVerified = await fcl.AppUtils.verifyUserSignatures(
      Buffer.from(stringify(message)).toString("hex"),
        [compSig]
    )
    console.log("isVerified: ", isVerified);


      
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [contract]);

  const renderNotConnectedContainer = () => (
    <button
      onClick={connectWallet}
      className="cta-button connect-wallet-button"
    >
      Connect to Wallet
    </button>
  );

  const renderContract = () => (
    <div>
      <input
        style={{ width: "320px" }}
        type="text"
        placeholder={contract}
        onChange={(e) => setContract(e.target.value)}
      ></input>
    </div>
  );

  const renderMintUI = () => (
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
          {renderContract()}
          {currentAccount === ""
            ? renderNotConnectedContainer()
            : renderMintUI()}
          {currentAccount === ""
            ? renderNotConnectedContainer()
            : renderFlowUI()}
        </div>
      </div>
    </div>
  );
};

export default App;
