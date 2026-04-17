/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type FileType = 'file' | 'folder';

export interface VFSNode {
  id: string;
  name: string;
  type: FileType;
  parentId: string | null;
  content?: string;
  language?: string;
  isOpen?: boolean;
}

export interface IDEState {
  files: VFSNode[];
  activeFileId: string | null;
  openFiles: string[]; // List of IDs
  sidebarVisible: boolean;
  activityTab: 'explorer' | 'search' | 'extensions' | 'settings';
}

export interface Extension {
  id: string;
  name: string;
  description: string;
  version: string;
  publisher: string;
  icon?: string;
  onActivate?: (context: ExtensionContext) => void;
  commands?: Command[];
}

export interface ExtensionContext {
  registerCommand: (id: string, callback: () => void) => void;
  addStatusBarItem: (text: string, priority?: number) => void;
}

export interface Command {
  id: string;
  title: string;
  callback: () => void;
}
