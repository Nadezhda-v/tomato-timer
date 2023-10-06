const buttonImportance = document.querySelector('.button-importance');
const timerText = document.querySelector('.window__timer-text');
const taskForm = document.querySelector('.task-form');
const questTasks = document.querySelector('.pomodoro-tasks__quest-tasks');
const inputTitleTask = document.querySelector('.input-primary');
const modalOverlay = document.querySelector('.modal-overlay');
const startButton = document.querySelector('.button__start-button');
const stopButton = document.querySelector('.button__stop-button');
const panelTaskActive = document.querySelector('.window__panel-task_active');
const panelTaskNext = document.querySelector('.window__panel-task_next');

const deadlineTimerText = document.querySelector(
  '.pomodoro-tasks__deadline-timer');

export {
  buttonImportance,
  timerText,
  taskForm,
  questTasks,
  inputTitleTask,
  deadlineTimerText,
  modalOverlay,
  startButton,
  stopButton,
  panelTaskActive,
  panelTaskNext,
};
