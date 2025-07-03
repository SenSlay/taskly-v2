console.log("For backlog page");

// Load Data from Local Storage
let sprints = JSON.parse(localStorage.getItem("sprints")) || [];
let backlogTasks = JSON.parse(localStorage.getItem("backlogTasks")) || [];

// Default columns
const DEFAULT_COLUMNS = ["TO DO", "IN PROGRESS", "COMPLETED"];

// Load Kanban columns from localStorage or set defaults
let kanbanColumns = JSON.parse(localStorage.getItem("kanbanColumns")) || DEFAULT_COLUMNS;

console.log("Loaded sprints from localStorage:", sprints);

function saveData() {
    localStorage.setItem("sprints", JSON.stringify(sprints));
    console.log("Saved sprints:", sprints);
}

// Function to Render Task Status Options in Modal
function renderModalTaskStatus() {
    let taskStatusSelect = document.getElementById("taskStatus");

    if (!taskStatusSelect) {
        console.warn("taskStatus select element not found. Skipping renderModalTaskStatus.");
        return;
    }

    taskStatusSelect.innerHTML = ""; // Clear previous options

    kanbanColumns.forEach(status => {
        let option = document.createElement("option");
        option.value = status;
        option.textContent = status;
        taskStatusSelect.appendChild(option);
    });
}

// Call this function when the page loads
document.addEventListener("DOMContentLoaded", renderModalTaskStatus);

function renderSprints() {
  const sprintListContainer = document.querySelector(".sprint-list-container");
  if (!sprintListContainer) return;

  sprintListContainer.innerHTML = ""; // Clear existing content

  sprints.forEach((sprint, index) => {
      if (!sprint.tasks) sprint.tasks = []; // Ensure tasks array exists

      console.log(`Rendering Sprint: ${sprint.name}, Tasks:`, sprint.tasks); // Debugging

      const sprintContainer = document.createElement("div");
      sprintContainer.className = "sprint-container";
      sprintContainer.id = sprint.id;

      console.log(sprint.tasks.length);

      sprintContainer.innerHTML = `
          <div class="sprint-header">
              <h2>${sprint.name}</h2>
              <div>
                  <p><strong>Start:</strong> ${sprint.startDate}</p>
                  <p><strong>End:</strong> ${sprint.endDate}</p>
              </div>
              <button class="button complete-btn" data-index="${index}">Complete Sprint</button>
          </div>
          <div class="issue-container">
              ${sprint.tasks.length > 0 
                  ? sprint.tasks.map(task => taskTemplate(task, index)).join("")
                  : "This sprint has no tasks."}
          </div>
          <div>
            <button class="create-issue-button" data-index="${index}">+ Create Task</button>
          </div>
      `;
      sprintListContainer.prepend(sprintContainer);
  });

  addSprintEventListeners();
  console.log("Rendered sprints:", sprints); // Debugging
}


// Template for Task Items
function taskTemplate(task, sprintIndex) {
    return `
        <div class="task-item">
            <div class="task-details">
                <span>${task.name}</span>
                <span>Status: ${task.status}</span>
                <span>Assigned: ${task.assigned || "Unassigned"}</span>
            </div>
            <button class="edit-task" data-task-id="${task.id}" data-sprint-index="${sprintIndex !== null ? sprintIndex : 'backlog'}">Edit</button>
            <button class="delete-task" data-task-id="${task.id}" data-sprint-index="${sprintIndex !== null ? sprintIndex : 'backlog'}">Delete</button>
        </div>
    `;
}

