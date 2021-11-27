// ----- ----- ----- ----- -----

export type InheritFromManager<ManagerState> = {
  updateState: (newState: Partial<ManagerState>) => void;
};

export type ListenerConstructor<
  ManagerState,
  ExtraArgs = {}
> = InheritFromManager<ManagerState> & ExtraArgs;

export type ListenerWithExtraArgs = {
  key: string;
  extraArgs: Record<string, unknown>;
};

// ----- ----- ----- ----- -----

export type Register<ManagerConstructor, ManagerState> = {
  key: string;
  ListenerFactory: IListenerFactory<ManagerConstructor, ManagerState>;
};
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

// ----- ----- ----- ----- -----

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
