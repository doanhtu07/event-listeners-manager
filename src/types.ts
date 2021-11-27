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
  register(
    listener:
      | Register<ManagerConstructor, ManagerState>
      | Register<ManagerConstructor, ManagerState>[]
  ): void;

  logRegisteredListeners(): void;
  logCurrentListeners(): void;

  startAll(args: ListenerWithExtraArgs[]): void;
  endAll(): void;
  start(args: ListenerWithExtraArgs[]): void;
  end(listenerNames: string[]): void;
  update(newState: Partial<ManagerState>): void;
}

// ----- ----- ----- ----- -----

export interface IListener<ManagerState> {
  start(): void;
  end(): void;
  update<ListenerUpdateFields>(fields: Partial<ListenerUpdateFields>): void;
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
  construct(
    args: ManagerConstructor & ListenerConstructor<ManagerState, ExtraArgs>
  ): IListener<ManagerState>;
}
