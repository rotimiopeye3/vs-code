/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Extension } from '@/src/types';

export const builtInExtensions: Extension[] = [
  {
    id: 'ext.theme.dracula',
    name: 'Dracula Theme',
    description: 'The official Dracula theme for Web IDE. High contrast and vibrant colors.',
    version: '2.4.1',
    publisher: 'Dracula Foundation',
    icon: 'https://draculatheme.com/static/img/logo.svg'
  },
  {
    id: 'ext.js.formatter',
    name: 'Prettier - Code Formatter',
    description: 'Opinionated code formatter. It enforces a consistent style by parsing your code.',
    version: '3.1.0',
    publisher: 'Prettier',
  },
  {
    id: 'ext.git.lite',
    name: 'GitLens - Lite',
    description: 'Supercharge Git inside Web IDE. Visualize code authorship and navigation.',
    version: '15.0.0',
    publisher: 'GitKraken',
  },
  {
    id: 'ext.python',
    name: 'Python',
    description: 'IntelliSense (Pylance), Linting, Debugging (multi-threaded, remote).',
    version: '2024.2.0',
    publisher: 'Microsoft',
  },
  {
    id: 'ext.eslint',
    name: 'ESLint',
    description: 'Integrates ESLint into VS Code. Checks for code quality and style.',
    version: '2.4.4',
    publisher: 'Microsoft',
  },
  {
    id: 'ext.docker',
    name: 'Docker',
    description: 'Makes it easy to create, manage, and debug containerized applications.',
    version: '1.29.1',
    publisher: 'Microsoft',
  }
];

export const getInstalledExtensions = (): Extension[] => {
  const stored = localStorage.getItem('web-ide-extensions');
  if (stored) {
    try {
      const ids = JSON.parse(stored) as string[];
      return builtInExtensions.filter(ext => ids.includes(ext.id));
    } catch (e) {
      return [builtInExtensions[0]];
    }
  }
  return [builtInExtensions[0]];
};

export const toggleExtension = (id: string) => {
  const stored = localStorage.getItem('web-ide-extensions');
  let current: string[] = [];
  if (stored) {
    try {
      current = JSON.parse(stored);
    } catch (e) {}
  }
  
  if (current.includes(id)) {
    current = current.filter(cid => cid !== id);
  } else {
    current.push(id);
  }
  
  localStorage.setItem('web-ide-extensions', JSON.stringify(current));
};
