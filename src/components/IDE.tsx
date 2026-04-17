/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  VFSNode, 
  IDEState, 
  Extension 
} from '@/src/types';
import { 
  getVFS, 
  saveVFS, 
  getLanguageByExtension 
} from '@/src/lib/vfs';
import { 
  builtInExtensions, 
  getInstalledExtensions, 
  toggleExtension 
} from '@/src/lib/extensions';
import { 
  Files, 
  Search, 
  Blocks, 
  Settings, 
  X, 
  Terminal as TerminalIcon, 
  Bell, 
  Info, 
  CheckCircle2, 
  Loader2,
  Menu,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FileTree } from './FileTree';
import { Editor } from './Editor';
import { Terminal } from './Terminal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export const IDE: React.FC = () => {
  const [state, setState] = useState<IDEState>(() => ({
    files: getVFS(),
    activeFileId: null,
    openFiles: [],
    sidebarVisible: true,
    activityTab: 'explorer',
  }));

  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    type: 'file' | 'folder';
    parentId: string | null;
    name: string;
  }>({
    isOpen: false,
    type: 'file',
    parentId: null,
    name: '',
  });

  const [activeExtensions, setActiveExtensions] = useState<Extension[]>(getInstalledExtensions);
  const [statusBarItems, setStatusBarItems] = useState<{ text: string; priority: number }[]>([]);

  // Auto-save VFS
  useEffect(() => {
    saveVFS(state.files);
  }, [state.files]);

  const handleFileClick = (file: VFSNode) => {
    setState(prev => ({
      ...prev,
      activeFileId: file.id,
      openFiles: prev.openFiles.includes(file.id) ? prev.openFiles : [...prev.openFiles, file.id],
    }));
  };

  const closeFile = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setState(prev => {
      const newOpenFiles = prev.openFiles.filter(fid => fid !== id);
      let newActiveFileId = prev.activeFileId;
      if (prev.activeFileId === id) {
        newActiveFileId = newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1] : null;
      }
      return { ...prev, openFiles: newOpenFiles, activeFileId: newActiveFileId };
    });
  };

  const toggleFolder = (id: string) => {
    setState(prev => ({
      ...prev,
      files: prev.files.map(f => f.id === id ? { ...f, isOpen: !f.isOpen } : f),
    }));
  };

  const handleContentChange = (id: string, content: string) => {
    setState(prev => ({
      ...prev,
      files: prev.files.map(f => f.id === id ? { ...f, content } : f),
    }));
  };

  const createNode = () => {
    const newNode: VFSNode = {
      id: Math.random().toString(36).substr(2, 9),
      name: dialog.name,
      type: dialog.type,
      parentId: dialog.parentId,
      content: dialog.type === 'file' ? '' : undefined,
      language: dialog.type === 'file' ? getLanguageByExtension(dialog.name) : undefined,
      isOpen: dialog.type === 'folder' ? true : undefined,
    };

    setState(prev => ({
      ...prev,
      files: [...prev.files, newNode],
      activeFileId: newNode.type === 'file' ? newNode.id : prev.activeFileId,
      openFiles: (newNode.type === 'file' && !prev.openFiles.includes(newNode.id)) 
        ? [...prev.openFiles, newNode.id] 
        : prev.openFiles,
    }));

    setDialog(prev => ({ ...prev, isOpen: false, name: '' }));
  };

  const handleTerminalCommand = (cmd: string, args: string[]): string | void => {
    switch (cmd.toLowerCase()) {
      case 'help':
        return 'Available commands: ls, mkdir, touch, rm, clear, help, echo, version';
      case 'ls':
        return state.files
          .filter(f => f.parentId === 'root')
          .map(f => (f.type === 'folder' ? `\x1b[1;34m${f.name}/\x1b[0m` : f.name))
          .join('  ');
      case 'mkdir':
        if (!args[0]) return 'usage: mkdir <name>';
        const newFolder: VFSNode = {
          id: Math.random().toString(36).substr(2, 9),
          name: args[0],
          type: 'folder',
          parentId: 'root',
          isOpen: true,
        };
        setState(p => ({ ...p, files: [...p.files, newFolder] }));
        return `Created directory ${args[0]}`;
      case 'touch':
        if (!args[0]) return 'usage: touch <name>';
        const newFile: VFSNode = {
          id: Math.random().toString(36).substr(2, 9),
          name: args[0],
          type: 'file',
          parentId: 'root',
          content: '',
          language: getLanguageByExtension(args[0]),
        };
        setState(p => ({ ...p, files: [...p.files, newFile] }));
        return `Created file ${args[0]}`;
      case 'rm':
        if (!args[0]) return 'usage: rm <name>';
        const toDelete = state.files.find(f => f.name === args[0]);
        if (!toDelete) return `rm: ${args[0]}: No such file or directory`;
        deleteNode(toDelete.id);
        return `Removed ${args[0]}`;
      case 'clear':
        return '\x1bc';
      case 'echo':
        return args.join(' ');
      case 'version':
        return 'Web IDE v1.2.0 (Local Storage Edition)';
      default:
        return `bash: ${cmd}: command not found`;
    }
  };

  const deleteNode = (id: string) => {
    const nodeToDelete = state.files.find(f => f.id === id);
    if (!nodeToDelete) return;

    const getAllChildren = (parentId: string): string[] => {
      const children = state.files.filter(f => f.parentId === parentId);
      return [...children.map(c => c.id), ...children.flatMap(c => getAllChildren(c.id))];
    };

    const idsToDelete = nodeToDelete.type === 'folder' ? [id, ...getAllChildren(id)] : [id];

    setState(prev => ({
      ...prev,
      files: prev.files.filter(f => !idsToDelete.includes(f.id)),
      openFiles: prev.openFiles.filter(fid => !idsToDelete.includes(fid)),
      activeFileId: idsToDelete.includes(prev.activeFileId!) ? null : prev.activeFileId,
    }));
  };

  const activeFile = state.files.find(f => f.id === state.activeFileId) || null;

  return (
    <div className="flex h-screen w-full bg-[#1e1e1e] text-foreground font-sans overflow-hidden">
      {/* Activity Bar */}
      <div className="w-12 bg-[#333333] flex flex-col items-center py-4 gap-4 border-r border-[#2b2b2b]">
        <ActivityIcon 
          icon={Files} 
          active={state.activityTab === 'explorer'} 
          onClick={() => setState(p => ({ ...p, activityTab: 'explorer', sidebarVisible: p.activityTab === 'explorer' ? !p.sidebarVisible : true }))}
        />
        <ActivityIcon 
          icon={Search} 
          active={state.activityTab === 'search'} 
          onClick={() => setState(p => ({ ...p, activityTab: 'search', sidebarVisible: p.activityTab === 'search' ? !p.sidebarVisible : true }))}
        />
        <ActivityIcon 
          icon={Blocks} 
          active={state.activityTab === 'extensions'} 
          onClick={() => setState(p => ({ ...p, activityTab: 'extensions', sidebarVisible: p.activityTab === 'extensions' ? !p.sidebarVisible : true }))}
        />
        <div className="mt-auto flex flex-col gap-4">
           <ActivityIcon 
            icon={Settings} 
            active={state.activityTab === 'settings'} 
            onClick={() => setState(p => ({ ...p, activityTab: 'settings', sidebarVisible: p.activityTab === 'settings' ? !p.sidebarVisible : true }))}
          />
        </div>
      </div>

      {/* Sidebar */}
      {state.sidebarVisible && (
        <div className="w-64 bg-[#252526] border-r border-[#2b2b2b] flex flex-col group/sidebar overflow-hidden animate-in slide-in-from-left duration-200">
          {state.activityTab === 'explorer' && (
            <FileTree 
              files={state.files} 
              activeFileId={state.activeFileId}
              onFileClick={handleFileClick}
              onToggleFolder={toggleFolder}
              onCreateFile={(parentId) => setDialog({ isOpen: true, type: 'file', parentId, name: '' })}
              onCreateFolder={(parentId) => setDialog({ isOpen: true, type: 'folder', parentId, name: '' })}
              onDelete={deleteNode}
            />
          )}

          {state.activityTab === 'extensions' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-[#3c3c3c]">
                <h2 className="text-xs font-semibold uppercase tracking-wider mb-2 opacity-50">Marketplace</h2>
                <Input placeholder="Search Extensions in Marketplace" className="h-7 bg-[#3c3c3c] border-none text-[11px] placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary" />
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase opacity-50">Recommended</div>
                  {builtInExtensions.map(ext => (
                    <div key={ext.id} className="group flex p-2 hover:bg-[#2a2d2e] rounded cursor-pointer transition-colors border border-transparent hover:border-[#3c3c3c]">
                      <div className="w-10 h-10 bg-[#333333] rounded flex items-center justify-center mr-3 shrink-0 overflow-hidden">
                        {ext.icon ? (
                          <img src={ext.icon} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <Blocks className="w-5 h-5 opacity-20" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[13px] truncate text-foreground/90">{ext.name}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate mb-1">{ext.description}</p>
                        <div className="flex items-center gap-2 text-[10px]">
                           <span className="text-primary font-bold">{ext.publisher}</span>
                           <span className="opacity-40">{ext.version}</span>
                        </div>
                      </div>
                      <div className="hidden group-hover:flex items-center ml-2">
                         <Button 
                            size="sm" 
                            variant="ghost"
                            className={cn(
                              "h-6 text-[10px] px-2",
                              activeExtensions.some(e => e.id === ext.id) ? "text-destructive hover:text-destructive hover:bg-destructive/10" : "text-primary hover:bg-primary/10"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExtension(ext.id);
                              setActiveExtensions(getInstalledExtensions());
                            }}
                          >
                            {activeExtensions.some(e => e.id === ext.id) ? 'Uninstall' : 'Install'}
                          </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {state.activityTab === 'search' && (
            <div className="p-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider mb-4 opacity-50">Search (Simulated)</h2>
              <Input placeholder="Search within project..." className="h-8 bg-[#3c3c3c] border-none text-xs" />
              <div className="mt-8 flex flex-col items-center justify-center opacity-30 text-center px-4">
                <Search className="w-8 h-8 mb-2" />
                <p className="text-xs">IndexedDB search coming soon to local storage.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full bg-[#1e1e1e]">
        {/* Editor Tabs */}
        <div className="h-9 bg-[#252526] flex items-center overflow-x-auto border-b border-[#1e1e1e] no-scrollbar">
          {state.openFiles.map(fid => {
            const file = state.files.find(f => f.id === fid);
            if (!file) return null;
            return (
              <div 
                key={file.id} 
                onClick={() => setState(p => ({ ...p, activeFileId: file.id }))}
                className={cn(
                  "h-full flex items-center px-3 gap-2 text-xs border-r border-[#1e1e1e] cursor-pointer group min-w-[120px] max-w-[200px] transition-all duration-200",
                  state.activeFileId === file.id ? "bg-[#1e1e1e] text-foreground border-t-2 border-primary" : "bg-[#2d2d2d] text-muted-foreground hover:bg-[#2a2d2e]"
                )}
              >
                <div className="flex-1 truncate">{file.name}</div>
                <button 
                  onClick={(e) => closeFile(e, file.id)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-muted rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Breadcrumbs */}
        <div className="h-6 bg-[#1e1e1e] flex items-center px-4 gap-1 text-[11px] text-muted-foreground">
          <span className="hover:text-foreground cursor-pointer">project</span>
          {activeFile && (
            <>
              <ChevronRight className="w-3 h-3 opacity-30" />
              <span className="text-foreground">{activeFile.name}</span>
            </>
          )}
        </div>

        {/* Editor Area */}
        <Editor file={activeFile} onContentChange={handleContentChange} />

        {/* Simulated Panel (Terminal) */}
        <div className="h-64 bg-[#1e1e1e] border-t border-[#333333] flex flex-col">
          <div className="h-9 px-4 flex items-center gap-6 text-[11px] font-medium bg-[#1e1e1e] border-b border-[#2b2b2b]">
             <span className="border-b-[1.5px] border-primary h-full flex items-center text-foreground hover:text-foreground cursor-pointer">TERMINAL</span>
             <span className="opacity-60 hover:text-foreground cursor-pointer h-full flex items-center">OUTPUT</span>
             <span className="opacity-60 hover:text-foreground cursor-pointer h-full flex items-center">DEBUG CONSOLE</span>
             <span className="opacity-60 hover:text-foreground cursor-pointer h-full flex items-center">PROBLEMS</span>
             <div className="ml-auto flex items-center gap-4 opacity-70">
               <Plus className="w-3.5 h-3.5 hover:text-foreground cursor-pointer" />
               <Trash2 className="w-3.5 h-3.5 hover:text-foreground cursor-pointer" />
               <X className="w-4 h-4 hover:text-foreground cursor-pointer" />
             </div>
          </div>
          <div className="flex-1">
            <Terminal files={state.files} onCommand={handleTerminalCommand} />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-[#007acc] text-white flex items-center px-4 text-[11px] select-none z-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 hover:bg-white/10 px-1 cursor-pointer">
            <CheckCircle2 className="w-3 h-3" />
            <span>Ready</span>
          </div>
          <div className="flex items-center gap-1 hover:bg-white/10 px-1 cursor-pointer">
             <Bell className="w-3 h-3" />
             <span>0</span>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {activeFile && (
            <>
              <div className="hover:bg-white/10 px-1 cursor-pointer">
                Spaces: 2
              </div>
              <div className="hover:bg-white/10 px-1 cursor-pointer uppercase">
                UTF-8
              </div>
              <div className="hover:bg-white/10 px-1 cursor-pointer capitalize">
                 {activeFile.language}
              </div>
            </>
          )}
          {activeExtensions.some(e => e.id === 'ext.git.lite') && (
            <div className="flex items-center gap-1 hover:bg-white/10 px-1 cursor-pointer">
               <Menu className="w-3 h-3 rotate-90" />
               <span>main*</span>
            </div>
          )}
        </div>
      </div>

      {/* Creation Modal */}
      <Dialog open={dialog.isOpen} onOpenChange={(o) => setDialog(p => ({ ...p, isOpen: o }))}>
        <DialogContent className="sm:max-w-md bg-[#252526] border-[#333333] text-foreground">
          <DialogHeader>
            <DialogTitle>Create New {dialog.type === 'file' ? 'File' : 'Folder'}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input 
              value={dialog.name} 
              onChange={(e) => setDialog(p => ({ ...p, name: e.target.value }))}
              placeholder={dialog.type === 'file' ? 'index.js' : 'src'}
              autoFocus
              className="bg-[#3c3c3c] border-none"
              onKeyDown={(e) => e.key === 'Enter' && createNode()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(p => ({ ...p, isOpen: false }))}>Cancel</Button>
            <Button onClick={createNode} disabled={!dialog.name}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ActivityIcon = ({ icon: Icon, active, onClick }: { icon: any, active?: boolean, onClick: () => void }) => (
  <div 
    onClick={onClick}
    className={cn(
      "p-2 cursor-pointer transition-all duration-200 relative",
      active ? "text-white scale-110" : "text-white/40 hover:text-white"
    )}
  >
    <Icon className="w-6 h-6" strokeWidth={1.5} />
    {active && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-white rounded-r"></div>}
  </div>
);
