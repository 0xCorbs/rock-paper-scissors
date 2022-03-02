import React, { useState, useEffect } from "react";
import Loading from "./components/Loading";
import Navbar from "./components/Navbar";
import Main from "./components/Main";
import Web3 from "web3";
import "./App.css";
import bettingGame from "./abi/BettingGame.json";

const App = () => {
  const [account, setAccount] = useState(null);
  const [amount, setAmount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [network, setNetwork] = useState(null);
  const [maxBet, setMaxBet] = useState(0);
  const [minBet, setMinBet] = useState(0);
  const [web3, setWeb3] = useState(null);
  const [wrongNetwork, setWrongNetwork] = useState(false);
  const [contractAddress, setContractAddress] = useState(null);
  const [onlyNetwork, setOnlyNetwork] = useState(false);

  useEffect(() => {
    /** !UPDATE **/
    const loadWeb3 = async () => {
      if (typeof window.ethereum !== "undefined" && !wrongNetwork) {
        let accounts,
          network_,
          balance_,
          web3_,
          maxBet_,
          minBet_,
          contract_,
          contract_address;

        //don't refresh DApp when user change the network
        window.ethereum.autoRefreshOnNetworkChange = false;

        web3_ = new Web3(window.ethereum);
        console.log("web3_", web3_);
        setWeb3(web3_);

        contract_address = "0xe83846bA98a33a22f9CB2Dcb2FC84bBbE96817c7"; //kovan
        let bettingGameABI = bettingGame.abi;
        contract_ = new web3_.eth.Contract(bettingGameABI, contract_address);
        accounts = await web3_.eth.getAccounts();

        //Update the data when user initially connect
        if (typeof accounts[0] !== "undefined" && accounts[0] !== null) {
          balance_ = await web3_.eth.getBalance(accounts[0]);
          maxBet_ = (await web3_.eth.getBalance(contract_address)) / 2;
          minBet_ = await contract_.methods.weiInUsd().call();
          setAccount(accounts[0]);
          setBalance(balance_);
          setMinBet(minBet_);
          setMaxBet(maxBet_);
        }

        setContract(contract_);
        setContractAddress(contract_address);

        //Update account and balance when user change the account
        window.ethereum.on("accountsChanged", async (accounts) => {
          if (typeof accounts[0] !== "undefined" && accounts[0] !== null) {
            balance_ = await web3.eth.getBalance(accounts[0]);
            maxBet_ = (await web3.eth.getBalance(contract_address)) / 2;
            minBet_ = await contract.methods.weiInUsd().call();

            setAccount(accounts[0]);
            setBalance(balance_);
            setMinBet(minBet_);
            setMaxBet(maxBet_);
          } else {
            setAccount(null);
            setBalance(0);
          }
        });

        //Update data when user switch the network
        window.ethereum.on("chainChanged", async (chainId) => {
          network_ = parseInt(chainId, 16);
          if (network_ !== 42) {
            setWrongNetwork(true);
          } else {
            if (account) {
              balance_ = await web3.eth.getBalance(account);
              maxBet_ = (await web3.eth.getBalance(contractAddress)) / 2;
              minBet_ = await contract.methods.weiInUsd().call();

              setBalance(balance_);
              setMinBet(minBet_);
              setMaxBet(maxBet_ / 2);
            }
            setNetwork(network_);
            setLoading(false);
            setOnlyNetwork(false);
            setWrongNetwork(false);
          }
        });
      }
    };

    const initialApp = async () => {
      await loadWeb3();
    };
    initialApp();
  }, []);

  const makeBet = async (bet, amount) => {
    const networkId = await web3.eth.net.getId();
    if (networkId !== 42) {
      setWrongNetwork(true);
    } else if (typeof account !== "undefined" && account !== null) {
      //Send bet to the contract and wait for the verdict
      contract.methods
        .game(bet)
        .send({ from: account, value: amount })
        .on("transactionHash", (hash) => {
          console.log("hash", hash);
          setLoading(true);
          contract.events.Result({}, async (error, event) => {
            const bet = event.returnValues.bet;
            const randomResult = event.returnValues.randomResult;
            const mapRPS = ["rock", "paper", "scissors"];
            // if win
            if (
              (bet === "0" && randomResult === "2") ||
              (bet === "1" && randomResult === "0") ||
              (bet === "2" && randomResult === "1")
            ) {
              window.alert(
                `The computer selected ${
                  mapRPS[parseInt(randomResult)]
                } and you selected ${mapRPS[parseInt(bet)]} YOU WON!`
              );
              // if draw
            } else if (bet === randomResult) {
              window.alert(
                `The computer selected ${
                  mapRPS[parseInt(randomResult)]
                } and you selected ${mapRPS[parseInt(bet)]} it's a draw`
              );
              // if lose
            } else {
              window.alert(
                `The computer selected ${
                  mapRPS[parseInt(randomResult)]
                } and you selected ${mapRPS[parseInt(bet)]} you lost:(`
              );
            }

            //Prevent error when user logout, while waiting for the verdict
            if (account !== null && typeof account !== "undefined") {
              const balance_ = await web3.eth.getBalance(account);
              const maxBet_ = (await web3.eth.getBalance(contractAddress)) / 2;
              setBalance(balance_);
              setMaxBet(maxBet_);
            }
            setLoading(false);
          });
        })
        .on("error", (error) => {
          window.alert("Error: ", error);
        });
    } else {
      window.alert("Problem with account or network");
    }
  };

  const onChange = (value) => {
    setAmount(value);
  };

  return (
    <div>
      <Navbar account={account} />
      &nbsp;
      {wrongNetwork ? (
        <div className="container-fluid mt-5 text-monospace text-center mr-auto ml-auto">
          <div className="content mr-auto ml-auto">
            <h1>Please Enter Kovan Network</h1>
          </div>
        </div>
      ) : loading ? (
        <Loading
          balance={balance}
          maxBet={maxBet}
          minBet={minBet}
          web3={web3}
        />
      ) : (
        <Main
          amount={amount}
          balance={balance}
          makeBet={makeBet}
          onChange={onChange}
          maxBet={maxBet}
          minBet={minBet}
          loading={loading}
          web3={web3}
        />
      )}
    </div>
  );
};

export default App;
