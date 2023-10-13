import { Timer } from './timer';
import { importanceLevels } from './renderTomato';
import {
  ImportantTask,
  DefaultTask,
  UnimportantTask,
} from './task';

export class Model {
  constructor() {
    this.timer = new Timer({});
    this.importanceLevels = importanceLevels;
    this.deadlineTime = null;
    this.deadlineTimerStarted = false;
    this.deadlineId = null;
    // Флаги для отслеживания состояния таймера
    this.isTimerRunning = false; // Таймер не запущен
    this.isTimerPaused = false; // Таймер на паузе
  }

  // Создать задачу в зависимости от важности
  formSubmit(title, importanceValue) {
    let task;

    if (importanceValue === this.importanceLevels[0]) {
      task = new DefaultTask(title);
    } else if (importanceValue === this.importanceLevels[1]) {
      task = new ImportantTask(title);
    } else if (importanceValue === this.importanceLevels[2]) {
      task = new UnimportantTask(title);
    }

    this.timer.addTask(task);
    this.deadlineTime += this.timer.time;

    return { task, deadlineTime: this.deadlineTime };
  }

  // Активировать задачу и определить индекс активной задачи
  activateTask(taskId) {
    this.timer.activateTask(taskId);
    const activeTaskIndex = this.timer.listTasks.indexOf(this.timer.activeTask);
    return activeTaskIndex;
  }

  // Перемещение задачи в начало массива
  moveTaskToBegin(activeTaskIndex) {
    const activeTask = this.timer.listTasks.splice(activeTaskIndex, 1)[0];
    this.timer.listTasks.unshift(activeTask);
    this.isTimerRunning = false;
  }

  hasTasks() {
    return this.timer.listTasks.length > 0;
  }

  resetTimer() {
    this.deadlineTime = 0;
    this.deadlineTimerStarted = false;
    clearInterval(this.deadlineId);
    this.timer.clearTimer();
    this.isTimerRunning = false;
    this.isTimerPaused = false;
    this.timer.activeTask = null;
  }

  updateDeadlineTime() {
    if (this.hasTasks()) {
      this.deadlineTime -= this.timer.time;
      this.deadlineTime = this.deadlineTime < 0 ? 0 : this.deadlineTime;
      return this.deadlineTime;
    }

    if (this.timer.listTasks.length <= 0 || this.deadlineTime <= 0) {
      this.resetTimer();
    }
  }

  stopButton() {
    this.timer.pauseTimer();
    this.isTimerPaused = true;
  }

  // Запустить таймер до дедлайна
  startDeadlineTimer(updateDeadlineTimer) {
    if (!this.deadlineTimerStarted) {
      this.deadlineId = setInterval(() => {
        this.deadlineTime--;
        updateDeadlineTimer(this.deadlineTime);

        if (this.deadlineTime <= 0) {
          clearInterval(this.deadlineId);
          this.deadlineTimerStarted = false;
          const deadlineTimerText =
            document.querySelector('.pomodoro-tasks__deadline-timer');
          deadlineTimerText.textContent = 'Время вышло';
        }
      }, 60000);

      this.deadlineTimerStarted = true;
    }
  }

  startButton(updateDeadlineTimer) {
    // Если таймер не запущен, то запустить
    if (!this.isTimerRunning && this.timer.activeTask) {
      this.timer.runTask(this.timer.time);
      this.startDeadlineTimer(updateDeadlineTimer);
      this.isTimerRunning = true;
      this.isTimerPaused = false;
    } else if (this.isTimerPaused) {
      // Если таймер на паузе, то продолжить
      this.timer.resumeTimer();
      this.isTimerPaused = false;
    }
    return this.deadlineTime;
  }

  // Переименовать задачу
  renameTask(taskId, newTitleTask) {
    const taskToUpdate = this.timer.findTaskById(taskId);
    if (taskToUpdate) {
      taskToUpdate.setTitle(newTitleTask);
    }
    return taskToUpdate;
  }

  // Удалить задачу
  removeTask(taskId) {
    const firstTaskId = this.timer.listTasks[0].id;
    this.timer.removeTask(taskId);

    if (taskId === firstTaskId) {
      this.timer.clearTimer();
      this.isTimerRunning = false;
      this.isTimerPaused = false;
      this.timer.activeTask = null;
    }
    return firstTaskId;
  }

  // Очистить список задач
  clearListTasks() {
    if (this.deadlineTime === 0 && this.timer.listTasks.length > 0) {
      this.timer.listTasks = [];
      this.resetTimer();
      return true;
    }
    return false;
  }
}