function openEditTaskModal(taskId, sprintIndex = "backlog") {
  let task;
  console.log(taskId)
  console.log(backlogTasks)
  console.log(sprintIndex)

  if (sprintIndex == "backlog") {
      // Edit from Backlog
      task = backlogTasks.find(t => t.id == taskId);
    } else {
      // Edit from Sprint
      task = sprints[sprintIndex].tasks.find(t => t.id == taskId);
  }

  if (!task) return;

  console.log('Opening Edit Modal for Task:', task);

  document.querySelector(".task-modal-title").textContent = "Edit Task";
  document.querySelector(".task-modal-add-btn").textContent = "Save Edit";

  document.getElementById("taskName").value = task.name;
  document.getElementById("taskStatus").value = task.status;
  document.getElementById("taskAssigned").value = task.assigned || "";

  // Change form behavior to update existing task
  document.getElementById("taskForm").onsubmit = function (e) {
      e.preventDefault();
      saveTaskEdits(taskId, sprintIndex);
  };

  document.getElementById("taskModal").style.display = "block";
}

function saveTaskEdits(taskId, sprintIndex = "backlog") {
  let task;

  if (sprintIndex === "backlog") {
      // Update in Backlog
      task = backlogTasks.find(t => t.id == taskId);
      
  } else {
      // Update in Sprint
      task = sprints[sprintIndex].tasks.find(t => t.id == taskId);
  }

  if (!task) return;

  // Update task properties
  task.name = document.getElementById("taskName").value;
  task.status = document.getElementById("taskStatus").value;
  task.assigned = document.getElementById("taskAssigned").value;

  // Save and re-render
  saveData();
  renderSprints();
  renderBacklogTasks()
  // Close modal
  document.getElementById("taskModal").style.display = "none";
  document.getElementById("taskForm").reset();
}

document.addEventListener("click", function (e) {
  if (e.target.classList.contains("edit-task")) {
      console.log(e.target)
      const taskId = e.target.dataset.taskId;
      const sprintIndex = e.target.dataset.sprintIndex;
      openEditTaskModal(taskId, sprintIndex);
  }
});

// Create a New Sprint
function addSprint() {
    const name = document.getElementById("sprintName")?.value;
    const startDate = document.getElementById("startDate")?.value;
    const endDate = document.getElementById("endDate")?.value;

    if (!name || !startDate || !endDate) {
        alert("There's missing fields!");
        return;
    }

    const sprint = {
        id: `sprint-${Date.now()}`,
        name,
        startDate,
        endDate,
        tasks: [] // Ensure tasks array is initialized
    };

    sprints.push(sprint);
    saveData();
    renderSprints();
    closeModal();
}

// Attach Event Listeners
function addSprintEventListeners() {
    document.querySelectorAll(".complete-btn").forEach(button => {
        button.addEventListener("click", function () {
            const index = this.dataset.index;
            sprints.splice(index, 1);
            saveData();
            renderSprints();
        });
    });

    document.querySelectorAll(".create-issue-button").forEach(button => {
        button.addEventListener("click", function () {
            openTaskModal(this.dataset.index);
        });
    });

    document.querySelectorAll(".delete-task").forEach(button => {
        button.addEventListener("click", function () {
            const taskId = Number(this.dataset.taskId);
            sprints.forEach(sprint => {
                sprint.tasks = sprint.tasks.filter(task => task.id !== taskId);
            });
            saveData();
            renderSprints();
        });
    });
}

// Open Task Modal
function openTaskModal(sprintIndex) {
    const taskModal = document.getElementById("taskModal");
    if (taskModal) taskModal.style.display = "block";

    document.getElementById("taskForm").onsubmit = function (e) {
        e.preventDefault();
        addTask(sprintIndex);
    };
}

// Add Task to Sprint
function addTask(sprintIndex) {
    const taskName = document.getElementById("taskName")?.value;
    const taskStatus = document.getElementById("taskStatus")?.value;
    const taskAssigned = document.getElementById("taskAssigned")?.value;

    if (!taskName) return;

    const newTask = {
        id: Date.now(),
        name: taskName,
        status: taskStatus || "TO DO",
        assigned: taskAssigned || "Unassigned"
    };

    if (!sprints[sprintIndex].tasks) sprints[sprintIndex].tasks = []; // Ensure tasks array exists

    sprints[sprintIndex].tasks.push(newTask);
    saveData();
    renderSprints();

    document.getElementById("taskModal").style.display = "none";
    document.getElementById("taskForm").reset();
}

