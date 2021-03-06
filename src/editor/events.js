/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { window, workspace } from 'vscode';
import codeLensProviders from '../providers/codeLensProviders'
import { onActiveEditorChanged, onChangeTextDocument } from './handlers';

export default function () {
  // update versionLens.isActive upon start
  onActiveEditorChanged(window.activeTextEditor, codeLensProviders);
  window.onDidChangeActiveTextEditor(editor => {
    // update versionLens.isActive each time the active editor changes
    onActiveEditorChanged(editor, codeLensProviders);
  });

  workspace.onDidChangeTextDocument(onChangeTextDocument);
}