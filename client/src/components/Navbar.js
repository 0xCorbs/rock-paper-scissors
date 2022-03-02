import React from "react";
import scissors_logo from "../logos/scissors-logo.png";

const Navbar = ({ account }) => {
  return (
    <nav className="navbar navbar-dark fixed-top bg-transparent flex-md-nowrap p-0 shadow text-monospace">
      <div className="navbar-brand col-sm-3 col-md-2 mr-0 text-dark">
        <img
          src={scissors_logo}
          height="32"
          alt="logo"
          style={{ paddingBottom: 5, paddingRight: 10 }}
        />
        ROCK PAPER SCISSORS
      </div>
      {!account ? (
        <div
          id="loader"
          className="spinner-border text-light"
          role="status"
        ></div>
      ) : (
        <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
          <a
            className="text-dark"
            href={"https://kovan.etherscan.io//address/" + account}
            target="_blank"
            rel="noopener noreferrer"
          >
            {account}
          </a>
          &nbsp;
        </li>
      )}
    </nav>
  );
};

export default Navbar;