// Initialize Page
document.addEventListener("DOMContentLoaded", function () {
    renderSprints();
});

// Modal Handling
function openModal() {
    document.getElementById("sprintModal").style.display = "block";
}

function closeModal() {
    document.getElementById("sprintModal").style.display = "none";
    document.getElementById("sprintForm").reset();
}

document.querySelector("#taskModal .cancel-btn")?.addEventListener("click", () => {
    document.getElementById("taskModal").style.display = "none";
});

document.querySelector("#sprintModal .cancel-btn")?.addEventListener("click", closeModal);


// Function to Save Data
function saveData() {
  localStorage.setItem("sprints", JSON.stringify(sprints));
  localStorage.setItem("backlogTasks", JSON.stringify(backlogTasks));
}

function renderBacklogTasks() {
  const backlogContainer = document.querySelector(".backlog-container"); 
  if (!backlogContainer) return; 

  const issueContainer = backlogContainer.querySelector(".issue-container");
  if (!issueContainer) return;

  issueContainer.innerHTML = backlogTasks.length === 0 
      ? "<p>Your backlog is empty.</p>" 
      : backlogTasks.map(task => taskTemplate(task, null)).join("");

  addBacklogTaskEventListeners();
}

// Function to Add a Backlog Task
function addBacklogTask() {
  const taskName = document.getElementById("taskName")?.value;
  const taskStatus = document.getElementById("taskStatus")?.value;
  const taskAssigned = document.getElementById("taskAssigned")?.value;

  if (!taskName) return;

  const newTask = {
      id: Date.now(),
      name: taskName,
      status: taskStatus || "TO DO",
      assigned: taskAssigned || "Unassigned"
  };

  backlogTasks.push(newTask);
  saveData();
  renderBacklogTasks();

  document.getElementById("taskModal").style.display = "none";
  document.getElementById("taskForm").reset();
}

// Function to Delete Backlog Task
function deleteBacklogTask(taskId) {
  backlogTasks = backlogTasks.filter(task => task.id !== taskId);
  saveData();
  renderBacklogTasks();
}

// Event Listeners for Backlog Task Deletion
function addBacklogTaskEventListeners() {
  document.querySelectorAll(".delete-task").forEach(button => {
      button.addEventListener("click", function () {
          const taskId = Number(this.dataset.taskId);
          deleteBacklogTask(taskId);
      });
  });
}

// Open Task Modal for Backlog
document.querySelector(".create-backlog-task-button")?.addEventListener("click", () => {
  document.getElementById("taskModal").style.display = "block";
  document.getElementById("taskForm").onsubmit = function (e) {
      e.preventDefault();
      addBacklogTask();
  };
});

// Initialize Backlog Task List on Page Load
document.addEventListener("DOMContentLoaded", renderBacklogTasks);


// Save to localStorage if no stored columns exist
if (!localStorage.getItem("kanbanColumns")) {
  localStorage.setItem("kanbanColumns", JSON.stringify(DEFAULT_COLUMNS));
}


