/*
  This plugin still works for unfocus and focus on editor again.
 */

import Quill, { TextChangeHandler } from "quill";
import {
  InheritFromManager,
  IListener,
  ListenerConstructorArgs,
  IListenerFactory,
} from "../copy_of_manager/types";

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

// Example listener class

class TestPlugin implements IListener<Example_ListenersManagerState> {
  private mEditor: Quill | undefined;
  private mInheritFromManager:
    | InheritFromManager<Example_ListenersManagerState>
    | undefined;

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
    console.log(this.mEditor);

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
