# event-listeners-manager

A manager for event listeners either custom or in DOM.

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

export interface IListenersManager<
  ManagerConstructorArgs,
  ListenersManagerState
> {

  // Register new listeners. Can pass in one or an array of new listeners
  register(
    listener:
      | TRegisterListener<ManagerConstructorArgs, ListenersManagerState>
      | TRegisterListener<ManagerConstructorArgs, ListenersManagerState>[]
  ): void;

  // Use for information and checking if listeners are registered but missing
  logRegisteredListeners(): void;

  // Start all registered event listeners
  startAll(args: ListenersWithExtraArgs[]): void;
  
  // Stop all registered event listeners
  endAll(): void;
  
  // Start specific event listeners. Not registered names are ignored
  start(args: ListenersWithExtraArgs[]): void;
  
  // End specific event listeners. Not registered names are ignored
  end(listenerNames: string[]): void;
  
  // Function to update state: Passed in listeners through factory
  update(newState: Partial<ListenersManagerState>): void;
  
}

```

```ts

// Listener

export interface IListener<ListenersManagerState> {

  // Start listening to some events
  start(): void;
  
  // Stop listening to events
  end(): void;
  
  // Use to update manager's state, so that other registered listeners know.
  update<ListenerUpdateFields>(fields: Partial<ListenerUpdateFields>): void;
  
  // Trigger when there are changes to new manager's state made by any event listeners
  onUpdate(
    oldState: Partial<ListenersManagerState>,
    newState: Partial<ListenersManagerState>
  ): void;
  
}

```

```ts

// Listener Factory

export interface IListenerFactory<
  ManagerConstructorArgs,
  ListenersManagerState
> {

  // Use to construct an event listener and give to manager
  construct(
    args: ManagerConstructorArgs &
      ListenerConstructorArgs<ListenersManagerState>
  ): IListener<ListenersManagerState>;
  
}

```

## Demo / Example

You can clone or fork the project. In root directory, run:

`yarn test`

You will see a React app. Open Inspect to see logs of my test event listeners. 

I use Quill, a WYSWYG editor, for demonstration since it is a perfect example of event-driven code with custom listeners (text-change, selection-change, editor-change).

## How to use this package

Of course, you install it first:

`npm install event-listeners-manager`

or  

`yarn add event-listeners-manager`

Then, the hard part is implementing your first event listener class and factory.

```ts

// Imports

import Quill, { TextChangeHandler } from "quill";
import {
  InheritFromManager,
  IListener,
  ListenerConstructorArgs,
  IListenerFactory,
} from "../copy_of_manager/types";

```

```ts

// Example types

export type Example_ManagerConstructorArgs = {
  editor: Quill;
};

export type Example_ListenersManagerState = {
  TestPlugin: {
    haveFinished: boolean;
  };
};

export type Example_TestPluginUpdateFields = {
  haveFinished: boolean;
};

```

```ts

// Example listener class

// Some types require you to provide either: 
// - shape for Manager's constructor
// - shape for Manager's state (if you don't have need states, just put {} as empty type)

// (Optional) Shape for input of listener's update state function is up to you

class TestPlugin implements IListener<Example_ListenersManagerState> {
  private mInheritFromManager:
    | InheritFromManager<Example_ListenersManagerState>
    | undefined;

  private mEditor: Quill | undefined;
 
  constructor(
    args: Example_ManagerConstructorArgs &
      ListenerConstructorArgs<Example_ListenersManagerState>
  ) {
    this.mEditor = args.editor;
    this.mInheritFromManager = {
      updateState: args.updateState,
    };
  }

  start = (): void => {
    document.addEventListener("click", this.logDocument);
    this.mEditor?.on("text-change", this.logEditor);
  };

  end = (): void => {
    document.removeEventListener("scroll", this.logDocument);
    this.mEditor?.off("text-change", this.logEditor);
  };

  update = (fields: Partial<Example_TestPluginUpdateFields>): void => {
    if (!this.mInheritFromManager) return;

    const { updateState } = this.mInheritFromManager;

    updateState({
      TestPlugin: {
        haveFinished: fields.haveFinished ?? false,
      },
    });
  };

  onUpdate = (
    oldState: Partial<Example_ListenersManagerState>,
    newState: Partial<Example_ListenersManagerState>
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

```ts

// Example factory

class TestPluginFactory
  implements
    IListenerFactory<
      Example_ManagerConstructorArgs,
      Example_ListenersManagerState
    >
{
  construct = (
    args: Example_ManagerConstructorArgs &
      ListenerConstructorArgs<Example_ListenersManagerState>
  ): IListener<Example_ListenersManagerState> => {
    return new TestPlugin(args);
  };
}

// Singleton
export const TestPluginFactory_Singleton = new TestPluginFactory();

```
