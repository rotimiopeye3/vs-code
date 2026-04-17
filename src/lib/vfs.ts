/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VFSNode } from '@/src/types';

const STORAGE_KEY = 'web-ide-vfs';

export const initialFiles: VFSNode[] = [
  {
    id: 'root',
    name: 'project',
    type: 'folder',
    parentId: null,
    isOpen: true,
  },
  {
    id: '1',
    name: 'index.js',
    type: 'file',
    parentId: 'root',
    content: '// Welcome to Web IDE\nconsole.log("Hello World");',
    language: 'javascript',
  },
  {
    id: '2',
    name: 'styles.css',
    type: 'file',
    parentId: 'root',
    content: 'body {\n  background: #1e1e1e;\n  color: white;\n}',
    language: 'css',
  },
  {
    id: '3',
    name: 'README.md',
    type: 'file',
    parentId: 'root',
    content: '# Web IDE\n\nA VS Code clone built with React, Monaco Editor, and Tailwind CSS.',
    language: 'markdown',
  },
];

export const getVFS = (): VFSNode[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse VFS', e);
      return initialFiles;
    }
  }
  return initialFiles;
};

export const saveVFS = (nodes: VFSNode[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nodes));
};

export const getLanguageByExtension = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'css':
      return 'css';
    case 'html':
      return 'html';
    case 'json':
      return 'json';
    case 'md':
      return 'markdown';
    case 'py':
      return 'python';
    default:
      return 'plaintext';
  }
};