// BOARD.JS
const board = document.querySelector(".board");
if (board) {
    const addColumnBtn = document.createElement("button");
    addColumnBtn.id = "addColumnBtn";
    addColumnBtn.classList.add("add-column");
    addColumnBtn.textContent = "+";

    function getAllTasks() {
        return [
            ...sprints.flatMap(sprint => sprint.tasks),
            ...backlogTasks
        ];
    }

    function removeTask(taskId) {
      taskId = Number(taskId); // Ensure it's a number
  
      // Remove from backlog
      backlogTasks = backlogTasks.filter(task => task.id !== taskId);
  
      // Remove from sprints
      sprints.forEach(sprint => {
          sprint.tasks = sprint.tasks.filter(task => task.id !== taskId);
      });
  
      // Update localStorage
      localStorage.setItem("backlogTasks", JSON.stringify(backlogTasks));
      localStorage.setItem("sprints", JSON.stringify(sprints));
  
      console.log("Deleted Task ID:", taskId); // Debugging
    }

    function addTaskToColumn(taskContainer, task) {
      const taskItem = document.createElement("div");
      taskItem.classList.add("task-item");
      taskItem.setAttribute('draggable', true);
      taskItem.dataset.taskId = task.id; // Store task ID for reference
  
      // Add the class to mark it as being dragged
      taskItem.addEventListener('dragstart', function () {
          taskItem.classList.add('dragging');
      });
  
      taskItem.addEventListener('dragend', function () {
          taskItem.classList.remove('dragging');
      });
  
      // Create a text display for both task name and assignee
      const taskText = document.createElement("span");
      taskText.textContent = `${task.name} (Assigned to: ${task.assigned})`;
  
      // Create a delete button for the task
      const deleteBtn = document.createElement("button");
      deleteBtn.classList.add("delete-btn");
      deleteBtn.textContent = "x";
  
      deleteBtn.addEventListener("click", function () {
        console.log("Clicked delete for task:", task.id); // Debugging
        removeTask(taskItem.dataset.taskId);  // Remove from storage
        taskContainer.removeChild(taskItem);  // Remove from UI
      });

      // Append the task text and delete button to the task item
      taskItem.appendChild(taskText);
      taskItem.appendChild(deleteBtn);
  
      // Append the task item to the task container
      taskContainer.appendChild(taskItem);
  }

  function renderTasksForColumn(taskContainer, columnName) {
    taskContainer.innerHTML = ""; // Clear existing tasks

    getAllTasks()
        .filter(task => task.status.toUpperCase() === columnName.toUpperCase()) // Match tasks with column
        .forEach(task => addTaskToColumn(taskContainer, task));
    }

    function createModal() {
        const modal = document.createElement("div");
        modal.classList.add("modal");

        const modalContent = document.createElement("div");
        modalContent.classList.add("modal-content");

        const taskNameInput = document.createElement("input");
        taskNameInput.placeholder = "Task Name";
        taskNameInput.id = "taskNameInput";

        const assigneeInput = document.createElement("input");
        assigneeInput.placeholder = "Assignee Name";
        assigneeInput.id = "assigneeInput";

        const submitBtn = document.createElement("button");
        submitBtn.textContent = "Create Task";
        submitBtn.id = "submitTaskBtn";

        const closeModalBtn = document.createElement("button");
        closeModalBtn.textContent = "Close";
        closeModalBtn.id = "closeModalBtn";

        modalContent.append(taskNameInput, assigneeInput, submitBtn, closeModalBtn);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        modal.style.display = "none";
        return modal;
    }

    const modal = createModal();
    const submitBtn = document.getElementById("submitTaskBtn");
    const closeModalBtn = document.getElementById("closeModalBtn");

    function renderBoard() {
        board.innerHTML = "";
        kanbanColumns.forEach(createColumn);
        board.appendChild(addColumnBtn);
    }

    function createColumn(name) {
        const newColumn = document.createElement("div");
        newColumn.classList.add("column");

        const columnHeader = document.createElement("div");
        columnHeader.classList.add("column-header");

        const titleSpan = document.createElement("span");
        titleSpan.textContent = name.toUpperCase();

        const createTaskBtn = document.createElement("button");
        createTaskBtn.classList.add("create-task");
        createTaskBtn.textContent = "+ Create Task";

        const taskContainer = document.createElement("div");
        taskContainer.classList.add("task-container");

        taskContainer.addEventListener("dragover", function (e) {
          e.preventDefault(); // Allow dropping
      });
      
      taskContainer.addEventListener("drop", function (e) {
          e.preventDefault();
          const draggedTask = document.querySelector(".dragging");
          if (!draggedTask) return;
      
          const taskId = Number(draggedTask.dataset.taskId); // Get task ID
          const newStatus = titleSpan.textContent.trim(); // Get new column name
      
          updateTaskStatus(taskId, newStatus); // Update status in storage
          taskContainer.appendChild(draggedTask); // Move to new column
      });

        columnHeader.appendChild(titleSpan);
        newColumn.appendChild(columnHeader);
        newColumn.appendChild(createTaskBtn);
        newColumn.appendChild(taskContainer);

        board.appendChild(newColumn);

        addMenuToColumn(newColumn);
        makeColumnsEditable();

        renderTasksForColumn(taskContainer, name);

        createTaskBtn.addEventListener("click", function () {
            openModal(taskContainer, name);
        });
    }

    function updateTaskStatus(taskId, newStatus) {
      taskId = Number(taskId); // Ensure it's a number
  
      // Check backlog first
      let task = backlogTasks.find(task => task.id === taskId);
      if (task) {
          task.status = newStatus;
      } else {
          // Check in sprints
          sprints.forEach(sprint => {
              sprint.tasks.forEach(t => {
                  if (t.id === taskId) {
                      t.status = newStatus;
                  }
              });
          });
      }
  
      // Save updated data
      localStorage.setItem("backlogTasks", JSON.stringify(backlogTasks));
      localStorage.setItem("sprints", JSON.stringify(sprints));
  
      console.log(`Task ${taskId} moved to ${newStatus}`); // Debugging
  }

    function openModal(taskContainer, columnStatus) {
        modal.style.display = "block";
        taskNameInput.value = "";
        assigneeInput.value = "";

        submitBtn.onclick = function () {
            const taskName = taskNameInput.value.trim();
            const assignee = assigneeInput.value.trim() || "Unassigned";

            if (taskName) {
                addTask(taskName, assignee, columnStatus);
                modal.style.display = "none";
            }
        };
    }

    function addTask(taskName, assignee, status) {
      const newTask = {
          id: Date.now(),
          name: taskName,
          assigned: assignee,
          status: status
      };
  
      backlogTasks.push(newTask);
  
      // ✅ Save backlogTasks to localStorage
      localStorage.setItem("backlogTasks", JSON.stringify(backlogTasks));
  
      renderBoard(); // Re-render UI
    }
  

    closeModalBtn.addEventListener("click", function () {
        modal.style.display = "none";
    });

    function saveColumns() {
        localStorage.setItem("kanbanColumns", JSON.stringify(kanbanColumns));
    }

    function addMenuToColumn(column) {
        const columnHeader = column.querySelector(".column-header");

        if (columnHeader.querySelector(".menu-btn")) return;

        const menuBtn = document.createElement("button");
        menuBtn.classList.add("menu-btn");
        menuBtn.innerHTML = "⋮";

        const menuDropdown = document.createElement("div");
        menuDropdown.classList.add("menu-dropdown");
        menuDropdown.style.display = "none";

        const renameOption = document.createElement("div");
        renameOption.classList.add("menu-option");
        renameOption.textContent = "Rename";
        renameOption.addEventListener("click", () => editColumnName(columnHeader.querySelector("span")));

        const deleteOption = document.createElement("div");
        deleteOption.classList.add("menu-option");
        deleteOption.textContent = "Delete";
        deleteOption.addEventListener("click", () => deleteColumn(column));

        menuDropdown.append(renameOption, deleteOption);
        columnHeader.append(menuBtn, menuDropdown);

        menuBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            closeAllMenus();
            menuDropdown.style.display = "block";
        });

        document.addEventListener("click", () => (menuDropdown.style.display = "none"));
    }

    function makeColumnsEditable() {
        document.querySelectorAll(".column-header span").forEach((title) => {
            title.removeEventListener("click", handleTitleClick);
            title.addEventListener("click", handleTitleClick);
        });
    }

    function handleTitleClick(event) {
        editColumnName(event.target);
    }

    function editColumnName(title) {
        if (title.querySelector("input")) return;

        const currentText = title.textContent.trim();
        const input = document.createElement("input");
        input.type = "text";
        input.value = currentText;
        input.classList.add("edit-column-input");

        title.innerHTML = "";
        title.appendChild(input);
        input.focus();

        input.addEventListener("blur", () => saveColumnName(title, currentText, input));
        input.addEventListener("keypress", (e) => e.key === "Enter" && saveColumnName(title, currentText, input));
    }

    function saveColumnName(header, currentText, input) {
        const newText = input.value.trim().toUpperCase() || "Untitled Column";
        const index = kanbanColumns.indexOf(currentText.toUpperCase());
        
        if (index !== -1) {
            kanbanColumns[index] = newText;
            saveColumns();
        }
        header.textContent = newText;
    }

    function deleteColumn(column) {
      const columnName = column.querySelector(".column-header span").textContent;
      const index = kanbanColumns.findIndex(col => col.toUpperCase() === columnName.toUpperCase());
      
      if (index !== -1) {
          // Update tasks that were in this column
          backlogTasks.forEach(task => {
              if (task.status === columnName) {
                  task.status = ""; // Remove status
              }
          });
  
          // Also update tasks in sprints
          sprints.forEach(sprint => {
              sprint.tasks.forEach(task => {
                  if (task.status === columnName) {
                      task.status = ""; // Remove status
                  }
              });
          });
  
          // Remove the column
          kanbanColumns.splice(index, 1);
          saveColumns();
          saveData(); // Save updated tasks
          renderBoard();
      }
  }

    function closeAllMenus() {
        document.querySelectorAll(".menu-dropdown").forEach((menu) => (menu.style.display = "none"));
    }

    addColumnBtn.addEventListener("click", function () {
        const columnName = prompt("Enter column name:").trim().toUpperCase();
        if (columnName) {
            kanbanColumns.push(columnName);
            saveColumns();
            renderBoard();
        }
    });

    renderBoard();
}

