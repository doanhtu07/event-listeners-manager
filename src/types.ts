// ----- ----- ----- ----- -----

export type InheritFromManager<ListenersManagerState> = {
  updateState: (newState: Partial<ListenersManagerState>) => void;
};

export type ListenerConstructorArgs<ListenersManagerState> =
  InheritFromManager<ListenersManagerState> & Partial<ExtraArgs>;

export type ExtraArgs = {
  extraArgs: Record<string, unknown>;
};

export type ListenersWithExtraArgs = Partial<ExtraArgs> & {
  key: string;
};

// ----- ----- ----- ----- -----

export interface IListenersManager<
  ManagerConstructorArgs,
  ListenersManagerState
> {
  register(
    listener:
      | TRegisterListener<ManagerConstructorArgs, ListenersManagerState>
      | TRegisterListener<ManagerConstructorArgs, ListenersManagerState>[]
  ): void;

  logRegisteredListeners(): void;

  startAll(args: ListenersWithExtraArgs[]): void;
  endAll(): void;
  start(args: ListenersWithExtraArgs[]): void;
  end(listenerNames: string[]): void;
  update(newState: Partial<ListenersManagerState>): void;
}

// ----- ----- ----- ----- -----

export type TRegisterListener<ManagerConstructorArgs, ListenersManagerState> = {
  key: string;
  ListenerFactory: IListenerFactory<
    ManagerConstructorArgs,
    ListenersManagerState
  >;
};

export interface IListener<ListenersManagerState> {
  start(): void;
  end(): void;
  update<ListenerUpdateFields>(fields: Partial<ListenerUpdateFields>): void;
  onUpdate(
    oldState: Partial<ListenersManagerState>,
    newState: Partial<ListenersManagerState>
  ): void;
}

export interface IListenerFactory<
  ManagerConstructorArgs,
  ListenersManagerState
> {
  construct(
    args: ManagerConstructorArgs &
      ListenerConstructorArgs<ListenersManagerState>
  ): IListener<ListenersManagerState>;
}
