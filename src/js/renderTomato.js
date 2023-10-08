import {
  el,
  mount,
  setChildren,
} from 'redom';

import { Controller } from './controller';
import { RenderTask } from './renderTask';
import { Timer } from './timer';

const timer = new Timer({});
export const importanceLevels = ['default', 'important', 'unimportant'];

export class RenderTomato {
  constructor() {
    this.controller = new Controller();
    this.header = this.createHeader();
    this.main = this.createMain();
    this.modalOverlay = this.createModalOverlay();
    this.countStyleButton = 1;
    this.render();
    this.bindListeners();
  }

  createHeader() {
    const header = el('header', [
      el('section.header', [
        el('div.container.header__container', [
          el('img.header__logo', {
            src: 'img/svg/noto_tomato.svg',
            alt: 'Tomato image',
          }),
          el('h1.header__title', 'Tomato timer'),
        ]),
      ]),
    ]);

    return header;
  }

  createMain() {
    const mainSection = el('section.main');
    const buttonImportance = el('button.button.button-importance.default', {
      'type': 'button',
      'data-importance': 'default',
      'aria-label': 'Указать важность',
    });

    const inputTitleTask = el('input.task-name.input-primary', {
      type: 'text',
      name: 'task-name',
      id: 'task-name',
      placeholder: 'название задачи',
    });

    const taskForm = el('form.task-form', { action: 'submit' }, [
      inputTitleTask,
      buttonImportance,
      el('button.button.button-primary.task-form__add-button', 'Добавить', {
        type: 'submit',
      }),
    ]);

    taskForm.buttonImportance = buttonImportance;
    taskForm.inputTitleTask = inputTitleTask;

    const questTasks = el('ul.pomodoro-tasks__quest-tasks');
    const deadlineTimerText = el('p.pomodoro-tasks__deadline-timer');

    const timerText = el('p.window__timer-text', '00:00');
    const panelTaskActive =
      el('p.window__panel-task.window__panel-task_active');
    const panelTaskNext =
      el('p.window__panel-task.window__panel-task_next');
    const startButton =
      el('button.button.button__start-button.button-primary', 'Старт');
    const stopButton =
      el('button.button.button__stop-button.button-secondary', 'Стоп');

    const formWindow = el('div.pomodoro-form.window', [
      el('div.window__panel', [
        panelTaskActive,
        panelTaskNext,
      ]),
      el('div.window__body', [
        timerText,
        el('div.window__buttons', [
          startButton,
          stopButton,
        ]),
      ]),
      taskForm,
    ]);

    formWindow.timerText = timerText;
    formWindow.panelTaskActive = panelTaskActive;
    formWindow.panelTaskNext = panelTaskNext;
    formWindow.startButton = startButton;
    formWindow.stopButton = stopButton;

    const mainContainer = el('div.container.main__container', [
      formWindow,
      el('div.pomodoro-tasks', [
        el('p.pomodoro-tasks__header-title', 'Инструкция:'),
        el('ul.pomodoro-tasks__quest-list', [
          el('li.pomodoro-tasks__list-item',
            'Напишите название задачи чтобы её добавить'),
          el('li.pomodoro-tasks__list-item',
            'Чтобы задачу активировать, выберите её из списка'),
          el('li.pomodoro-tasks__list-item',
            'Запустите таймер'),
          el('li.pomodoro-tasks__list-item',
            'Работайте пока таймер не прозвонит'),
          el('li.pomodoro-tasks__list-item',
            'Сделайте короткий перерыв (5 минут)'),
          el('li.pomodoro-tasks__list-item',
            'Продолжайте работать, пока задача не будет выполнена'),
          el('li.pomodoro-tasks__list-item',
            'Каждые 4 периода таймера делайте длинный перерыв (15 минут)'),
        ]),
        questTasks,
        deadlineTimerText,
      ]),
    ]);

    mount(mainSection, mainContainer);
    const main = el('main', mainSection);

    this.main = main;
    this.main.taskForm = taskForm;
    this.main.questTasks = questTasks;
    this.main.formWindow = formWindow;
    this.main.deadlineTimerText = deadlineTimerText;

    return main;
  }

