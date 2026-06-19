# Kanban Task Board

A clean and responsive Trello-style Kanban Task Board built using **HTML, CSS, and JavaScript**. Users can create, edit, delete, drag, and move tasks across different stages while maintaining board data using **localStorage**.

## Features

- Create Tasks
- Edit Tasks
- Delete Tasks
- Drag and Drop Support
- Move Tasks Between Columns
- Three Workflow Columns:
  - To Do
  - In Progress
  - Done
- localStorage Persistence
- Responsive Design
- Mobile Friendly
- Professional Card-Based UI
- Beginner-Friendly Code Structure

## Project Structure

```text
Kanban Task Board/
│
├── index.html
├── style.css
├── ui.js
└── README.md
```

## Workflow

```text
To Do → In Progress → Done
```

Tasks can be dragged and dropped between columns to track progress.

## Technologies Used

- HTML5
- CSS3
- JavaScript (DOM Manipulation)
- HTML5 Drag and Drop API
- localStorage

## JavaScript Functions

### renderBoard(tasks)

Renders all columns and task cards.

### createTask(taskData)

Creates a new task and adds it to the To Do column.

### editTask(taskId)

Updates task title and description.

### deleteTask(taskId)

Removes a task from the board.

### saveToLocalStorage(tasks)

Stores board data in localStorage.

### loadFromLocalStorage()

Loads saved board data from localStorage.

### showEmptyState()

Displays a message when no tasks exist.

### hideEmptyState()

Hides the empty state message.

## UI Components

### Header

- Project Logo
- Project Title

### Task Creation Section

- Task Title Input
- Task Description Input
- Add Task Button

### Board Section

#### To Do
Tasks waiting to be started.

#### In Progress
Tasks currently being worked on.

#### Done
Completed tasks.

### Task Card

Each card contains:

- Task Title
- Task Description
- Edit Button
- Delete Button

### Footer

- Project Name
- Copyright Information

## Responsive Design

The application is optimized for:

- Mobile Devices
- Tablets
- Laptops
- Desktop Screens

## Color Theme

Uses a soft professional color palette:

- White
- Light Gray
- Soft Green
- Soft Teal
- Soft Cyan
- Light Sky Blue

## Data Persistence

All board data is automatically stored in localStorage.

This ensures:

- Tasks remain after page refresh
- Tasks remain after browser restart
- Board state is preserved automatically

## Learning Concepts Covered

### HTML

- Semantic Structure
- Forms
- Layout Design

### CSS

- Flexbox
- Grid Layout
- Responsive Design
- Hover Effects
- Card UI

### JavaScript

- DOM Manipulation
- Event Handling
- Drag and Drop API
- localStorage
- Dynamic Rendering