// Overview
// Fetch tasks and sprints from localStorage
document.addEventListener("DOMContentLoaded", () => {
  const overview = document.querySelector(".overview-page");
  if (!overview) return;

  console.log(sprints)

  const allTasks = [
    ...sprints.flatMap(s => s.tasks),
    ...backlogTasks
  ];

  const statusCounts = Object.fromEntries(kanbanColumns.map(status => [status, 0]));
  allTasks.forEach(task => {
    const status = (task.status || "").toUpperCase();
    for (const col of kanbanColumns) {
      if (col.toUpperCase() === status) {
        statusCounts[col]++;
        break;
      }
    }
  });

  const statusCtx = document.getElementById("statusChart")?.getContext("2d");
  if (statusCtx) {
    new Chart(statusCtx, {
      type: "pie",
      data: {
        labels: Object.keys(statusCounts),
        datasets: [{
          label: "Status",
          data: Object.values(statusCounts),
          backgroundColor: Object.keys(statusCounts).map((_, i) =>
            `hsl(${i * 360 / Object.keys(statusCounts).length}, 70%, 60%)`)
        }]
      },
      options: { responsive: true }
    });
  }

  const legendContainer = document.querySelector(".legend");
  if (legendContainer) {
    legendContainer.innerHTML = "";
    Object.keys(statusCounts).forEach((status, i) => {
      const color = `hsl(${i * 360 / Object.keys(statusCounts).length}, 70%, 60%)`;
      const p = document.createElement("p");
      p.innerHTML = `<span style="color: ${color}">■</span> ${status}`;
      legendContainer.appendChild(p);
    });
  }

  const completedSprints = sprints.filter(s => s.completed).length;
  const ongoingSprints = sprints.length - completedSprints;

  const ctxSprint = document.getElementById("sprintChart")?.getContext("2d");
  if (ctxSprint) {
    new Chart(ctxSprint, {
      type: "pie",
      data: {
        labels: ["Completed", "Ongoing"],
        datasets: [{
          data: [completedSprints, ongoingSprints],
          backgroundColor: ["#4caf50", "#ff9800"]
        }]
      },
      options: { responsive: true }
    });
  }
});