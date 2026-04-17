/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { VFSNode } from '@/src/types';
import { ChevronRight, ChevronDown, File, Folder, FileCode, FileText, Hash, Image as ImageIcon, Plus, FolderPlus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FileTreeProps {
  files: VFSNode[];
  activeFileId: string | null;
  onFileClick: (file: VFSNode) => void;
  onToggleFolder: (id: string) => void;
  onCreateFile: (parentId: string | null) => void;
  onCreateFolder: (parentId: string | null) => void;
  onDelete: (id: string) => void;
}

const FileIcon = ({ name, type }: { name: string; type: 'file' | 'folder' }) => {
  if (type === 'folder') return <Folder className="w-4 h-4 text-blue-400 fill-blue-400/20" />;
  
  const ext = name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
    case 'ts':
    case 'tsx':
    case 'jsx':
      return <FileCode className="w-4 h-4 text-yellow-500" />;
    case 'css':
    case 'scss':
      return <Hash className="w-4 h-4 text-blue-500" />;
    case 'html':
      return <FileCode className="w-4 h-4 text-orange-500" />;
    case 'md':
      return <FileText className="w-4 h-4 text-gray-400" />;
    case 'png':
    case 'jpg':
    case 'svg':
      return <ImageIcon className="w-4 h-4 text-purple-400" />;
    default:
      return <File className="w-4 h-4 text-gray-400" />;
  }
};

export const FileTree: React.FC<FileTreeProps> = ({
  files,
  activeFileId,
  onFileClick,
  onToggleFolder,
  onCreateFile,
  onCreateFolder,
  onDelete,
}) => {
  const renderTree = (parentId: string | null, depth = 0) => {
    const children = files
      .filter((f) => f.parentId === parentId)
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });

    return children.map((node) => (
      <div key={node.id} className="flex flex-col">
        <div
          className={cn(
            "group flex items-center py-1 px-2 cursor-pointer transition-colors duration-150 rounded-sm text-sm",
            activeFileId === node.id ? "bg-accent text-accent-foreground" : "hover:bg-accent/50 text-muted-foreground hover:text-foreground",
            depth > 0 && `ml-${depth * 2}`
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => (node.type === 'folder' ? onToggleFolder(node.id) : onFileClick(node))}
        >
          <span className="mr-1 w-4 h-4 flex items-center justify-center">
            {node.type === 'folder' && (
              node.isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
            )}
          </span>
          <span className="mr-2">
            <FileIcon name={node.name} type={node.type} />
          </span>
          <span className="truncate flex-1">{node.name}</span>
          
          <div className="hidden group-hover:flex items-center gap-1">
            {node.type === 'folder' && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); onCreateFile(node.id); }}
                  className="p-1 hover:bg-muted rounded"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onCreateFolder(node.id); }}
                  className="p-1 hover:bg-muted rounded"
                >
                  <FolderPlus className="w-3 h-3" />
                </button>
              </>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
              className="p-1 hover:bg-destructive/20 hover:text-destructive rounded"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
        
        {node.type === 'folder' && node.isOpen && (
          <div className="flex flex-col">
            {renderTree(node.id, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="py-2 select-none overflow-x-hidden">
      <div className="flex items-center justify-between px-4 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider opacity-50">Explorer</span>
        <div className="flex gap-1">
          <button onClick={() => onCreateFile(null)} className="p-1 hover:bg-muted rounded">
            <Plus className="w-3 h-3" />
          </button>
          <button onClick={() => onCreateFolder(null)} className="p-1 hover:bg-muted rounded">
            <FolderPlus className="w-3 h-3" />
          </button>
        </div>
      </div>
      <div className="flex flex-col">
        {renderTree(null)}
      </div>
    </div>
  );
};
