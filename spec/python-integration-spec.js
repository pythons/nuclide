'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {
  copyFixture,
  dispatchKeyboardEvent,
  waitsForFile,
  waitsForFilePosition,
} from '../pkg/nuclide-integration-test-helpers';
import {
  describeRemotableTest,
} from './utils/remotable-tests';
import {
  getAutocompleteSuggestions,
  waitsForAutocompleteSuggestions,
} from './utils/autocomplete-common';

describeRemotableTest('Python Integration Test', context => {
  let pyProjPath;
  let textEditor: atom$TextEditor = (null : any);

  beforeEach(() => {
    waitsForPromise({timeout: 60000}, async () => {
      pyProjPath = await copyFixture('python_project_1');
      await context.setProject(pyProjPath);
      textEditor = await atom.workspace.open(context.getProjectRelativePath('Foo.py'));
    });

    waitsForFile('Foo.py');
  });

  it('gives autocomplete suggestions', () => {
    runs(() => {
      // Trigger autocompletion.
      textEditor.setCursorBufferPosition([13, 1]);
      textEditor.insertText('os.pa');
      textEditor.insertText('t');
    });

    waitsForAutocompleteSuggestions();

    runs(() => {
      const items = getAutocompleteSuggestions();
      // The first suggestion should be 'path' as in 'os.path'.
      expect(items[0]).toEqual({
        word: 'path',
        leftLabel: '',
        rightLabel: '',
      });
    });
  });

  it('supports hyperclicking to goto definitions', () => {
    runs(() => {
      textEditor.setCursorBufferPosition([6, 8]);
      // shortcut key for hyperclick:confirm-cursor
      dispatchKeyboardEvent('enter', document.activeElement, {cmd: true, alt: true});
    });

    waitsForFilePosition('os.py', 0, 0);
  });

});
