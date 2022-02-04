# event-listeners-manager

A manager for event listeners either custom or in DOM.

## Table of content

- [Demo](#demo)
- [Problem](#problem)
- [Solution: How it works](#solution-how-it-works)
- [Setup](#setup)
- [Overiew (Recommended)](#overview-recommended)
  - [Manager](#manager)
  - [Listener](#listener)
  - [Listener Factory](#listener-factory)

## Demo

CodeSandbox: https://codesandbox.io/s/test-event-listeners-manager-20qc3

## Problem

If your project is events-driven, things can become messy. 

Event Listeners Manager helps bundle event listeners into classes for easier control.

## Solution: How it works

There are 3 important parts: Manager, Listener, Listener Factory  

- **_Manager_**: registering, controlling, and keeping track of listeners' states and listeners.  

- **_Listener_**: The core of your code logic. You can implement them however you want, as long as it follows below structure.  

- **_Listener Factory_**: 
   - A class that helps generate objects of a specific **_Listener_** class. 
   - When you register a **_Listener_**, **_Manager_** needs the **_Listener Factory_** of that **_Listener_**.  

## Setup

Install package:

`npm install event-listeners-manager`

or  

`yarn add event-listeners-manager`

Then, the hard part is implementing your first event listener class and factory.

Check out https://codesandbox.io/s/test-event-listeners-manager-20qc3 for a live example.
- Examples of **event listener** and **factory** are both in **TestListener.ts**
- Example of **manager** in React is in **App.tsx**

## Overview (Recommended)

Below is a brief description of the functions and their purposes from 3 concepts above.

### Manager

```ts

export interface IListenersManager<ManagerConstructor, ManagerState> {
  // Register new listeners (Pass in one or an array of listeners)
  register(
    listener:
      | Register<ManagerConstructor, ManagerState>
      | Register<ManagerConstructor, ManagerState>[]
  ): void;

  // Use for information and checking
  logRegisteredListeners(): void;
  logCurrentListeners(): void;

  // Start all registered event listeners (with optional extra args for any listeners) (usually in componentDidMount)
  startAll(args: ListenerWithExtraArgs[]): void;

  // Stop all registered event listeners (usually in componentWillUnmount)
  endAll(): void;

  // Start specific event listeners. Not registered listeners are ignored
  start(args: ListenerWithExtraArgs[]): void;

  // End specific event listeners. Not registered listeners are ignored
  end(listenerNames: string[]): void;

  // Function to update state (Internal function / Not for external usage)
  update(newState: Partial<ManagerState>): void;
}

```

### Listener

```ts

export interface IListener<ManagerState> {
  // Start listening to some events
  start(): void;

  // Stop listening to some events
  end(): void;

  // Use to update listener's state, signaling other registered listeners to do some actions optionally.
  update<ListenerUpdateFields>(fields: Partial<ListenerUpdateFields>): void;

  // Trigger when there are changes to any listeners' states
  onUpdate(
    oldState: Partial<ManagerState>,
    newState: Partial<ManagerState>
  ): void;
}

```

### Listener Factory

```ts

export interface IListenerFactory<
  ManagerConstructor,
  ManagerState,
  ExtraArgs = {}
> {
  // Construct an event listener and give to manager
  construct(
    args: ManagerConstructor & ListenerConstructor<ManagerState, ExtraArgs>
  ): IListener<ManagerState>;
}

```