  createModalOverlay() {
    const modalOverlay = el('div.modal-overlay', [
      el('div.modal-delete', [
        el('p.modal-delete__title', 'Удалить задачу?'),
        el('button.modal-delete__close-button'),
        el('button.modal-delete__delete-button.button-primary', 'Удалить'),
        el('button.modal-delete__cancel-button', 'Отмена'),
      ]),
    ]);

    this.modalOverlay = modalOverlay;
    return modalOverlay;
  }

  render() {
    const body = document.body;
    setChildren(body, [
      this.header,
      this.main,
      this.modalOverlay,
    ]);
  }

  formSubmitClick = (e) => {
    e.preventDefault();
    const taskForm = this.main.taskForm;
    if (taskForm.inputTitleTask.value === '') return;

    const formData = new FormData(taskForm);
    const title = formData.get('task-name');
    const importanceValue = taskForm.buttonImportance
      .getAttribute('data-importance');
    const { task, deadlineTime } =
      this.controller.handleFormSubmit(title, importanceValue);
    this.addTaskToList(task, deadlineTime);
  };

  buttonImportanceClick = ({ target }) => {
    target.classList.remove(...importanceLevels);
    target.classList.add(importanceLevels[this.countStyleButton]);
    target.setAttribute('data-importance',
      importanceLevels[this.countStyleButton]);

    this.countStyleButton = (this.countStyleButton + 1) %
      importanceLevels.length;
  };

  // Активировать задачу и переместить в начало списка
  taskTextClick = (task, taskId) => {
    if (!timer.activeTask || taskId !== timer.activeTask.id) {
      const activeTaskIndex = this.controller.handleActiveTask(taskId);
      const activeTaskText =
        task.querySelector('.pomodoro-tasks__task-text');

      if (!activeTaskText.classList.contains(
        'pomodoro-tasks__task-text_active')) {
        this.controller.handleMoveTaskToBegin(activeTaskIndex);
        this.updateTaskList(activeTaskIndex);
      }
    }
  };

  deleteButtonClick = () => {
    const deadlineTime = this.controller.handleDeadlineTime();

    if (timer.listTasks.length > 0 && deadlineTime > 0) {
      this.updateDeadlineTimer(deadlineTime);
    }

    if (timer.listTasks.length > 0) {
      // timer.activeTask = null;
      this.updateWindowPanel();
    } else {
      this.controller.handleDeadlineTime();
      this.сongigureInitialValues();
    }
  };

