import React from "react";
import logo from "./logo.svg";
import "./App.css";
import Quill from "quill";
import ListenersManager from "./copy_of_manager";
import {
  ManagerState_Example,
  ManagerConstructor_Example,
  TestPluginFactory_Singleton,
} from "./example/TestPlugin";
import { IListenersManager } from "./copy_of_manager/types";

class App extends React.Component {
  mQuill: Quill | undefined;
  mManager:
    | IListenersManager<ManagerConstructor_Example, ManagerState_Example>
    | undefined;

  componentDidMount() {
    const container = document.querySelector("#container");

    if (!container) {
      console.log("Container not found");
      return;
    }

    this.mQuill = new Quill(container, {
      theme: "snow",
      modules: { toolbar: false },
    });

    this.mManager = new ListenersManager<
      ManagerConstructor_Example,
      ManagerState_Example
    >({
      editor: this.mQuill,
    });

    this.mManager.register({
      key: "TestPlugin",
      ListenerFactory: TestPluginFactory_Singleton,
    });

    this.mManager.logRegisteredListeners();

    this.mManager.startAll([
      {
        key: "TestPlugin",
        extraArgs: {
          isTestMode: true,
        },
      },
    ]);
  }

  componentWillUnmount() {}

  render() {
    return (
      <div className="App">
        <div
          style={{
            width: "100vw",
            height: "300px",
            padding: "20px",
            boxSizing: "border-box",

            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            id="container"
            style={{
              border: "2px solid black",
              width: "100%",
              height: "fit-content",
            }}
          />
        </div>

        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.tsx</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    );
  }
}

export default App;
