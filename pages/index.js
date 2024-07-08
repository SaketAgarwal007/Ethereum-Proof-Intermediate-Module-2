import { useState, useEffect } from "react";
import { ethers } from "ethers";
import airdock_abi from "../artifacts/contracts/airdock.sol/airdock.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [airdock, setAirdock] = useState(undefined);
  const [totalPlanes, setTotalPlanes] = useState(undefined);
  const [planeAddress, setPlaneAddress] = useState("");
  const [planeDetails, setPlaneDetails] = useState([]);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const airdockABI = airdock_abi.abi;

  useEffect(() => {
    getWallet();
  }, []);

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }
    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (accounts) => {
    if (accounts.length > 0) {
      console.log("Your Account Connected = ", accounts[0]);
      setAccount(accounts[0]);
      getAirdockContract();
    } else {
      console.error("Can't Connect the account");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask Wallet is required to connect");
      return;
    }
    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);
  };

  const getAirdockContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const airdockContract = new ethers.Contract(contractAddress, airdockABI, signer);
    setAirdock(airdockContract);
  };

  const getTotalPlanes = async () => {
    if (airdock) {
      try {
        const totalPlanes = await airdock.total_planes();
        setTotalPlanes(totalPlanes.toNumber());
        getPlaneDetails();
      } catch (error) {
        console.error("Unable to fetch details", error);
        alert("Unable to fetch totalPlanes");
      }
    }
  };

  const dockPlane = async () => {
    if (airdock) {
      try {
        let tx = await airdock.dockPlane(planeAddress);
        await tx.wait();
        getTotalPlanes();
        setPlaneAddress("");
      } catch (error) {
        console.error("Error Docking Plane: ", error);
        alert("Can't Dock the Plane, Uncaught Error!");
      }
    }
  };

  const undockPlane = async () => {
    if (airdock) {
      try {
        let tx = await airdock.undockPlane(planeAddress);
        await tx.wait();
        getTotalPlanes();
        setPlaneAddress("");
      } catch (error) {
        console.error("Error Undocking Plane: ", error);
        alert("Can't Undock the Plane, Uncaught Error!");
      }
    }
  };

  const getPlaneDetails = async () => {
    if (airdock) {
      let details = [];
      for (let i = 1; i <= 6; i++) {
        try {
          let planeAddress = await airdock.planeathanger(i);
          details.push({ hanger: i, address: planeAddress === ethers.constants.AddressZero ? "N/A" : planeAddress });
        } catch (error) {
          console.error("Plane Details Fetching Error = ", error);
          alert("Can't fetch Plane Details");
        }
      }
      setPlaneDetails(details);
    }
  };

  return (
    <main className="container">
      <header><h1>Welcome to Airdock Manager Admin Panel!</h1></header>
      <div className="login">
        {!account && (
          <button id="connectButton" onClick={connectAccount}>
            Click Here To Login through Metamask
          </button>
        )}
        {account && (
          <div className="content">
            <div className="upper-panel">
              <p>Admin Account: {account}</p>
              <p>Hangers Limit: 6</p>
              <p>Total Planes Present: {totalPlanes}</p>
            </div>
            <div className="middle-panel">
              <input
                type="text"
                placeholder="Plane Address"
                value={planeAddress}
                onChange={(e) => setPlaneAddress(e.target.value)}
              />
              <button className="actionButton" onClick={dockPlane}>Dock Plane</button>
              <button className="actionButton" onClick={undockPlane}>Undock Plane</button>
            </div>
            <div className="all-planes">
              <h2>Planes at Hanger</h2>
              <table>
                <thead>
                  <tr>
                    <th>Hanger Number</th>
                    <th>Plane Address</th>
                  </tr>
                </thead>
                <tbody>
                  {planeDetails.map((plane, index) => (
                    <tr key={index}>
                      <td>{plane.hanger}</td>
                      <td>{plane.address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
        body {
          padding: 0;
          margin: 0;
          border: none;
        }
        .container {
          text-align: center;
          color: #333;
        }
        header {
          background-color: #282c34;
          padding: 20px;
          color: white;
          margin-bottom: 20px;
        }
        input {
          margin: 10px;
          padding: 10px;
          border-radius: 5px;
          border: 1px solid #ccc;
        }
        .actionButton {
          margin: 10px;
          padding: 10px 20px;
          border-radius: 5px;
          border: none;
          background-color: red;
          color: white;
          cursor: pointer;
          width: 20%;
        }
        .actionButton:hover {
          background-color: #21a1f1;
        }
        #connectButton {
          width: 300px;
          height: 70px;
          background: blue;
          cursor: pointer;
          padding: 10px 20px;
          border-radius: 5px;
          border: none;
          background-color: red;
          color: white;
          cursor: pointer;
        }
        #connectButton:hover {
          background-color: #21a1f1;
        }
        .content {
          width: 100%;
          height: 520px;
        }
        .upper-panel {
          display: flex;
          justify-content: space-evenly;
          align-items: center;
          flex-direction: row;
          border: 1px solid black;
          padding: 10px;
        }
        .upper-panel p {
          font-size: 1.5rem;
          font-weight: bold;
        }
        .middle-panel {
          display: flex;
          justify-content: space-evenly;
          align-items: center;
          flex-direction: row;
          height: 100px;
          margin-bottom: 20px;
        }
        .middle-panel input {
          width: 40%;
        }
        .middle-panel .actionButton {
          width: 100px;
        }
        .all-planes {
          margin-top: 20px;
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 10px;
          background-color: #f9f9f9;
        }
        .all-planes h2 {
          margin-bottom: 20px;
        }
        .all-planes table {
          width: 100%;
          border-collapse: collapse;
        }
        .all-planes th, .all-planes td {
          border: 1px solid #ccc;
          padding: 10px;
          text-align: left;
        }
        .all-planes th {
          background-color: #f2f2f2;
        }
      `}</style>
    </main>
  );
}
