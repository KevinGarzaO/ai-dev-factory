"use client";

import React from "react";
import { useBacklog, Task } from "@/context/BacklogContext";
import { useState } from "react";
import AgentTerminal from "./AgentTerminal";

export default function SprintMatrix() {
  const { backlogData, setSelectedItem, setShowTerminal, setTerminalPrompt } = useBacklog();

  return (
    <main className="view-container">
      <div className="view-header">
        <h2>Sprint Board</h2>
      </div>
      <div className="taskboard-container">
        <div className="taskboard-header">
          <div className="tb-col-head"></div>
          <div className="tb-col-head">New</div>
          <div className="tb-col-head">Active</div>
          <div className="tb-col-head">Test</div>
          <div className="tb-col-head">Closed</div>
        </div>
        <div className="taskboard-body" id="taskboardBody">
          {backlogData.map(story => {
            const lanes: Record<string, Task[]> = {
              'New': [],
              'Active': [],
              'In Progress': [],
              'Test': [],
              'Done': [],
              'Closed': []
            };

            story.tasks.forEach(t => {
              if (lanes[t.state]) lanes[t.state].push(t);
              else lanes['New'].push(t); // fallback
            });

            const activeTasks = [...lanes['Active'], ...lanes['In Progress']];
            const closedTasks = [...lanes['Closed'], ...lanes['Done']];

            return (
              <div key={story.id} className="taskboard-row">
                <div className="tb-col-story">
                  <div className="story-card-vertical" onClick={() => setSelectedItem({ type: 'story', id: story.id })}>
                    <h4><i className="fa-solid fa-book-open" style={{ color: "#4ECCA3", marginRight: "4px" }}></i> {story.id} {story.title}</h4>
                    <div className="meta">
                      <span style={{ color: "var(--text-main)" }}>
                        <i className="fa-solid fa-circle" style={{ fontSize: "0.5rem", color: "var(--text-muted)" }}></i> {story.state}
                      </span>
                      <span><i className="fa-regular fa-user"></i> {story.assignee}</span>
                    </div>
                  </div>
                </div>

                {/* New */}
                <div className="tb-col-lane">
                  {lanes['New'].map(t => <MatrixCard key={t.id} task={t} storyId={story.id} setSelectedItem={setSelectedItem} />)}
                </div>

                {/* Active */}
                <div className="tb-col-lane">
                  {activeTasks.map(t => <MatrixCard key={t.id} task={t} storyId={story.id} setSelectedItem={setSelectedItem} />)}
                </div>

                {/* Test */}
                <div className="tb-col-lane">
                  {lanes['Test'].map(t => <MatrixCard key={t.id} task={t} storyId={story.id} setSelectedItem={setSelectedItem} />)}
                </div>

                {/* Closed */}
                <div className="tb-col-lane">
                  {closedTasks.map(t => <MatrixCard key={t.id} task={t} storyId={story.id} setSelectedItem={setSelectedItem} />)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* TERMINAL */}
      <AgentTerminal />
    </main>
  );
}

function MatrixCard({ task, storyId, setSelectedItem }: { task: Task, storyId: number, setSelectedItem: any }) {
  const stateColor = task.state === 'Done' || task.state === 'Closed' ? '#3fb379' : (task.state === 'In Progress' ? '#ffbd2e' : '#4ECCA3');

  return (
    <div className="matrix-card" style={{ borderLeftColor: stateColor }} onClick={(e) => { e.stopPropagation(); setSelectedItem({ type: 'task', id: task.id, parentId: storyId }); }}>
      <div className="card-id">
        <i className="fa-solid fa-check-square"></i> {task.id}
        {task.aiInstructions && (
          <i className="fa-solid fa-wand-magic-sparkles" title="Contiene instrucciones para IA" style={{ color: "#a78bfa", fontSize: "0.65rem", marginLeft: "6px" }}></i>
        )}
      </div>
      <h5>{task.title}</h5>
      <div className="meta">
        <span><i className="fa-solid fa-robot" style={{ color: "var(--primary)" }}></i> {task.assignee}</span>
      </div>
    </div>
  );
}
