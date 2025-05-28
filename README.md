# Taskly Demo

## NOTES:

- We're only coding the BACKLOG and BOARD page
- To RUN: Get all the files locally and Run LIVE SERVER on vscode 
- WHEN ADDING UR WORK TO THE FILE, LET GROUPMATES KNOW AND DONT REMOVE ANYTHING ELSE THEY MIGHT BE WORKING ON
- Use dedicated CSS and JS files for the pages.
- Add .backlog-content or .board-content when styling class names to avoid conflicts. E.g. .backlog-content .modal. Something liek that.


## TASKS:

## - BACKLOG PAGE: NEED 2 MEMBERS

### 1. Sprints - (Arman)

I already provided initial design for sprints

1. Create a Sprint modal just like below (improve styling) ![alt text](/assets/image-2.png)
2. When "Create Sprint" button is clicked, open the Sprint modal
3. When the input fields are filled and add sprint is clicked. Render something similar to the below. Instead of start sprint button, replace it with "Complete Sprint" Button, which when clicked, just removes the sprint from the screen![alt text](/assets/image-3.png)


### 2. Tasks - (Ryonan)

When doing this, ask chatgpt to create a class for Task with the properties: ID, Task Name, Status (Set default to To Do), Assignee, along with all it's get/set methods.
Then when adding a task, store it in an array so it can be accessed by other functions and code.

1. Create a Task modal similar to sprint modal when "+ Create Task" button is clicked. In the modal include fields: Task Name, Status for whether the task is To Do, In progress or Completed, and an input to assign the task to someone.
2. Then when "Add Task" in the modal is clicked, add a task to Backlog or Sprint depending where the "Create Task" was clicked.
![alt text](/assets/image-4.png)
3. Update the number of tasks within the container where the task was added.
4. Keep a way of tracking Tasks, via array or something. This will be accessed for the board page

## BOARD PAGE: NEED 2 MEMBERS

### 1. UI AND DISPLAY TASKS - (ALEXIS ARVIE)

1. Follow the UI from our figma
3. Write the Logic for Kanban columns: Should be able to Add a Column and Rename a column
![alt text](/assets/image-5.png)

### 2. Logic - (Patrick)

1. Design the task card inside the column and Display the tasks based from backlog.
2. Write logic for Dragging a task around the columns
4. Write logic for + create issue, can use the same modal and function from Backlog page if already made.
