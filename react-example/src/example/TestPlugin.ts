/*
  This plugin still works for unfocus and focus on editor again.
 */

import Quill, { TextChangeHandler } from "quill";
import {
  InheritFromManager,
  IListener,
  ListenerConstructor,
  IListenerFactory,
} from "../copy_of_manager/types";

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

// Example listener class

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
