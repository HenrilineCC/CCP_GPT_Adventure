import React from "react";
import CreateCertificate from "./components/CreateCertificate";
import LogEvent from "./components/LogEvent";
import TransferOwnership from "./components/TransferOwnership";
import QueryLogEvents from "./components/QueryLogEvents";
import AuthorizeUser from "./components/AuthorizeUser";
function App() {
  return (
    <div className="app">
      <h1>Jewelry Certificate Management</h1>
      <CreateCertificate />
      <LogEvent />
      <TransferOwnership />
      <QueryLogEvents />
      <AuthorizeUser />
    </div>
  );
}

export default App;
