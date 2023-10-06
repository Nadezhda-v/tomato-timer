/* eslint-disable no-unused-vars */
import {
  buttonImportance,
  taskForm,
  inputTitleTask,
  deadlineTimerText,
  questTasks,
  modalOverlay,
  startButton,
  stopButton,
  panelTaskActive,
  panelTaskNext,
  timerText,
} from './getElements';

import {
  ImportantTask,
  DefaultTask,
  UnimportantTask,
} from './task';

import { RenderTask } from './renderTask';
import { Timer } from './timer';

const importance = ['default', 'important', 'unimportant'];
const timer = new Timer({});

// Выбор важности задачи
const switchStylesButton = () => {
  let count = 1;
  buttonImportance.addEventListener('click', ({ target }) => {
    target.classList.remove(...importance);
    target.classList.add(importance[count]);
    target.setAttribute('data-importance', importance[count]);

    count = (count + 1) % importance.length;
  });
};

// Настроить начальные значения элементов на странице
const сongigureInitialValues = () => {
  deadlineTimerText.textContent = '';
  panelTaskActive.textContent = '';
  panelTaskNext.textContent = '';
  timerText.textContent = '00:00';
};

const formatWord = (number, words) => {
  let wordIndex;

  if (number % 100 > 4 && number % 100 < 20) {
    wordIndex = 2;
  } else {
    const lastDigit = number % 10;
    if (lastDigit === 1) {
      wordIndex = 0;
    } else if (lastDigit > 1 && lastDigit < 5) {
      wordIndex = 1;
    } else {
      wordIndex = 2;
    }
  }

  return words[wordIndex];
};

// Определить склонение слов в зависимости от переданных значений
const formatTimeWords = (minutes) => {
  const hourVariations = ['час', 'часа', 'часов'];
  const minuteVariations = ['минута', 'минуты', 'минут'];

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  let formattedHours;

  if (hours >= 1) {
    formattedHours = formatWord(hours, hourVariations);
  }
  const formattedMinutes = formatWord(remainingMinutes, minuteVariations);

  return { hours, remainingMinutes, formattedHours, formattedMinutes };
};

// Обновить общее время, требуемое на выполнение задач
const updateDeadlineTimer = (minutes) => {
  if (minutes === 0) {
    deadlineTimerText.textContent = 'Время вышло';
    return;
  }

  const {
    hours,
    remainingMinutes,
    formattedHours,
    formattedMinutes,
  } = formatTimeWords(minutes);

  if (formattedHours && formattedMinutes) {
    deadlineTimerText.textContent = `
      ${hours} ${formattedHours} ${remainingMinutes} ${formattedMinutes}`;
  } else if (formattedMinutes) {
    deadlineTimerText.textContent = `${remainingMinutes} ${formattedMinutes}`;
  }
};

// Проверить есть ли задачи в списке задач
const hasTasks = () => timer.listTasks.length > 0;

let deadlineTime = 0;
let deadlineTimerStarted = false;
let deadlineId = null;

// Запустить таймер до дедлайна
const startDeadlineTimer = () => {
  if (!deadlineTimerStarted) {
    // Остановить таймер, если нет задач
    if (!hasTasks()) {
      clearInterval(deadlineId);
      return;
    }

    deadlineId = setInterval(() => {
      deadlineTime--;
      updateDeadlineTimer(deadlineTime);

      if (deadlineTime <= 0) {
        clearInterval(deadlineId);
        deadlineTimerText.textContent = 'Время вышло';
      }
    }, 60000);

    deadlineTimerStarted = true;
  }
};

// Определить все время, требуемое на выполнение задач
const getDeadlineTime = () => {
  deadlineTime += timer.time;

  updateDeadlineTimer(deadlineTime);
};

// Обновить панель на таймере
const updateWindowPanel = () => {
  panelTaskActive.textContent = timer.listTasks[0].title;
  panelTaskNext.textContent = timer.listTasks[1] ?
    timer.listTasks[1].title : '';
};

const closeMenu = (burgerPopup) => {
  burgerPopup.classList.remove('burger-popup_active');
};

// Закрыть все меню при открытии нового
const closeAllMenus = (task) => {
  const allTasks = document.querySelectorAll('.pomodoro-tasks__list-task');
  allTasks.forEach((newTask) => {
    if (newTask !== task) {
      const burgerPopup = newTask.querySelector('.burger-popup');
      closeMenu(burgerPopup);
    }
  });
};

// Редактировать текст и устанавить курсор в конец текста
const setCursorToEnd = (element) => {
  element.contentEditable = true;
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
};

// Закрыть модальное окно
const closeModal = (element) => {
  element.style.display = 'none';
};

// Обновить нумерацию задач при удалении
const updateCountList = () => {
  const tasks = questTasks.querySelectorAll('li');
  tasks.forEach((task, index) => {
    const countNumber = task.querySelector('.count-number');
    countNumber.textContent = index + 1;
  });
};

// Обновить список задач на странице
const updateTaskList = (activeTaskIndex) => {
  const tasks = Array.from(questTasks.querySelectorAll('li'));
  tasks.forEach(task => {
    const taskText = task.querySelector('.pomodoro-tasks__task-text');
    if (taskText) {
      taskText.classList.remove('pomodoro-tasks__task-text_active');
    }
  });

  const activeTaskOnPage = tasks.splice(activeTaskIndex, 1)[0];
  const activeTaskText = activeTaskOnPage
    .querySelector('.pomodoro-tasks__task-text');
  activeTaskText.classList.add('pomodoro-tasks__task-text_active');

  tasks.unshift(activeTaskOnPage);
  tasks.forEach((task) => {
    questTasks.append(task);
  });

  updateCountList();
  updateWindowPanel();
};

