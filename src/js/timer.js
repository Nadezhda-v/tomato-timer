import { timerText } from './getElements';
import { startDeadlineTimer } from './control';

export class Timer {
  constructor({ time = 1, pause = 0.2, bigPause = 15, listTasks = [] }) {
    if (Timer.instance) {
      return Timer.instance;
    }

    this.time = Math.floor(time); // Время до перерыва
    this.pause = pause; // Короткий перерыв
    this.bigPause = bigPause; // Длинный перерыв
    this.listTasks = listTasks; // Список задач
    this.activeTask = null; // Активная задача
    this.timerId = null; // Текущий идентификатор таймера
    this.remainingTime = 0; // Свойство для хранения оставшегося времени
    Timer.instance = this;
  }

  // Добавить задачу в список
  addTask(task) {
    this.listTasks.push(task);
    return this;
  }

  // Удалить задачу из списка
  removeTask(id) {
    this.listTasks = this.listTasks.filter((task) => task.id !== id);
  }

  // Поиск задачи по ID
  findTaskById(id) {
    return this.listTasks.find((task) => task.id === id);
  }

  // Добавить задачу в активные
  activateTask(id) {
    this.activeTask = this.findTaskById(id);
    return this;
  }

  // Запустить таймер для выполнения активной задачи
  runTask(time) {
    if (!this.activeTask) {
      console.warn('Нет активной задачи');
      return;
    }

    let [minutes, seconds] = timerText.textContent.split(':');
    minutes = Math.floor(minutes);
    timerText.textContent = `${minutes}:${seconds}`;

    const timeInSeconds = time * 60;
    if (this.timerId) {
      clearTimeout(this.timerId);
    }
    this.updateTimerDisplay(timeInSeconds);
    startDeadlineTimer();
  }

  // Обновить время на странице
  updateTimerDisplay(timeInSeconds) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;

    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');

    timerText.textContent = `${formattedMinutes}:${formattedSeconds}`;

    this.timerId = setTimeout(() => {
      timeInSeconds--;
      this.updateTimerDisplay(timeInSeconds);
    }, 1000);

    this.remainingTime = timeInSeconds;

    if (timeInSeconds <= 0) {
      clearTimeout(this.timerId);

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

  // Поставить таймер на паузу
  pauseTimer() {
    if (this.timerId) {
      clearTimeout(this.timerId);
    }
  }

  // Продолжить таймер после паузы
  resumeTimer() {
    if (this.remainingTime > 0) {
      this.runTask(this.remainingTime / 60);
    }
  }

  // Удалить таймер
  clearTimer() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }
}
