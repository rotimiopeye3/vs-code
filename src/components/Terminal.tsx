/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { VFSNode } from '@/src/types';

interface TerminalProps {
  files: VFSNode[];
  onCommand: (command: string, args: string[]) => string | void;
}

export const Terminal: React.FC<TerminalProps> = ({ files, onCommand }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const currentInput = useRef('');

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new XTerm({
      cursorBlink: true,
      fontSize: 12,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      theme: {
        background: '#1e1e1e',
        foreground: '#cccccc',
        cursor: '#ffffff',
      },
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(terminalRef.current);
    fitAddon.fit();
    xtermRef.current = term;

    term.writeln('\x1b[32mWelcome to Web IDE Terminal (v1.0.0)\x1b[0m');
    term.writeln('Type "help" for a list of available commands.\n');
    prompt();

    term.onKey(({ key, domEvent }) => {
      const char = key;
      if (domEvent.keyCode === 13) { // Enter
        term.write('\r\n');
        handleCommand();
      } else if (domEvent.keyCode === 8) { // Backspace
        if (currentInput.current.length > 0) {
          currentInput.current = currentInput.current.slice(0, -1);
          term.write('\b \b');
        }
      } else if (domEvent.keyCode >= 32 && domEvent.keyCode <= 126) {
        currentInput.current += char;
        term.write(char);
      }
    });

    const handleResize = () => fitAddon.fit();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, []);

  const prompt = () => {
    xtermRef.current?.write('\x1b[1;32mweb-ide@local:~/project$\x1b[0m ');
  };

  const handleCommand = () => {
    const input = currentInput.current.trim();
    currentInput.current = '';

    if (input) {
      const [cmd, ...args] = input.split(' ');
      const output = onCommand(cmd, args);
      if (typeof output === 'string') {
        xtermRef.current?.writeln(output);
      }
    }
    prompt();
  };

  return (
    <div ref={terminalRef} className="h-full bg-[#1e1e1e] px-2 py-1 overflow-hidden" />
  );
};
