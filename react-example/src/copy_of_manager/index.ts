import {
  IListener,
  IListenerFactory,
  IListenersManager,
  ListenersWithExtraArgs,
  TRegisterListener,
} from "./types";

export default class ListenersManager<
  ManagerConstructorArgs = {},
  ListenersManagerState = {}
> implements IListenersManager<ManagerConstructorArgs, ListenersManagerState>
{
  // Oldest mutations will be at the start and then followed by newer mutations
  private mListenersManagerUpdateRequestsQueue: Partial<ListenersManagerState>[] =
    [];
  private mListenersManagerState: Partial<ListenersManagerState> | undefined;

  private mConstructorArgs: ManagerConstructorArgs | undefined;

  private mRegisteredListeners: {
    key: string;
    ListenerFactory: IListenerFactory<
      ManagerConstructorArgs,
      ListenersManagerState
    >;
  }[] = [];

  private mListeners: {
    [key: string]: IListener<ListenersManagerState> | undefined;
  } = {};

  constructor(args: ManagerConstructorArgs) {
    this.mConstructorArgs = args;
  }

  register = (
    listener:
      | TRegisterListener<ManagerConstructorArgs, ListenersManagerState>
      | TRegisterListener<ManagerConstructorArgs, ListenersManagerState>[]
  ): void => {
    if (Array.isArray(listener)) {
      listener.forEach((p) => {
        const index = this.mRegisteredListeners.findIndex(
          (val) => val.key === p.key
        );

        if (index === -1) {
          this.mRegisteredListeners.push(p);
        } else {
          // If found, update ListenerClass of registered listener
          this.mRegisteredListeners[index].ListenerFactory = p.ListenerFactory;
        }
      });
    } else {
      const index = this.mRegisteredListeners.findIndex(
        (val) => val.key === listener.key
      );

      if (index === -1) {
        this.mRegisteredListeners.push(listener);
      } else {
        this.mRegisteredListeners[index].ListenerFactory =
          listener.ListenerFactory;
      }
    }
  };

  logRegisteredListeners = (): void => {
    console.log("Registered listeners:", this.mRegisteredListeners);
  };

  startAll(args: ListenersWithExtraArgs[]): void {
    const { mConstructorArgs, mListeners } = this;

    if (mConstructorArgs) {
      this.mRegisteredListeners.forEach((registered) => {
        // If there is an existing listener, end first then override!
        const existingListener = mListeners[registered.key];
        if (existingListener) {
          existingListener.end();
        }

        // Start listener
        let newListener: IListener<ListenersManagerState> | undefined =
          undefined;

        if (args.length === 0) {
          newListener = registered.ListenerFactory.construct({
            ...mConstructorArgs,
            updateState: this.update,
          });
        } else {
          const index = args.findIndex((val) => val.key === registered.key);

          if (index === -1) {
            newListener = registered.ListenerFactory.construct({
              ...mConstructorArgs,
              updateState: this.update,
            });
          } else {
            newListener = registered.ListenerFactory.construct({
              ...mConstructorArgs,
              updateState: this.update,
              extraArgs: args[index].extraArgs,
            });
          }
        }

        newListener.start();
        mListeners[registered.key] = newListener;
      });
    }
  }

  endAll(): void {
    const { mListeners } = this;

    Object.keys(mListeners).forEach((listenerName) => {
      const listener = mListeners[listenerName];
      if (listener) {
        listener.end();
      }
    });
  }

  start(args: ListenersWithExtraArgs[]): void {
    const { mConstructorArgs, mListeners } = this;

    args.forEach((input) => {
      if (mConstructorArgs) {
        // If there is an existing listener, end first then override!
        const existingListener = mListeners[input.key];
        if (existingListener) {
          existingListener.end();
        }

        // Start listener
        let newListener: IListener<ListenersManagerState> | undefined =
          undefined;
        const registered = this.mRegisteredListeners.find(
          (val) => val.key === input.key
        );

        if (!registered) return;

        if (!input.extraArgs) {
          newListener = registered.ListenerFactory.construct({
            ...mConstructorArgs,
            updateState: this.update,
          });
        } else {
          newListener = registered.ListenerFactory.construct({
            ...mConstructorArgs,
            updateState: this.update,
            extraArgs: input.extraArgs,
          });
        }

        newListener.start();
        mListeners[input.key] = newListener;
      }
    });
  }

  end(listenerNames: string[]): void {
    const { mListeners } = this;

    listenerNames.forEach((listenerName) => {
      const listener = mListeners[listenerName];
      if (listener) {
        listener.end();
      }
    });
  }

  update = (newState: Partial<ListenersManagerState>): void => {
    const newListenersManagerState = {
      ...this.mListenersManagerState,
      ...newState,
    };

    this.mListenersManagerUpdateRequestsQueue.push(newListenersManagerState);

    if (this.mListenersManagerUpdateRequestsQueue.length === 1) {
      this.proceedUpdateRequests();
    }
  };

  private proceedUpdateRequests = () => {
    const { mListeners } = this;

    while (this.mListenersManagerUpdateRequestsQueue.length !== 0) {
      const updateRequest = this.mListenersManagerUpdateRequestsQueue[0];

      if (updateRequest) {
        Object.keys(mListeners).forEach((listenerName) => {
          const listener = mListeners[listenerName];
          if (listener) {
            listener.onUpdate(this.mListenersManagerState ?? {}, updateRequest);
          }
        });

        this.mListenersManagerState = { ...updateRequest };

        // Remove the oldest update request which have just been proceeded
        this.mListenersManagerUpdateRequestsQueue.shift();
      }
    }
  };
}
