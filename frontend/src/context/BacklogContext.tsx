"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type TaskStatus = "New" | "Active" | "In Progress" | "Test" | "Done" | "Closed";

export interface Task {
  id: number;
  type: "task";
  title: string;
  desc: string;
  aiInstructions?: string;
  state: TaskStatus;
  assignee: string;
}

export interface UserStory {
  id: number;
  type: "story";
  title: string;
  state: TaskStatus;
  assignee: string;
  sprint: string;
  tasks: Task[];
}

interface BacklogContextProps {
  backlogData: UserStory[];
  setBacklogData: React.Dispatch<React.SetStateAction<UserStory[]>>;
  updateTaskState: (storyId: number, taskId: number, newState: TaskStatus) => void;
  getNextId: () => number;
  // Modal State
  selectedItem: { type: 'story' | 'task', id: number, parentId?: number } | null;
  setSelectedItem: React.Dispatch<React.SetStateAction<{ type: 'story' | 'task', id: number, parentId?: number } | null>>;
  closeModal: () => void;
  refreshBacklog: () => Promise<void>;
  // Terminal
  showTerminal: boolean;
  setShowTerminal: (show: boolean) => void;
  terminalPrompt: string;
  setTerminalPrompt: (prompt: string) => void;
}

const BacklogContext = createContext<BacklogContextProps | undefined>(undefined);

export function BacklogProvider({ children }: { children: React.ReactNode }) {
  const [backlogData, setBacklogData] = useState<UserStory[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ type: 'story' | 'task', id: number, parentId?: number } | null>(null);
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalPrompt, setTerminalPrompt] = useState("");

  const closeModal = () => setSelectedItem(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/work-items');
        if (response.ok) {
          const text = await response.text();
          if (text && text.trim().startsWith('[')) {
            setBacklogData(JSON.parse(text));
          }
        }
      } catch (e) {
        console.error("Failed to load initial data from API", e);
      } finally {
        setIsLoaded(true);
      }
    };
    fetchData();
  }, []);

  const refreshBacklog = async () => {
    try {
      const response = await fetch('/api/work-items');
      if (response.ok) {
        const text = await response.text();
        if (text && text.trim().startsWith('[')) {
          setBacklogData(JSON.parse(text));
        }
      }
    } catch (e) {
      console.error("Manual refresh failed", e);
    }
  };

  // Update backend via API in the future, for now update local state
  const updateTaskState = (storyId: number, taskId: number, newState: TaskStatus) => {
    setBacklogData(prev => prev.map(story => {
      if (story.id === storyId) {
        return {
          ...story,
          tasks: story.tasks.map(t => t.id === taskId ? { ...t, state: newState } : t)
        };
      }
      return story;
    }));
  };

  const getNextId = () => {
    let maxId = 500;
    backlogData.forEach(s => {
      if (s.id >= maxId) maxId = s.id + 1;
      s.tasks.forEach(t => { if (t.id >= maxId) maxId = t.id + 1; });
    });
    return maxId;
  };

  return (
    <BacklogContext.Provider value={{ 
      backlogData, setBacklogData, updateTaskState, getNextId, 
      selectedItem, setSelectedItem, closeModal, refreshBacklog,
      showTerminal, setShowTerminal, terminalPrompt, setTerminalPrompt
    }}>
      {children}
    </BacklogContext.Provider>
  );
}

export const useBacklog = () => {
  const context = useContext(BacklogContext);
  if (!context) throw new Error("useBacklog must be used within BacklogProvider");
  return context;
};