  bindListeners() {
    const taskForm = this.main.taskForm;
    const questTasks = this.main.questTasks;
    const formWindow = this.main.formWindow;

    // Прослушивание события отправки формы
    taskForm.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        taskForm.dispatchEvent(new Event('submit'));
      }
    });
    taskForm.addEventListener('submit', this.formSubmitClick);

    // Переключить стили кнопки, котрая определяет важность задачи
    taskForm.buttonImportance.addEventListener('click',
      this.buttonImportanceClick);

    // Обработать действия с элементами задач на странице
    questTasks.addEventListener('click', ({ target }) => {
      const task = target.closest('.pomodoro-tasks__list-task');
      const taskId = task.getAttribute('data-id');

      if (target.closest('.pomodoro-tasks__task-text')) {
        this.taskTextClick(task, taskId);
      }

      if (target.closest('.pomodoro-tasks__task-button')) {
        const burgerPopup = task.querySelector('.burger-popup');
        burgerPopup.classList.toggle('burger-popup_active');
        this.closeAllMenus(task);

        const editButton = task.querySelector('.burger-popup__edit-button');
        const taskText = task.querySelector('.pomodoro-tasks__task-text');
        const titleTask = taskText.textContent;

        editButton.addEventListener('click', () => {
          this.setCursorToEnd(taskText);
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
                this.updateWindowPanel();
              }
            }
          }
        });

        const delButton = task.querySelector('.burger-popup__delete-button');
        delButton.addEventListener('click', () => {
          this.modalOverlay.style.display = 'block';
        });

        let taskDeleted = false;

        this.modalOverlay.addEventListener('click', ({ target }) => {
          if (target.classList.contains('modal-delete__close-button') ||
            target.classList.contains('modal-delete__cancel-button')) {
            this.closeModal(this.modalOverlay);
          }

          if (target.classList.contains('modal-delete__delete-button') &&
            !taskDeleted) {
            taskDeleted = true;
            timer.removeTask(taskId);
            task.remove();
            this.updateCountList();
            this.closeModal(this.modalOverlay);
            this.deleteButtonClick();
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
          this.closeMenu(burgerPopup);
        });
      }
    });

    // Поставить таймер на паузу
    formWindow.stopButton.addEventListener('click', () => {
      this.controller.handleStopButton();
    });

    // Запустить таймер
    formWindow.startButton.addEventListener('click', () => {
      this.controller.handleStartButton(this.updateDeadlineTimer.bind(this));
    });
  }

  // Настроить начальные значения элементов на странице
  сongigureInitialValues() {
    const formWindow = this.main.formWindow;
    this.main.deadlineTimerText.textContent = '';
    formWindow.panelTaskActive.textContent = '';
    formWindow.panelTaskNext.textContent = '';
    formWindow.timerText.textContent = '00:00';
  }

  formatWord(number, words) {
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
  }

  // Определить склонение слов в зависимости от переданных значений
  formatTimeWords(minutes) {
    const hourVariations = ['час', 'часа', 'часов'];
    const minuteVariations = ['минута', 'минуты', 'минут'];

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    let formattedHours;

    if (hours >= 1) {
      formattedHours = this.formatWord(hours, hourVariations);
    }
    const formattedMinutes =
      this.formatWord(remainingMinutes, minuteVariations);

    return { hours, remainingMinutes, formattedHours, formattedMinutes };
  }

  // Обновить панель на таймере
  updateWindowPanel() {
    const formWindow = this.main.formWindow;
    formWindow.panelTaskActive.textContent = timer.listTasks[0].title;
    formWindow.panelTaskNext.textContent = timer.listTasks[1] ?
      timer.listTasks[1].title : '';
  }

  // Обновить общее время, требуемое на выполнение задач
  updateDeadlineTimer(minutes) {
    const deadlineTimerText = this.main.deadlineTimerText;
    if (minutes === 0) {
      deadlineTimerText.textContent = 'Время вышло';
      return;
    }

    const {
      hours,
      remainingMinutes,
      formattedHours,
      formattedMinutes,
    } = this.formatTimeWords(minutes);

    if (formattedHours && formattedMinutes) {
      deadlineTimerText.textContent = `
      ${hours} ${formattedHours} ${remainingMinutes} ${formattedMinutes}`;
    } else if (formattedMinutes) {
      deadlineTimerText.textContent = `${remainingMinutes} ${formattedMinutes}`;
    }
  }

  // Добавить задачу в список
  addTaskToList(task, deadlineTime) {
    const questTasks = this.main.questTasks;
    const tasks = questTasks.querySelectorAll('li');
    const countList = tasks.length + 1;
    const row = new RenderTask(task, countList);
    mount(questTasks, row);
    timer.addTask(task);

    this.updateDeadlineTimer(deadlineTime);
    this.updateWindowPanel();
    this.main.taskForm.reset();
  }

  // Обновить список задач на странице
  updateTaskList(activeTaskIndex) {
    const questTasks = this.main.questTasks;
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

    this.updateCountList();
    this.updateWindowPanel();
  }

  closeMenu(burgerPopup) {
    burgerPopup.classList.remove('burger-popup_active');
  }

  // Закрыть все меню при открытии нового
  closeAllMenus(task) {
    const allTasks = document.querySelectorAll('.pomodoro-tasks__list-task');
    allTasks.forEach((newTask) => {
      if (newTask !== task) {
        const burgerPopup = newTask.querySelector('.burger-popup');
        this.closeMenu(burgerPopup);
      }
    });
  }

  // Редактировать текст и устанавить курсор в конец текста
  setCursorToEnd(element) {
    element.contentEditable = true;
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  // Закрыть модальное окно
  closeModal(element) {
    element.style.display = 'none';
  }

  // Обновить нумерацию задач при удалении
  updateCountList() {
    const tasks = this.main.questTasks.querySelectorAll('li');
    tasks.forEach((task, index) => {
      const countNumber = task.querySelector('.count-number');
      countNumber.textContent = index + 1;
    });
  }
}
