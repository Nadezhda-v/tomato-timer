import { timer } from './getElements';

export class Timer {
  constructor({ time = 25, pause = 5, bigPause = 15, listTasks = [] }) {
    this.time = time;
    this.pause = pause;
    this.bigPause = bigPause;
    this.listTasks = listTasks;
    this.activeTask = null;
  }

  // Добавить задачу в список
  addTask(task) {
    this.listTasks.push(task);
  }

  // Поиск задачи по ID
  findTaskById(id) {
    return this.listTasks.find((task) => task.id === id);
  }

  // Добавить задачу в активные
  activateTask(id) {
    this.activeTask = this.findTaskById(id);
    this.runTask(this.time);
  }

  // Запустить таймер для выполнения активной задачи
  runTask(time) {
    if (!this.activeTask) {
      console.warn('Нет активной задачи');
      return;
    }

    let [minutes, seconds] = timer.textContent.split(':');
    minutes = time;
    timer.textContent = `${minutes}:${seconds}`;

    const timeInSeconds = time * 60;
    this.updateTimerDisplay(timeInSeconds);
  }

  // Обновить время на странице
  updateTimerDisplay(timeInSeconds) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;

    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');

    timer.textContent = `${formattedMinutes}:${formattedSeconds}`;

    const timerId = setTimeout(() => {
      timeInSeconds--;
      this.updateTimerDisplay(timeInSeconds);
    }, 1000);

    if (timeInSeconds <= 0) {
      clearTimeout(timerId);

      if (this.activeTask.count === 0) {
        this.runTask(this.pause);
      } else if (this.activeTask.count % 3 === 0) {
        this.runTask(this.bigPause);
      } else {
        this.runTask(this.time);
      }

      this.increaseCountTask(this.activeTask.id);
    }
  }

  // Увеличить счетчик у задачи
  increaseCountTask(id) {
    this.findTaskById(id).increaseCount();
  }
}