const control = () => {
  switchStylesButton();
  сongigureInitialValues();

  // Флаги для отслеживания состояния таймера
  let isTimerRunning = false; // Таймер не запущен
  let isTimerPaused = false; // Таймер на паузе

  // Отправка формы
  taskForm.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      taskForm.dispatchEvent(new Event('submit'));
    }
  });

  taskForm.addEventListener('submit', e => {
    e.preventDefault();
    if (inputTitleTask.value === '') return;

    let task;
    const tasks = questTasks.querySelectorAll('li');
    const countList = tasks.length + 1;
    const formData = new FormData(taskForm);
    const title = formData.get('task-name');
    const importanceValue = buttonImportance.getAttribute('data-importance');

    if (importanceValue === importance[0]) {
      task = new DefaultTask(title);
    } else if (importanceValue === importance[1]) {
      task = new ImportantTask(title);
    } else if (importanceValue === importance[2]) {
      task = new UnimportantTask(title);
    }

    new RenderTask(task, countList);
    timer.addTask(task);
    console.log(timer.listTasks);

    getDeadlineTime();
    updateWindowPanel();
    taskForm.reset();
  });

  // Обработать действия с элементами задач на странице
  questTasks.addEventListener('click', ({ target }) => {
    const task = target.closest('.pomodoro-tasks__list-task');
    const taskId = task.getAttribute('data-id');

    if (target.closest('.pomodoro-tasks__task-text')) {
      if (!timer.activeTask || taskId !== timer.activeTask.id) {
        timer.activateTask(taskId);
        const activeTaskIndex = timer.listTasks.indexOf(timer.activeTask);
        const activeTaskText = task.querySelector('.pomodoro-tasks__task-text');

        if (!activeTaskText.classList.contains(
          'pomodoro-tasks__task-text_active')) {
          const activeTask = timer.listTasks.splice(activeTaskIndex, 1)[0];
          timer.listTasks.unshift(activeTask);

          updateTaskList(activeTaskIndex);
          isTimerRunning = false;
        }
      }
    }

    if (target.closest('.pomodoro-tasks__task-button')) {
      const burgerPopup = task.querySelector('.burger-popup');
      burgerPopup.classList.toggle('burger-popup_active');
      closeAllMenus(task);

      const editButton = task.querySelector('.burger-popup__edit-button');
      const taskText = task.querySelector('.pomodoro-tasks__task-text');
      const titleTask = taskText.textContent;

      editButton.addEventListener('click', () => {
        setCursorToEnd(taskText);
      });

      document.addEventListener('click', ({ target }) => {
        if (!target.closest('.pomodoro-tasks__task-text') &&
          !target.closest('.burger-popup__edit-button')) {
          taskText.contentEditable = false;
          const newTitleTask = taskText.textContent.trim();

          if (newTitleTask === '') {
            taskText.textContent = titleTask;
          } else {
            taskText.textContent = newTitleTask;
            const taskToUpdate = timer.findTaskById(taskId);
            if (taskToUpdate) {
              taskToUpdate.setTitle(newTitleTask);
              updateWindowPanel();
            }
          }
        }
      });

      const delButton = task.querySelector('.burger-popup__delete-button');
      delButton.addEventListener('click', () => {
        modalOverlay.style.display = 'block';
      });

      let taskDeleted = false;

      modalOverlay.addEventListener('click', ({ target }) => {
        if (target.classList.contains('modal-delete__close-button') ||
          target.classList.contains('modal-delete__cancel-button')) {
          closeModal(modalOverlay);
        }

        if (target.classList.contains('modal-delete__delete-button') &&
          !taskDeleted) {
          taskDeleted = true;
          timer.removeTask(taskId);
          task.remove();
          updateCountList();
          closeModal(modalOverlay);

          if (hasTasks() && deadlineTime > 0) {
            deadlineTime -= timer.time;
            updateDeadlineTimer(deadlineTime);
          }

          if (hasTasks()) {
            timer.activeTask = null;
            updateWindowPanel();
          } else {
            deadlineTime = 0;
            deadlineTimerStarted = false;
            startDeadlineTimer();
            сongigureInitialValues();
            timer.clearTimer();
            isTimerRunning = false;
            isTimerPaused = false;
          }
        }
      });
    }
  });

  // Закрыть меню при клике вне его
  document.addEventListener('click', ({ target }) => {
    if (!target.closest('.burger-popup') &&
      !target.closest('.pomodoro-tasks__task-button')) {
      const burgerPopups = document.querySelectorAll('.burger-popup');
      burgerPopups.forEach((burgerPopup) => {
        closeMenu(burgerPopup);
      });
    }
  });

  // Поставить таймер на паузу
  stopButton.addEventListener('click', () => {
    timer.pauseTimer();
    isTimerPaused = true;
  });

  // Запустить таймер
  startButton.addEventListener('click', () => {
    // Если таймер не запущен, то запустить
    if (!isTimerRunning) {
      timer.runTask(timer.time);
      isTimerRunning = true;
      isTimerPaused = false;
    } else if (isTimerPaused) {
      // Если таймер на паузе, то продолжить
      timer.resumeTimer();
      isTimerPaused = false;
    }
  });
};

export { control, startDeadlineTimer };
