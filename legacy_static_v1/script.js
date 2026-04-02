document.addEventListener('DOMContentLoaded', () => {
    // Nav Views
    const navBacklog = document.getElementById('navBacklog');
    const navSprint = document.getElementById('navSprint');
    const viewBacklog = document.getElementById('viewBacklog');
    const viewSprint = document.getElementById('viewSprint');
    const bottomTerminal = document.getElementById('bottomTerminal');

    navBacklog.onclick = () => { 
        navBacklog.classList.add('active'); navSprint.classList.remove('active'); 
        viewBacklog.classList.add('active'); viewSprint.classList.remove('active'); 
        bottomTerminal.classList.remove('expanded'); 
    };
    
    // Ensure terminal collapses when switching to Sprint
    navSprint.onclick = () => { 
        navSprint.classList.add('active'); 
        navBacklog.classList.remove('active'); 
        viewSprint.classList.add('active'); 
        viewBacklog.classList.remove('active'); 
        bottomTerminal.classList.remove('expanded'); // Start collapsed
        document.getElementById('toggleTerminalBtn').innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
        renderBoard();
    };

    // Terminal
    bottomTerminal.classList.remove('expanded'); // ensure it starts collapsed
    const toggleTerminalBtn = document.getElementById('toggleTerminalBtn');
    const termBody = document.getElementById('terminalLog');
    
    document.querySelector('.terminal-header').addEventListener('click', (e) => {
        if(e.target.id === 'killTaskBtn' || e.target.closest('#killTaskBtn')) return;
        bottomTerminal.classList.toggle('expanded');
        toggleTerminalBtn.innerHTML = bottomTerminal.classList.contains('expanded') ? '<i class="fa-solid fa-chevron-down"></i>' : '<i class="fa-solid fa-chevron-up"></i>';
    });

    const appendLog = (msg, type) => {
        const div = document.createElement('div');
        div.className = `log-entry ${type}`;
        div.textContent = msg;
        termBody.appendChild(div);
        termBody.scrollTop = termBody.scrollHeight;
    };

    // State Management for Backlog Hierarchy
    let backlogData = [];
    let currentId = 500; // default start
    
    const loadState = () => {
        try {
            const saved = localStorage.getItem('aiDevBacklog');
            if (saved) {
                backlogData = JSON.parse(saved);
                // Compute max ID to set currentId correctly
                let maxId = 500;
                backlogData.forEach(s => {
                    if (s.id >= maxId) maxId = s.id + 1;
                    s.tasks.forEach(t => { if (t.id >= maxId) maxId = t.id + 1; });
                });
                currentId = maxId;
            } else {
                // Initial Default State if empty
                backlogData = [
                    {
                        id: 507, type: 'story', title: 'Sistema de Login JWT', state: 'New', assignee: 'Unassigned', sprint: 'Sprint 1',
                        tasks: [
                            { id: 524, type: 'task', title: 'Crear middleware de rutas', desc: 'Proteger rutas API', state: 'New', assignee: 'AI Agent' }
                        ]
                    }
                ];
                currentId = 525;
            }
        } catch(e) {
            console.error(e);
        }
    };
    
    const saveState = () => {
        localStorage.setItem('aiDevBacklog', JSON.stringify(backlogData));
    };

    const tableBody = document.getElementById('backlogTableBody');

    const renderTable = () => {
        tableBody.innerHTML = '';
        backlogData.forEach((story, index) => {
            const trStory = document.createElement('tr');
            trStory.className = "table-row";
            trStory.onclick = () => openWorkItemPage('story', story.id);
            trStory.innerHTML = `
                <td align="center">${index + 1}</td>
                <td><i class="fa-solid fa-book-open" style="color: #45f3ff;"></i> User Story</td>
                <td>${story.id}</td>
                <td style="font-weight: 500;">
                    <i class="fa-solid fa-chevron-down" style="font-size: 0.7rem; margin-right: 6px; color: var(--text-muted);"></i>
                    <i class="fa-solid fa-book" style="color:#fff; margin-right:6px;"></i> ${story.title}
                </td>
                <td><span class="state-dot ${story.state.toLowerCase()}"></span> ${story.state}</td>
                <td>${story.assignee}</td>
                <td>AI-Factory\\${story.sprint}</td>
            `;
            tableBody.appendChild(trStory);

            story.tasks.forEach(task => {
                const trTask = document.createElement('tr');
                trTask.className = "table-row";
                trTask.onclick = (e) => { e.stopPropagation(); openWorkItemPage('task', task.id, story.id); };
                let stateColor = task.state === 'Done' || task.state === 'Closed' ? 'closed' : (task.state === 'In Progress' ? 'active' : 'new');
                
                trTask.innerHTML = `
                    <td align="center"></td>
                    <td style="padding-left: 24px;"><i class="fa-solid fa-check-square" style="color: #ffbd2e;"></i> Task</td>
                    <td>${task.id}</td>
                    <td style="padding-left: 36px;">
                        <i class="fa-regular fa-file-code" style="color:#fff; margin-right:6px;"></i> ${task.title}
                    </td>
                    <td><span class="state-dot ${stateColor}"></span> ${task.state}</td>
                    <td>${task.assignee}</td>
                    <td>AI-Factory\\${story.sprint}</td>
                `;
                tableBody.appendChild(trTask);
            });
        });
    };

    const renderBoard = () => {
        const boardBody = document.getElementById('taskboardBody');
        if (!boardBody) return;
        boardBody.innerHTML = '';

        // Iterate solely based on stories to build the matrix rows
        backlogData.forEach(story => {
            // Only show stories that belong to an active sprint/pipeline mapping or have tasks.
            // For now, let's just render all stories that have tasks or belong to Sprint 1.
            
            const tr = document.createElement('div');
            tr.className = 'taskboard-row';
            
            // Layout buckets for task states
            const lanes = {
                'New': [],
                'Active': [],  // Maps to "In Progress" internally sometimes
                'In Progress': [],
                'Test': [],
                'Done': [],
                'Closed': []
            };
            
            story.tasks.forEach(t => {
                if (lanes[t.state]) lanes[t.state].push(t);
                else lanes['New'].push(t); // fallback
            });
            
            // Build the Story Column (Leftmost)
            let rowHtml = `
                <div class="tb-col-story">
                    <div class="story-card-vertical" onclick="openWorkItemPage('story', ${story.id})">
                        <h4><i class="fa-solid fa-book-open" style="color: #45f3ff; margin-right:4px;"></i> ${story.id} ${story.title}</h4>
                        <div class="meta">
                            <span style="color:var(--text-main);"><i class="fa-solid fa-circle" style="font-size:0.5rem; color:var(--text-muted);"></i> ${story.state}</span>
                            <span><i class="fa-regular fa-user"></i> ${story.assignee}</span>
                        </div>
                    </div>
                </div>
            `;
            
            // Helper to generate lane HTML
            const buildLaneHtml = (tlist) => {
                let html = `<div class="tb-col-lane">`;
                tlist.forEach(task => {
                    let stateColor = task.state === 'Done' || task.state === 'Closed' ? '#3fb379' : (task.state === 'In Progress' ? '#ffbd2e' : '#45f3ff');
                    html += `
                        <div class="matrix-card" onclick="event.stopPropagation(); openWorkItemPage('task', ${task.id}, ${story.id})" style="border-left-color: ${stateColor};">
                            <div class="card-id"><i class="fa-solid fa-check-square"></i> ${task.id}</div>
                            <h5>${task.title}</h5>
                            <div class="meta">
                                <span><i class="fa-solid fa-robot" style="color:var(--primary);"></i> ${task.assignee}</span>
                            </div>
                        </div>
                    `;
                });
                html += `</div>`;
                return html;
            };
            
            rowHtml += buildLaneHtml(lanes['New']);
            rowHtml += buildLaneHtml(lanes['Active'].concat(lanes['In Progress']));
            rowHtml += buildLaneHtml(lanes['Test']);
            rowHtml += buildLaneHtml(lanes['Closed'].concat(lanes['Done']));
            
            tr.innerHTML = rowHtml;
            boardBody.appendChild(tr);
        });
    };

    // Full Page Work Item Form Logic
    const workItemPage = document.getElementById('workItemPage');
    
    // Custom Dropdown UI
    const newWorkItemDropdownBtn = document.getElementById('newWorkItemDropdownBtn');
    const newWorkItemMenu = document.getElementById('newWorkItemMenu');
    
    newWorkItemDropdownBtn.onclick = (e) => {
        e.stopPropagation();
        newWorkItemMenu.classList.toggle('hidden');
    };
    
    document.addEventListener('click', () => {
        newWorkItemMenu.classList.add('hidden');
    });

    let currentCreateType = 'story'; // Tracks what user selected
    let currentEditId = null;
    let currentEditParentId = null;

    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.onclick = (e) => {
            currentCreateType = item.dataset.type;
            openWorkItemPage(currentCreateType);
        };
    });

    const backToWorkItemsBtn = document.getElementById('backToWorkItemsBtn');
    const saveWorkItemBtn = document.getElementById('saveWorkItemBtn');
    const runAgentFromWiBtn = document.getElementById('runAgentFromWiBtn');
    
    // Form fields
    const wiTypeDisplay = document.getElementById('wiTypeDisplay');
    const wiTitle = document.getElementById('wiTitle');
    const wiState = document.getElementById('wiState');
    const wiIteration = document.getElementById('wiIteration');
    const wiParentContainer = document.getElementById('wiParentContainer');
    const wiParentStory = document.getElementById('wiParentStory');
    const wiDescription = document.getElementById('wiDescription');

    const openWorkItemPage = (type, editId = null, parentId = null) => {
        currentEditId = editId;
        currentEditParentId = parentId;
        
        const isTask = type === 'task';
        const isBug = type === 'bug';
        
        // Reset Run button visibility
        runAgentFromWiBtn.style.display = 'none';
        runAgentFromWiBtn.onclick = null;
        
        // Setup UI for type
        if (isTask) {
            wiTypeDisplay.innerHTML = `<i class="fa-solid fa-check-square" style="color: #ffbd2e;"></i> ${editId ? 'TASK ' + editId : 'NEW TASK *'}`;
            wiParentContainer.style.display = 'flex';
            wiParentStory.innerHTML = backlogData.map(s => `<option value="${s.id}">[${s.id}] ${s.title}</option>`).join('');
            wiDescription.style.display = 'block';
            
            if (editId) {
                runAgentFromWiBtn.style.display = 'inline-flex';
                runAgentFromWiBtn.onclick = () => {
                    workItemPage.classList.add('hidden');
                    runTask(parentId, editId);
                };
            }
        } else if (isBug) {
            wiTypeDisplay.innerHTML = `<i class="fa-solid fa-bug" style="color: #f44336;"></i> ${editId ? 'BUG ' + editId : 'NEW BUG *'}`;
            wiParentContainer.style.display = 'flex';
            wiParentStory.innerHTML = backlogData.map(s => `<option value="${s.id}">[${s.id}] ${s.title}</option>`).join('');
            wiDescription.style.display = 'block';
        } else {
            wiTypeDisplay.innerHTML = `<i class="fa-solid fa-book-open" style="color:#45f3ff;"></i> ${editId ? 'USER STORY ' + editId : 'NEW USER STORY *'}`;
            wiParentContainer.style.display = 'none';
            wiDescription.style.display = 'none'; 
        }
        
        if (editId) {
            // Edit Mode - Load values
            let item;
            if (type === 'story') {
                item = backlogData.find(s => s.id === editId);
            } else {
                const parent = backlogData.find(s => s.id === parentId);
                item = parent.tasks.find(t => t.id === editId);
                wiParentStory.value = parentId;
            }
            if(item) {
                wiTitle.value = item.title;
                wiState.value = item.state;
                wiIteration.value = item.sprint;
                wiDescription.value = item.desc || '';
                
                if(item.state === 'Done') {
                    runAgentFromWiBtn.innerHTML = '<i class="fa-solid fa-check"></i> Done';
                    runAgentFromWiBtn.disabled = true;
                    runAgentFromWiBtn.style.opacity = '0.5';
                } else {
                    runAgentFromWiBtn.innerHTML = '<i class="fa-solid fa-rocket"></i> Run Agent';
                    runAgentFromWiBtn.disabled = false;
                    runAgentFromWiBtn.style.opacity = '1';
                }
            }
        } else {
            // Create Mode
            wiTitle.value = '';
            wiState.value = 'New';
            wiIteration.value = 'Backlog';
            wiDescription.value = '';
        }
        
        workItemPage.classList.remove('hidden');
    };
    
    backToWorkItemsBtn.onclick = () => workItemPage.classList.add('hidden');

    saveWorkItemBtn.onclick = () => {
        const type = currentCreateType; // this might be wrong for edits if they clicked a different dropdown before clicking row.
        // Actually, let's derive type from editId context or UI state
        // Let's use wiTypeDisplay logic to know the type
        const isEditingStory = wiTypeDisplay.textContent.includes('USER STORY');
        
        const title = wiTitle.value.trim();
        const sprint = wiIteration.value;
        const state = wiState.value;
        const desc = wiDescription.value.trim();
        
        if(!title) return alert("Title is required");

        if (currentEditId) {
            // Update Existing Items
            if (isEditingStory) {
                const story = backlogData.find(s => s.id === currentEditId);
                story.title = title;
                story.state = state;
                story.sprint = sprint;
            } else {
                const parent = backlogData.find(s => s.id === currentEditParentId);
                const task = parent.tasks.find(t => t.id === currentEditId);
                task.title = title;
                task.state = state;
                task.sprint = sprint;
                task.desc = desc || title;
                
                // If parent changed, we would need array moving logic. Ignoring for mock simplicity.
            }
        } else {
            // Create New Item
            const activeType = wiTypeDisplay.textContent.includes('TASK') ? 'task' : 'story';
            
            if (activeType === 'story') {
                backlogData.push({
                    id: currentId++,
                    type: 'story',
                    title: title,
                    state: state,
                    assignee: 'Unassigned',
                    sprint: sprint,
                    tasks: []
                });
            } else {
                const parentId = parseInt(wiParentStory.value);
                const parent = backlogData.find(s => s.id === parentId);
                if(!parent) return alert("Select a parent story");
                
                parent.tasks.push({
                    id: currentId++,
                    type: 'task',
                    title: title,
                    desc: desc || title,
                    state: state,
                    assignee: 'AI Agent'
                });
            }
        }

        saveState();
        renderTable();
        renderBoard();
        workItemPage.classList.add('hidden');
    };

    // Agent Execution Logic
    let activeAbortController = null;

    document.getElementById('killTaskBtn').onclick = (e) => { e.stopPropagation(); abortTask(); };
    document.addEventListener('keydown', (e) => { if(e.ctrlKey && e.key.toLowerCase()==='c') abortTask(); });

    const abortTask = () => {
        if(activeAbortController) {
            activeAbortController.abort();
            activeAbortController = null;
            appendLog(`[SYSTEM] Task aborted by user (Ctrl+C).`, 'error');
            document.getElementById('globalAgentLoader')?.classList.add('hidden');
            renderTable(); // reset buttons
            saveState(); // State was manipulated by cancellation locally? actually state isn't changed yet by abort alone here.
        }
    };

    window.runTask = async (storyId, taskId) => {
        if(activeAbortController) return alert("Already running a task! Kill it first.");
        
        const story = backlogData.find(s => s.id === storyId);
        const task = story.tasks.find(t => t.id === taskId);
        
        task.state = 'In Progress';
        saveState();
        renderTable();
        renderBoard();

        navSprint.click();
        // Automatically expand the terminal when running an agent
        bottomTerminal.classList.add('expanded');
        toggleTerminalBtn.innerHTML = '<i class="fa-solid fa-chevron-down"></i>';
        document.getElementById('globalAgentLoader').classList.remove('hidden');
        
        appendLog(`--- STARTING TASK [${task.id}] ---`, 'sys');
        appendLog(`[REQUEST]: Automated implementation: "${task.title}"`, 'user');

        activeAbortController = new AbortController();
        const taskPrompt = `FEATURE: ${task.title}. ${task.desc}`;

        try {
            const response = await fetch('http://localhost:3000/api/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task: taskPrompt }),
                signal: activeAbortController.signal
            });

            if (!response.body) throw new Error("Connection failed");
            
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = "";

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                let boundary = buffer.indexOf('\n\n');
                while (boundary !== -1) {
                    const chunk = buffer.substring(0, boundary).trim();
                    buffer = buffer.substring(boundary + 2);
                    if (chunk.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(chunk.substring(6));
                            appendLog(data.msg, data.type);
                            if (data.type === 'done') {
                                document.getElementById('globalAgentLoader').classList.add('hidden');
                                activeAbortController = null;
                                task.state = 'Done';
                                saveState();
                                renderTable();
                                renderBoard();
                                return;
                            }
                        } catch (e) {}
                    }
                    boundary = buffer.indexOf('\n\n');
                }
            }
        } catch (error) {
            if(error.name !== 'AbortError') {
                appendLog(`[ERROR]: ${error.message}`, 'error');
                document.getElementById('globalAgentLoader').classList.add('hidden');
                activeAbortController = null;
                task.state = 'New';
                saveState();
                renderTable();
                renderBoard();
            }
        }
    };

    // Initialize
    loadState();
    // Expose openWorkItemPage globally for inline HTML handlers in matrix cards
    window.openWorkItemPage = openWorkItemPage;
    
    renderTable();
    renderBoard();
});
