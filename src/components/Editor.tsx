/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Editor as MonacoEditor } from '@monaco-editor/react';
import { VFSNode } from '@/src/types';

interface EditorProps {
  file: VFSNode | null;
  onContentChange: (id: string, content: string) => void;
}

export const Editor: React.FC<EditorProps> = ({ file, onContentChange }) => {
  if (!file) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#1e1e1e] text-muted-foreground animate-in fade-in duration-500">
        <div className="w-16 h-16 mb-4 opacity-20 bg-primary rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </div>
        <h2 className="text-xl font-medium mb-1 text-foreground">No file selected</h2>
        <p className="text-sm opacity-60">Select a file from the explorer to start coding</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden relative group">
       <MonacoEditor
        height="100%"
        defaultLanguage={file.language || 'javascript'}
        language={file.language || 'javascript'}
        theme="vs-dark"
        value={file.content}
        onChange={(value) => onContentChange(file.id, value || '')}
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16 },
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          smoothScrolling: true,
          cursorSmoothCaretAnimation: "on",
          lineNumbersMinChars: 3,
        }}
      />
      {/* Tab marker */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-primary opacity-50"></div>
    </div>
  );
};
