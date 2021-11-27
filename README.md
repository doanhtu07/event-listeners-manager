# event-listeners-manager

A manager for event listeners either custom or in DOM.

## Table of content

- [Problem](#problem)
- [Solution: How it works](#solution-how-it-works)
- [Demo / Example](#demo--example)
  - [Example Imports](#example-imports)
  - [Example Types](#example-types)
  - [Example Listener Class](#example-listener-class)
  - [Example Listener Factory](#example-listener-factory)
  - [Example Usage In Code](#example-usage-in-code)

## Problem

If your codeflow is event driven, events can become messy. Event Listeners Manager is a small step to help structure event listeners into classes, which you have more control over.  

This project is still really basic. If you need to extend further for your needs, feel free fork the project, or create a PR.  

## Solution: How it works

There are 3 things you need to know before moving on: Manager, Listener, Listener Factory  

- **_Manager_** is used for registering, controlling, and keeping track of states and listeners.  

- **_Listeners_** are the core of your code logic. You can implement them however you want, as long as it follows a specific structure (which is mentioned below).  

- **_Listener Factory_** is a class that helps generate objects from **_Listeners_** classes. When you register, **_Manager_** receives these factories and can later create objects of **_Listeners_**.  

Below is a brief description of the functions and their purposes from these 3 concepts.

```ts

// Listeners Manager

export interface IListenersManager<ManagerConstructor, ManagerState> {
  // Register new listeners. Can pass in one or an array of new listeners
  register(
    listener:
      | Register<ManagerConstructor, ManagerState>
      | Register<ManagerConstructor, ManagerState>[]
  ): void;

  // Use for information and checking
  logRegisteredListeners(): void;
  logCurrentListeners(): void;

  // Start all registered event listeners
  startAll(args: ListenerWithExtraArgs[]): void;

  // Stop all registered event listeners
  endAll(): void;

  // Start specific event listeners. Not registered names are ignored
  start(args: ListenerWithExtraArgs[]): void;

  // End specific event listeners. Not registered names are ignored
  end(listenerNames: string[]): void;

  // Function to update state: Passed in listeners through factory
  update(newState: Partial<ManagerState>): void;
}

```

```ts

// Listener

export interface IListener<ManagerState> {
  // Start listening to some events
  start(): void;

  // Stop listening to events
  end(): void;

  // Use to update manager's state, so that other registered listeners know.
  update<ListenerUpdateFields>(fields: Partial<ListenerUpdateFields>): void;

  // Trigger when there are changes to new manager's state made by any event listeners
  onUpdate(
    oldState: Partial<ManagerState>,
    newState: Partial<ManagerState>
  ): void;
}

```

```ts

// Listener Factory

export interface IListenerFactory<
  ManagerConstructor,
  ManagerState,
  ExtraArgs = {}
> {
  // Use to construct an event listener and give to manager
  construct(
    args: ManagerConstructor & ListenerConstructor<ManagerState, ExtraArgs>
  ): IListener<ManagerState>;
}

```

## Demo / Example

CodeSandbox: https://codesandbox.io/s/smoosh-field-0rf4g?file=/package.json

You can clone or fork the project. In root directory, run:

`yarn test`

You will see a React app. Open Inspect to see logs of my test event listeners. 

I use Quill, a WYSWYG editor, for demonstration since it is a perfect example of event-driven code with custom listeners (text-change, selection-change, editor-change).

Of course, you install it first:

`npm install event-listeners-manager`

or  

`yarn add event-listeners-manager`

Then, the hard part is implementing your first event listener class and factory.

### Example Imports

```ts

// Imports

import Quill, { TextChangeHandler } from "quill";
import {
  InheritFromManager,
  IListener,
  ListenerConstructor,
  IListenerFactory,
} from "../copy_of_manager/types";

```

### Example Types

```ts

// Example types

export type ManagerConstructor_Example = {
  editor: Quill;
};

export type ManagerState_Example = {
  TestPlugin: {
    haveFinished: boolean;
  };
};

export type TestPlugin_ExtraArgs_Example = {
  isTestMode: boolean;
};

export type TestPlugin_UpdateInput_Example = {
  haveFinished: boolean;
};

```

### Example Listener Class

```ts

// Example listener class

// Some types require you to provide either: 
// - shape for Manager's constructor
// - shape for Manager's state (if you don't have need states, just put {} as empty type)

// (Optional) Shape for input of listener's update state function is up to you

class TestPlugin implements IListener<ManagerState_Example> {
  private mEditor: Quill | undefined;
  private mInheritFromManager:
    | InheritFromManager<ManagerState_Example>
    | undefined;

  constructor(
    args: ManagerConstructor_Example &
      ListenerConstructor<ManagerState_Example, TestPlugin_ExtraArgs_Example>
  ) {
    const { editor, updateState, ...extraArgs } = args;

    this.mEditor = editor;
    this.mInheritFromManager = {
      updateState,
    };
    console.log("Extra args:", extraArgs);
  }

  start = (): void => {
    document.addEventListener("click", this.logDocument);
    this.mEditor?.on("text-change", this.logEditor);
  };

  end = (): void => {
    document.removeEventListener("scroll", this.logDocument);
    this.mEditor?.off("text-change", this.logEditor);
  };

  update = (fields: Partial<TestPlugin_UpdateInput_Example>): void => {
    if (!this.mInheritFromManager) return;

    const { updateState } = this.mInheritFromManager;

    updateState({
      TestPlugin: {
        haveFinished: fields.haveFinished ?? false,
      },
    });
  };

  onUpdate = (
    oldState: Partial<ManagerState_Example>,
    newState: Partial<ManagerState_Example>
  ): void => {
    console.log("-----");
    console.log("Manager update state:");
    console.log("Old state", oldState);
    console.log("New state", newState);
    return;
  };

  private logDocument = (): void => {
    console.log("-----");
    console.log("Click document");

    this.update({
      haveFinished: true,
    });
  };

  private logEditor: TextChangeHandler = (): void => {
    console.log("-----");
    console.log("Current content:", this.mEditor?.getContents().ops);
  };
}

```

### Example Listener Factory

```ts

// Example factory

class TestPluginFactory
  implements IListenerFactory<ManagerConstructor_Example, ManagerState_Example>
{
  construct = (
    args: ManagerConstructor_Example &
      ListenerConstructor<ManagerState_Example, TestPlugin_ExtraArgs_Example>
  ): IListener<ManagerState_Example> => {
    return new TestPlugin(args);
  };
}

// Singleton
export const TestPluginFactory_Singleton = new TestPluginFactory();

```

### Example Usage In Code

```tsx

// Use in code (React)

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

  componentWillUnmount() {
    this.mManager?.endAll();
  }

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

```

# Good luck!
