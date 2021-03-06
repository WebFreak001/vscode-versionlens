/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { commands } from 'vscode';
import { appConfig } from './appConfiguration';

let _isActive = false;
let _inProgress = false;
let _showTaggedVersions = false;
let _showVersionLenses = false;

const config = {
  extensionName: "versionlens",
  updateIndicator: '⮬',
  openNewWindowIndicator: '⧉',

  get isActive() {
    return _isActive;
  },
  set isActive(newValue) {
    _isActive = newValue;
    commands.executeCommand(
      'setContext',
      `${this.extensionName}.isActive`,
      _isActive
    );
  },

  get showTaggedVersions() {
    return _showTaggedVersions;
  },
  set showTaggedVersions(newValue) {
    _showTaggedVersions = newValue;
    commands.executeCommand(
      'setContext',
      `${this.extensionName}.showTaggedVersions`,
      _showTaggedVersions
    );
  },

  get showVersionLenses() {
    return _showVersionLenses;
  },
  set showVersionLenses(newValue) {
    _showVersionLenses = newValue;
    commands.executeCommand(
      'setContext',
      `${this.extensionName}.show`,
      _showVersionLenses
    );
  },

  get inProgress() {
    return _inProgress;
  },
  set inProgress(newValue) {
    _inProgress = newValue;
    commands.executeCommand(
      'setContext',
      `${this.extensionName}.inProgress`,
      _inProgress
    );
  },

};

// ensure the context is set to the defaults
config.showTaggedVersions = appConfig.showTaggedVersionsAtStartup === true;
config.showVersionLenses = appConfig.showVersionLensesAtStartup === true;

export default config;