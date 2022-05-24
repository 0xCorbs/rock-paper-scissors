import React from "react";
import rpsImg from "../logos/rock-paper-scissors.png";
import eth from "../logos/eth.png";
import "../App.css";

const Main = ({ makeBet, web3, balance, maxBet, minBet, onChange, amount }) => {
  return (
    <div className="container">
      <div className="card-body">
        <div className="d-flex justify-content-center">
          <img src={rpsImg} alt="logo" className="rps-img" />
        </div>
        &nbsp;
        <p></p>
        <div className="input-group mb-4">
          <input
            type="number"
            step="0.01"
            className="form-control form-control-md"
            placeholder="bet amount..."
            onChange={(e) => onChange(e.target.value)}
            required
          />
          <div className="input-group-append">
            <div className="input-group-text">
              <img src={eth} height="20" alt="" />
              &nbsp;<b>ETH</b>
            </div>
          </div>
        </div>
        <div className="d-flex justify-content-around">
          <button
            type="submit"
            className="btn btn-danger btn-lg"
            onClick={(event) => {
              event.preventDefault();
              //start with digit, digit+dot* or single dot*, end with digit.
              let reg = new RegExp("^[0-9]*.?[0-9]+$");
              let minBet_ = Number(
                web3.utils.fromWei(minBet.toString())
              ).toFixed(5);

              let maxBet_ = Number(
                web3.utils.fromWei(maxBet.toString())
              ).toFixed(5);

              if (
                (reg.test(amount) && amount <= minBet_) ||
                (reg.test(amount) && amount >= maxBet_)
              ) {
                window.alert(
                  "Please make sure that:\n*You typed positive interger or float number\n* Typed value is >= than MinBet (not all ETH decimals visible)\n* You are using Kovan network"
                );
              } else {
                const amount_ = amount.toString();
                makeBet(0, web3.utils.toWei(amount_));
              }
            }}
          >
            Rock
          </button>
          &nbsp;&nbsp;&nbsp;
          <button
            type="submit"
            className="btn btn-warning btn-lg"
            onClick={(event) => {
              event.preventDefault();
              //start with digit, digit+dot* or single dot*, end with digit.
              let reg = new RegExp("^[0-9]*.?[0-9]+$");
              let minBet_ = Number(
                web3.utils.fromWei(minBet.toString())
              ).toFixed(5);

              let maxBet_ = Number(
                web3.utils.fromWei(maxBet.toString())
              ).toFixed(5);

              if (
                (reg.test(amount) && amount <= minBet_) ||
                (reg.test(amount) && amount >= maxBet_)
              ) {
                window.alert(
                  "Please make sure that:\n*You typed positive interger or float number\n* Typed value is >= than MinBet (not all ETH decimals visible)\n* You are using Kovan network"
                );
              } else {
                const amount_ = amount.toString();
                makeBet(1, web3.utils.toWei(amount_));
              }
            }}
          >
            Paper
          </button>
          &nbsp;&nbsp;&nbsp;
          <button
            type="submit"
            className="btn btn-success btn-lg"
            onClick={(event) => {
              event.preventDefault();
              //start with digit, digit+dot* or single dot*, end with digit.
              let reg = new RegExp("^[0-9]*.?[0-9]+$");
              let minBet_ = Number(
                web3.utils.fromWei(minBet.toString())
              ).toFixed(5);

              let maxBet_ = Number(
                web3.utils.fromWei(maxBet.toString())
              ).toFixed(5);

              if (
                (reg.test(amount) && amount <= minBet_) ||
                (reg.test(amount) && amount >= maxBet_)
              ) {
                window.alert(
                  "Please make sure that:\n*You typed positive interger or float number\n* Typed value is >= than MinBet (not all ETH decimals visible)\n* You are using Kovan network"
                );
              } else {
                const amount_ = amount.toString();
                makeBet(2, web3.utils.toWei(amount_));
              }
            }}
          >
            Scissors
          </button>
        </div>
      </div>

      <div>
        {!balance ? (
          <div
            id="loader"
            className="spinner-border float-right"
            role="status"
          ></div>
        ) : (
          <div className="float-right" style={{ width: "220px" }}>
            <div className="float-left" style={{ height: "17px" }}>
              <b>MaxBet&nbsp;</b>
            </div>
            <div className="float-right" style={{ height: "17px" }}>
              {Number(web3.utils.fromWei(maxBet.toString())).toFixed(5)}{" "}
              <b>ETH&nbsp;</b>
            </div>
            <br></br>
            <div className="float-left" style={{ height: "17px" }}>
              <b>MinBet</b>($1)&nbsp;
            </div>
            <div className="float-right" style={{ height: "17px" }}>
              {Number(web3.utils.fromWei(minBet.toString())).toFixed(5)}{" "}
              <b>ETH&nbsp;</b>
            </div>
            <br></br>
            <div className="float-left">
              <b>Balance&nbsp;</b>
            </div>
            <div className="float-right">
              {Number(web3.utils.fromWei(balance.toString())).toFixed(5)}{" "}
              <b>ETH&nbsp;</b>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Main;
