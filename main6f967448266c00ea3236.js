/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/js/controller.js":
/*!******************************!*\
  !*** ./src/js/controller.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Controller: () => (/* binding */ Controller)
/* harmony export */ });
/* harmony import */ var _model__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./model */ "./src/js/model.js");

class Controller {
  constructor() {
    this.model = new _model__WEBPACK_IMPORTED_MODULE_0__.Model();
  }
  handleFormSubmit(title, importanceValue) {
    return this.model.formSubmit(title, importanceValue);
  }
  handleActiveTask(taskId) {
    return this.model.activateTask(taskId);
  }
  handleMoveTaskToBegin(activeTaskIndex) {
    this.model.moveTaskToBegin(activeTaskIndex);
  }
  handleDeadlineTime() {
    return this.model.updateDeadlineTime();
  }
  handleStopButton() {
    this.model.stopButton();
  }
  handleStartButton(updateDeadlineTimer) {
    this.model.startButton(updateDeadlineTimer);
  }
  handleRenameTask(taskId, newTitleTask) {
    return this.model.renameTask(taskId, newTitleTask);
  }
  handleRemoveTask(taskId) {
    return this.model.removeTask(taskId);
  }
  handleListTasks() {
    return this.model.clearListTasks();
  }
}

/***/ }),

/***/ "./src/js/model.js":
/*!*************************!*\
  !*** ./src/js/model.js ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Model: () => (/* binding */ Model)
/* harmony export */ });
/* harmony import */ var _timer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./timer */ "./src/js/timer.js");
/* harmony import */ var _renderTomato__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./renderTomato */ "./src/js/renderTomato.js");
/* harmony import */ var _task__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./task */ "./src/js/task.js");



class Model {
  constructor() {
    this.timer = new _timer__WEBPACK_IMPORTED_MODULE_0__.Timer({});
    this.importanceLevels = _renderTomato__WEBPACK_IMPORTED_MODULE_1__.importanceLevels;
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
      task = new _task__WEBPACK_IMPORTED_MODULE_2__.DefaultTask(title);
    } else if (importanceValue === this.importanceLevels[1]) {
      task = new _task__WEBPACK_IMPORTED_MODULE_2__.ImportantTask(title);
    } else if (importanceValue === this.importanceLevels[2]) {
      task = new _task__WEBPACK_IMPORTED_MODULE_2__.UnimportantTask(title);
    }
    this.timer.addTask(task);
    this.deadlineTime += this.timer.time;
    return {
      task,
      deadlineTime: this.deadlineTime
    };
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
          const deadlineTimerText = document.querySelector('.pomodoro-tasks__deadline-timer');
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

/***/ }),

/***/ "./src/js/renderTask.js":
/*!******************************!*\
  !*** ./src/js/renderTask.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RenderTask: () => (/* binding */ RenderTask)
/* harmony export */ });
/* harmony import */ var redom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! redom */ "./node_modules/redom/dist/redom.es.js");

class RenderTask {
  constructor(task, countList) {
    this.task = task;
    this.countList = countList;
    this.init();
  }
  init() {
    const taskTextClasses = this.countList === 1 ? 'pomodoro-tasks__task-text pomodoro-tasks__task-text_active' : 'pomodoro-tasks__task-text';
    this.el = (0,redom__WEBPACK_IMPORTED_MODULE_0__.el)(`li.pomodoro-tasks__list-task.${this.task.importance}`, {
      'data-id': this.task.id
    }, [(0,redom__WEBPACK_IMPORTED_MODULE_0__.el)('span.count-number', this.countList), (0,redom__WEBPACK_IMPORTED_MODULE_0__.el)('div', {
      className: taskTextClasses
    }, this.task.title), (0,redom__WEBPACK_IMPORTED_MODULE_0__.el)('button.pomodoro-tasks__task-button'), (0,redom__WEBPACK_IMPORTED_MODULE_0__.el)('div.burger-popup', [(0,redom__WEBPACK_IMPORTED_MODULE_0__.el)('button.popup-button.burger-popup__edit-button', 'Редактировать'), (0,redom__WEBPACK_IMPORTED_MODULE_0__.el)('button.popup-button.burger-popup__delete-button', 'Удалить')])]);
    return this.el;
  }
}

/***/ }),

/***/ "./src/js/renderTomato.js":
/*!********************************!*\
  !*** ./src/js/renderTomato.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RenderTomato: () => (/* binding */ RenderTomato),
/* harmony export */   importanceLevels: () => (/* binding */ importanceLevels)
/* harmony export */ });
/* harmony import */ var redom__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! redom */ "./node_modules/redom/dist/redom.es.js");
/* harmony import */ var _controller__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./controller */ "./src/js/controller.js");
/* harmony import */ var _renderTask__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./renderTask */ "./src/js/renderTask.js");
/* harmony import */ var _timer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./timer */ "./src/js/timer.js");




const timer = new _timer__WEBPACK_IMPORTED_MODULE_2__.Timer({});
const importanceLevels = ['default', 'important', 'unimportant'];
class RenderTomato {
  constructor() {
    this.controller = new _controller__WEBPACK_IMPORTED_MODULE_0__.Controller();
    this.header = this.createHeader();
    this.main = this.createMain();
    this.modalOverlay = this.createModalOverlay();
    this.countStyleButton = 1;
    this.render();
    this.bindListeners();
  }
  createHeader() {
    const header = (0,redom__WEBPACK_IMPORTED_MODULE_3__.el)('header', [(0,redom__WEBPACK_IMPORTED_MODULE_3__.el)('section.header', [(0,redom__WEBPACK_IMPORTED_MODULE_3__.el)('div.container.header__container', [(0,redom__WEBPACK_IMPORTED_MODULE_3__.el)('img.header__logo', {
      src: __webpack_require__(/*! ../img/svg/noto_tomato.svg */ "./src/img/svg/noto_tomato.svg"),
      alt: 'Tomato image'
    }), (0,redom__WEBPACK_IMPORTED_MODULE_3__.el)('h1.header__title', 'Tomato timer')])])]);
    return header;
  }
  createMain() {
    const mainSection = (0,redom__WEBPACK_IMPORTED_MODULE_3__.el)('section.main');
    const buttonImportance = (0,redom__WEBPACK_IMPORTED_MODULE_3__.el)('button.button.button-importance.default', {
      'type': 'button',
      'data-importance': 'default',
      'aria-label': 'Указать важность'
    });
    const inputTitleTask = (0,redom__WEBPACK_IMPORTED_MODULE_3__.el)('input.task-name.input-primary', {
      type: 'text',
      name: 'task-name',
      id: 'task-name',
      placeholder: 'название задачи'
    });
    const taskForm = (0,redom__WEBPACK_IMPORTED_MODULE_3__.el)('form.task-form', {
      action: 'submit'
    }, [inputTitleTask, buttonImportance, (0,redom__WEBPACK_IMPORTED_MODULE_3__.el)('button.button.button-primary.task-form__add-button', 'Добавить', {
      type: 'submit'
    })]);
    taskForm.buttonImportance = buttonImportance;
    taskForm.inputTitleTask = inputTitleTask;
    const questTasks = (0,redom__WEBPACK_IMPORTED_MODULE_3__.el)('ul.pomodoro-tasks__quest-tasks');
    const deadlineTimerText = (0,redom__WEBPACK_IMPORTED_MODULE_3__.el)('p.pomodoro-tasks__deadline-timer');
    const timerText = (0,redom__WEBPACK_IMPORTED_MODULE_3__.el)('p.window__timer-text', '00:00');
    const panelTaskActive = (0,redom__WEBPACK_IMPORTED_MODULE_3__.el)('p.window__panel-task.window__panel-task_active');
    const panelTaskNext = (0,redom__WEBPACK_IMPORTED_MODULE_3__.el)('p.window__panel-task.window__panel-task_next');
    const startButton = (0,redom__WEBPACK_IMPORTED_MODULE_3__.el)('button.button.button__start-button.button-primary', 'Старт');
    const stopButton = (0,redom__WEBPACK_IMPORTED_MODULE_3__.el)('button.button.button__stop-button.button-secondary', 'Стоп');
    const formWindow = (0,redom__WEBPACK_IMPORTED_MODULE_3__.el)('div.pomodoro-form.window', [(0,redom__WEBPACK_IMPORTED_MODULE_3__.el)('div.window__panel', [panelTaskActive, panelTaskNext]), (0,redom__WEBPACK_IMPORTED_MODULE_3__.el)('div.window__body', [timerText, (0,redom__WEBPACK_IMPORTED_MODULE_3__.el)('div.window__buttons', [startButton, stopButton])]), taskForm]);
    formWindow.timerText = timerText;
    formWindow.panelTaskActive = panelTaskActive;
    formWindow.panelTaskNext = panelTaskNext;
    formWindow.startButton = startButton;
    formWindow.stopButton = stopButton;
    const mainContainer = (0,redom__WEBPACK_IMPORTED_MODULE_3__.el)('div.container.main__container', [formWindow, (0,redom__WEBPACK_IMPORTED_MODULE_3__.el)('div.pomodoro-tasks', [(0,redom__WEBPACK_IMPORTED_MODULE_3__.el)('p.pomodoro-tasks__header-title', 'Инструкция:'), (0,redom__WEBPACK_IMPORTED_MODULE_3__.el)('ul.pomodoro-tasks__quest-list', [(0,redom__WEBPACK_IMPORTED_MODULE_3__.el)('li.pomodoro-tasks__list-item', 'Напишите название задачи чтобы её добавить'), (0,redom__WEBPACK_IMPORTED_MODULE_3__.el)('li.pomodoro-tasks__list-item', 'Чтобы задачу активировать, выберите её из списка'), (0,redom__WEBPACK_IMPORTED_MODULE_3__.el)('li.pomodoro-tasks__list-item', 'Запустите таймер'), (0,redom__WEBPACK_IMPORTED_MODULE_3__.el)('li.pomodoro-tasks__list-item', 'Работайте пока таймер не прозвонит'), (0,redom__WEBPACK_IMPORTED_MODULE_3__.el)('li.pomodoro-tasks__list-item', 'Сделайте короткий перерыв (5 минут)'), (0,redom__WEBPACK_IMPORTED_MODULE_3__.el)('li.pomodoro-tasks__list-item', 'Продолжайте работать, пока задача не будет выполнена'), (0,redom__WEBPACK_IMPORTED_MODULE_3__.el)('li.pomodoro-tasks__list-item', 'Каждые 4 периода таймера делайте длинный перерыв (15 минут)')]), questTasks, deadlineTimerText])]);
    (0,redom__WEBPACK_IMPORTED_MODULE_3__.mount)(mainSection, mainContainer);
    const main = (0,redom__WEBPACK_IMPORTED_MODULE_3__.el)('main', mainSection);
    this.main = main;
    this.main.taskForm = taskForm;
    this.main.questTasks = questTasks;
    this.main.formWindow = formWindow;
    this.main.deadlineTimerText = deadlineTimerText;
    return main;
  }
  createModalOverlay() {
    const modalOverlay = (0,redom__WEBPACK_IMPORTED_MODULE_3__.el)('div.modal-overlay', [(0,redom__WEBPACK_IMPORTED_MODULE_3__.el)('div.modal-delete', [(0,redom__WEBPACK_IMPORTED_MODULE_3__.el)('p.modal-delete__title', 'Удалить задачу?'), (0,redom__WEBPACK_IMPORTED_MODULE_3__.el)('button.modal-delete__close-button'), (0,redom__WEBPACK_IMPORTED_MODULE_3__.el)('button.modal-delete__delete-button.button-primary', 'Удалить'), (0,redom__WEBPACK_IMPORTED_MODULE_3__.el)('button.modal-delete__cancel-button', 'Отмена')])]);
    this.modalOverlay = modalOverlay;
    return modalOverlay;
  }
  render() {
    const body = document.body;
    (0,redom__WEBPACK_IMPORTED_MODULE_3__.setChildren)(body, [this.header, this.main, this.modalOverlay]);
  }
  formSubmitClick = e => {
    e.preventDefault();
    const taskForm = this.main.taskForm;
    const questTasks = this.main.questTasks;
    const taskFormValue = taskForm.inputTitleTask.value.trim();
    if (taskFormValue === '') return;
    const delListTasks = this.controller.handleListTasks();
    const tasks = questTasks.querySelectorAll('li');
    if (tasks.length > 0 && delListTasks) {
      for (const task of tasks) {
        task.remove();
      }
    }
    this.сongigureInitialValues();
    const formData = new FormData(taskForm);
    const title = formData.get('task-name').trim();
    const importanceValue = taskForm.buttonImportance.getAttribute('data-importance');
    const {
      task,
      deadlineTime
    } = this.controller.handleFormSubmit(title, importanceValue);
    this.addTaskToList(task, deadlineTime);
  };
  buttonImportanceClick = _ref => {
    let {
      target
    } = _ref;
    target.classList.remove(...importanceLevels);
    target.classList.add(importanceLevels[this.countStyleButton]);
    target.setAttribute('data-importance', importanceLevels[this.countStyleButton]);
    this.countStyleButton = (this.countStyleButton + 1) % importanceLevels.length;
  };

  // Активировать задачу и переместить ее в начало списка
  taskTextClick = (task, taskId) => {
    if (!timer.activeTask || taskId !== timer.activeTask.id) {
      const activeTaskIndex = this.controller.handleActiveTask(taskId);
      const activeTaskText = task.querySelector('.pomodoro-tasks__task-text');
      if (!activeTaskText.classList.contains('pomodoro-tasks__task-text_active')) {
        this.controller.handleMoveTaskToBegin(activeTaskIndex);
        this.updateTaskList(activeTaskIndex);
      }
    }
  };
  deleteButtonClick = () => {
    const deadlineTime = this.controller.handleDeadlineTime();
    this.updateDeadlineTimer(deadlineTime);
    timer.listTasks.length > 0 ? this.updateWindowPanel() : this.сongigureInitialValues();
  };
  bindListeners() {
    const taskForm = this.main.taskForm;
    const questTasks = this.main.questTasks;
    const formWindow = this.main.formWindow;

    // Прослушивание события отправки формы
    taskForm.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        taskForm.dispatchEvent(new Event('submit'));
      }
    });
    taskForm.addEventListener('submit', this.formSubmitClick);

    // Переключить стили кнопки, котрая определяет важность задачи
    taskForm.buttonImportance.addEventListener('click', this.buttonImportanceClick);

    // Обработать действия с элементами задач на странице
    questTasks.addEventListener('click', _ref2 => {
      let {
        target
      } = _ref2;
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
        document.addEventListener('click', _ref3 => {
          let {
            target
          } = _ref3;
          if (!target.closest('.pomodoro-tasks__task-text') && !target.closest('.burger-popup__edit-button')) {
            taskText.contentEditable = false;
            const newTitleTask = taskText.textContent.trim();
            if (newTitleTask === '') {
              taskText.textContent = titleTask;
            } else {
              taskText.textContent = newTitleTask;
              const taskToUpdate = this.controller.handleRenameTask(taskId, newTitleTask);
              if (taskToUpdate) {
                this.updateWindowPanel();
              }
            }
          }
        });
        const delButton = task.querySelector('.burger-popup__delete-button');
        delButton.addEventListener('click', () => {
          this.modalOverlay.style.display = 'block';
          this.modalOverlay.setAttribute('data-task-id', taskId);
        });
        let taskDeleted = false;
        this.modalOverlay.addEventListener('click', _ref4 => {
          let {
            target
          } = _ref4;
          if (target.classList.contains('modal-delete__close-button') || target.classList.contains('modal-delete__cancel-button')) {
            this.closeModal(this.modalOverlay);
          }
          if (target.classList.contains('modal-delete__delete-button') && !taskDeleted) {
            taskDeleted = true;
            const taskIdToDelete = this.modalOverlay.getAttribute('data-task-id');
            const taskToRemove = document.querySelector(`[data-id="${taskIdToDelete}"]`);
            const firstTaskId = this.controller.handleRemoveTask(taskIdToDelete);
            if (taskIdToDelete === firstTaskId) {
              formWindow.timerText.textContent = '00:00';
            }
            if (taskToRemove) {
              taskToRemove.remove();
              this.updateCountList();
              this.deleteButtonClick();
            }
            this.closeModal(this.modalOverlay);
          }
        });
      }
    });

    // Закрыть меню при клике вне его
    document.addEventListener('click', _ref5 => {
      let {
        target
      } = _ref5;
      if (!target.closest('.burger-popup') && !target.closest('.pomodoro-tasks__task-button')) {
        const burgerPopups = document.querySelectorAll('.burger-popup');
        burgerPopups.forEach(burgerPopup => {
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
    const formattedMinutes = this.formatWord(remainingMinutes, minuteVariations);
    return {
      hours,
      remainingMinutes,
      formattedHours,
      formattedMinutes
    };
  }

  // Обновить панель на таймере
  updateWindowPanel() {
    const formWindow = this.main.formWindow;
    formWindow.panelTaskActive.textContent = timer.listTasks[0].title;
    formWindow.panelTaskNext.textContent = timer.listTasks[1] ? timer.listTasks[1].title : '';
  }

  // Обновить общее время, требуемое на выполнение задач
  updateDeadlineTimer(minutes) {
    const deadlineTimerText = this.main.deadlineTimerText;
    if (minutes <= 0) {
      deadlineTimerText.textContent = 'Время вышло';
      return;
    }
    const {
      hours,
      remainingMinutes,
      formattedHours,
      formattedMinutes
    } = this.formatTimeWords(minutes);
    if (formattedHours && formattedMinutes) {
      deadlineTimerText.textContent = `
      ${hours} ${formattedHours} ${remainingMinutes} ${formattedMinutes}`;
    } else if (formattedMinutes) {
      deadlineTimerText.textContent = `${remainingMinutes} ${formattedMinutes}`;
    }
  }

  // Отобразить добавленную задачу на странице
  addTaskToList(task, deadlineTime) {
    const questTasks = this.main.questTasks;
    const tasks = questTasks.querySelectorAll('li');
    const countList = tasks.length + 1;
    const row = new _renderTask__WEBPACK_IMPORTED_MODULE_1__.RenderTask(task, countList);
    (0,redom__WEBPACK_IMPORTED_MODULE_3__.mount)(questTasks, row);
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
    const activeTaskText = activeTaskOnPage.querySelector('.pomodoro-tasks__task-text');
    activeTaskText.classList.add('pomodoro-tasks__task-text_active');
    tasks.unshift(activeTaskOnPage);
    tasks.forEach(task => {
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
    allTasks.forEach(newTask => {
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

/***/ }),

/***/ "./src/js/task.js":
/*!************************!*\
  !*** ./src/js/task.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DefaultTask: () => (/* binding */ DefaultTask),
/* harmony export */   ImportantTask: () => (/* binding */ ImportantTask),
/* harmony export */   Task: () => (/* binding */ Task),
/* harmony export */   UnimportantTask: () => (/* binding */ UnimportantTask)
/* harmony export */ });
class Task {
  constructor(title) {
    let count = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    this.title = title;
    this.count = count;
    this.id = Math.random().toString().substring(2, 10);
  }

  // Увеличить значения счетчика на 1
  increaseCount() {
    this.count += 1;
  }

  // Переименовать задачу
  setTitle(title) {
    this.title = title;
    return this;
  }
}
class ImportantTask extends Task {
  importance = 'important';
  constructor(title) {
    let count = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    super(title, count);
  }
}
class DefaultTask extends Task {
  importance = 'default';
  constructor(title) {
    let count = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    super(title, count);
  }
}
class UnimportantTask extends Task {
  importance = 'unimportant';
  constructor(title) {
    let count = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    super(title, count);
  }
}

/***/ }),

/***/ "./src/js/timer.js":
/*!*************************!*\
  !*** ./src/js/timer.js ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Timer: () => (/* binding */ Timer)
/* harmony export */ });
class Timer {
  constructor(_ref) {
    let {
      time = 25,
      pause = 5,
      bigPause = 15,
      listTasks = []
    } = _ref;
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
    this.listTasks = this.listTasks.filter(task => task.id !== id);
  }

  // Поиск задачи по ID
  findTaskById(id) {
    return this.listTasks.find(task => task.id === id);
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
    const timeInSeconds = time * 60;
    if (this.timerId) {
      clearTimeout(this.timerId);
    }
    this.updateTimerDisplay(timeInSeconds);
  }

  // Обновить время на странице
  updateTimerDisplay(timeInSeconds) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');
    const timerText = document.querySelector('.window__timer-text');
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

/***/ }),

/***/ "./src/scss/index.scss":
/*!*****************************!*\
  !*** ./src/scss/index.scss ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./node_modules/redom/dist/redom.es.js":
/*!*********************************************!*\
  !*** ./node_modules/redom/dist/redom.es.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   List: () => (/* binding */ List),
/* harmony export */   ListPool: () => (/* binding */ ListPool),
/* harmony export */   Place: () => (/* binding */ Place),
/* harmony export */   Router: () => (/* binding */ Router),
/* harmony export */   el: () => (/* binding */ el),
/* harmony export */   h: () => (/* binding */ h),
/* harmony export */   html: () => (/* binding */ html),
/* harmony export */   list: () => (/* binding */ list),
/* harmony export */   listPool: () => (/* binding */ listPool),
/* harmony export */   mount: () => (/* binding */ mount),
/* harmony export */   place: () => (/* binding */ place),
/* harmony export */   router: () => (/* binding */ router),
/* harmony export */   s: () => (/* binding */ s),
/* harmony export */   setAttr: () => (/* binding */ setAttr),
/* harmony export */   setChildren: () => (/* binding */ setChildren),
/* harmony export */   setData: () => (/* binding */ setData),
/* harmony export */   setStyle: () => (/* binding */ setStyle),
/* harmony export */   setXlink: () => (/* binding */ setXlink),
/* harmony export */   svg: () => (/* binding */ svg),
/* harmony export */   text: () => (/* binding */ text),
/* harmony export */   unmount: () => (/* binding */ unmount)
/* harmony export */ });
function createElement (query, ns) {
  var ref = parse(query);
  var tag = ref.tag;
  var id = ref.id;
  var className = ref.className;
  var element = ns ? document.createElementNS(ns, tag) : document.createElement(tag);

  if (id) {
    element.id = id;
  }

  if (className) {
    if (ns) {
      element.setAttribute('class', className);
    } else {
      element.className = className;
    }
  }

  return element;
}

function parse (query) {
  var chunks = query.split(/([.#])/);
  var className = '';
  var id = '';

  for (var i = 1; i < chunks.length; i += 2) {
    switch (chunks[i]) {
      case '.':
        className += " " + (chunks[i + 1]);
        break;

      case '#':
        id = chunks[i + 1];
    }
  }

  return {
    className: className.trim(),
    tag: chunks[0] || 'div',
    id: id
  };
}

function unmount (parent, child) {
  var parentEl = getEl(parent);
  var childEl = getEl(child);

  if (child === childEl && childEl.__redom_view) {
    // try to look up the view if not provided
    child = childEl.__redom_view;
  }

  if (childEl.parentNode) {
    doUnmount(child, childEl, parentEl);

    parentEl.removeChild(childEl);
  }

  return child;
}

function doUnmount (child, childEl, parentEl) {
  var hooks = childEl.__redom_lifecycle;

  if (hooksAreEmpty(hooks)) {
    childEl.__redom_lifecycle = {};
    return;
  }

  var traverse = parentEl;

  if (childEl.__redom_mounted) {
    trigger(childEl, 'onunmount');
  }

  while (traverse) {
    var parentHooks = traverse.__redom_lifecycle || {};

    for (var hook in hooks) {
      if (parentHooks[hook]) {
        parentHooks[hook] -= hooks[hook];
      }
    }

    if (hooksAreEmpty(parentHooks)) {
      traverse.__redom_lifecycle = null;
    }

    traverse = traverse.parentNode;
  }
}

function hooksAreEmpty (hooks) {
  if (hooks == null) {
    return true;
  }
  for (var key in hooks) {
    if (hooks[key]) {
      return false;
    }
  }
  return true;
}

/* global Node, ShadowRoot */

var hookNames = ['onmount', 'onremount', 'onunmount'];
var shadowRootAvailable = typeof window !== 'undefined' && 'ShadowRoot' in window;

function mount (parent, child, before, replace) {
  var parentEl = getEl(parent);
  var childEl = getEl(child);

  if (child === childEl && childEl.__redom_view) {
    // try to look up the view if not provided
    child = childEl.__redom_view;
  }

  if (child !== childEl) {
    childEl.__redom_view = child;
  }

  var wasMounted = childEl.__redom_mounted;
  var oldParent = childEl.parentNode;

  if (wasMounted && (oldParent !== parentEl)) {
    doUnmount(child, childEl, oldParent);
  }

  if (before != null) {
    if (replace) {
      var beforeEl = getEl(before);

      if (beforeEl.__redom_mounted) {
        trigger(beforeEl, 'onunmount');
      }

      parentEl.replaceChild(childEl, beforeEl);
    } else {
      parentEl.insertBefore(childEl, getEl(before));
    }
  } else {
    parentEl.appendChild(childEl);
  }

  doMount(child, childEl, parentEl, oldParent);

  return child;
}

function trigger (el, eventName) {
  if (eventName === 'onmount' || eventName === 'onremount') {
    el.__redom_mounted = true;
  } else if (eventName === 'onunmount') {
    el.__redom_mounted = false;
  }

  var hooks = el.__redom_lifecycle;

  if (!hooks) {
    return;
  }

  var view = el.__redom_view;
  var hookCount = 0;

  view && view[eventName] && view[eventName]();

  for (var hook in hooks) {
    if (hook) {
      hookCount++;
    }
  }

  if (hookCount) {
    var traverse = el.firstChild;

    while (traverse) {
      var next = traverse.nextSibling;

      trigger(traverse, eventName);

      traverse = next;
    }
  }
}

function doMount (child, childEl, parentEl, oldParent) {
  var hooks = childEl.__redom_lifecycle || (childEl.__redom_lifecycle = {});
  var remount = (parentEl === oldParent);
  var hooksFound = false;

  for (var i = 0, list = hookNames; i < list.length; i += 1) {
    var hookName = list[i];

    if (!remount) { // if already mounted, skip this phase
      if (child !== childEl) { // only Views can have lifecycle events
        if (hookName in child) {
          hooks[hookName] = (hooks[hookName] || 0) + 1;
        }
      }
    }
    if (hooks[hookName]) {
      hooksFound = true;
    }
  }

  if (!hooksFound) {
    childEl.__redom_lifecycle = {};
    return;
  }

  var traverse = parentEl;
  var triggered = false;

  if (remount || (traverse && traverse.__redom_mounted)) {
    trigger(childEl, remount ? 'onremount' : 'onmount');
    triggered = true;
  }

  while (traverse) {
    var parent = traverse.parentNode;
    var parentHooks = traverse.__redom_lifecycle || (traverse.__redom_lifecycle = {});

    for (var hook in hooks) {
      parentHooks[hook] = (parentHooks[hook] || 0) + hooks[hook];
    }

    if (triggered) {
      break;
    } else {
      if (traverse.nodeType === Node.DOCUMENT_NODE ||
        (shadowRootAvailable && (traverse instanceof ShadowRoot)) ||
        (parent && parent.__redom_mounted)
      ) {
        trigger(traverse, remount ? 'onremount' : 'onmount');
        triggered = true;
      }
      traverse = parent;
    }
  }
}

function setStyle (view, arg1, arg2) {
  var el = getEl(view);

  if (typeof arg1 === 'object') {
    for (var key in arg1) {
      setStyleValue(el, key, arg1[key]);
    }
  } else {
    setStyleValue(el, arg1, arg2);
  }
}

function setStyleValue (el, key, value) {
  el.style[key] = value == null ? '' : value;
}

/* global SVGElement */

var xlinkns = 'http://www.w3.org/1999/xlink';

function setAttr (view, arg1, arg2) {
  setAttrInternal(view, arg1, arg2);
}

function setAttrInternal (view, arg1, arg2, initial) {
  var el = getEl(view);

  var isObj = typeof arg1 === 'object';

  if (isObj) {
    for (var key in arg1) {
      setAttrInternal(el, key, arg1[key], initial);
    }
  } else {
    var isSVG = el instanceof SVGElement;
    var isFunc = typeof arg2 === 'function';

    if (arg1 === 'style' && typeof arg2 === 'object') {
      setStyle(el, arg2);
    } else if (isSVG && isFunc) {
      el[arg1] = arg2;
    } else if (arg1 === 'dataset') {
      setData(el, arg2);
    } else if (!isSVG && (arg1 in el || isFunc) && (arg1 !== 'list')) {
      el[arg1] = arg2;
    } else {
      if (isSVG && (arg1 === 'xlink')) {
        setXlink(el, arg2);
        return;
      }
      if (initial && arg1 === 'class') {
        arg2 = el.className + ' ' + arg2;
      }
      if (arg2 == null) {
        el.removeAttribute(arg1);
      } else {
        el.setAttribute(arg1, arg2);
      }
    }
  }
}

function setXlink (el, arg1, arg2) {
  if (typeof arg1 === 'object') {
    for (var key in arg1) {
      setXlink(el, key, arg1[key]);
    }
  } else {
    if (arg2 != null) {
      el.setAttributeNS(xlinkns, arg1, arg2);
    } else {
      el.removeAttributeNS(xlinkns, arg1, arg2);
    }
  }
}

function setData (el, arg1, arg2) {
  if (typeof arg1 === 'object') {
    for (var key in arg1) {
      setData(el, key, arg1[key]);
    }
  } else {
    if (arg2 != null) {
      el.dataset[arg1] = arg2;
    } else {
      delete el.dataset[arg1];
    }
  }
}

function text (str) {
  return document.createTextNode((str != null) ? str : '');
}

function parseArgumentsInternal (element, args, initial) {
  for (var i = 0, list = args; i < list.length; i += 1) {
    var arg = list[i];

    if (arg !== 0 && !arg) {
      continue;
    }

    var type = typeof arg;

    if (type === 'function') {
      arg(element);
    } else if (type === 'string' || type === 'number') {
      element.appendChild(text(arg));
    } else if (isNode(getEl(arg))) {
      mount(element, arg);
    } else if (arg.length) {
      parseArgumentsInternal(element, arg, initial);
    } else if (type === 'object') {
      setAttrInternal(element, arg, null, initial);
    }
  }
}

function ensureEl (parent) {
  return typeof parent === 'string' ? html(parent) : getEl(parent);
}

function getEl (parent) {
  return (parent.nodeType && parent) || (!parent.el && parent) || getEl(parent.el);
}

function isNode (arg) {
  return arg && arg.nodeType;
}

function html (query) {
  var args = [], len = arguments.length - 1;
  while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

  var element;

  var type = typeof query;

  if (type === 'string') {
    element = createElement(query);
  } else if (type === 'function') {
    var Query = query;
    element = new (Function.prototype.bind.apply( Query, [ null ].concat( args) ));
  } else {
    throw new Error('At least one argument required');
  }

  parseArgumentsInternal(getEl(element), args, true);

  return element;
}

var el = html;
var h = html;

html.extend = function extendHtml () {
  var args = [], len = arguments.length;
  while ( len-- ) args[ len ] = arguments[ len ];

  return html.bind.apply(html, [ this ].concat( args ));
};

function setChildren (parent) {
  var children = [], len = arguments.length - 1;
  while ( len-- > 0 ) children[ len ] = arguments[ len + 1 ];

  var parentEl = getEl(parent);
  var current = traverse(parent, children, parentEl.firstChild);

  while (current) {
    var next = current.nextSibling;

    unmount(parent, current);

    current = next;
  }
}

function traverse (parent, children, _current) {
  var current = _current;

  var childEls = Array(children.length);

  for (var i = 0; i < children.length; i++) {
    childEls[i] = children[i] && getEl(children[i]);
  }

  for (var i$1 = 0; i$1 < children.length; i$1++) {
    var child = children[i$1];

    if (!child) {
      continue;
    }

    var childEl = childEls[i$1];

    if (childEl === current) {
      current = current.nextSibling;
      continue;
    }

    if (isNode(childEl)) {
      var next = current && current.nextSibling;
      var exists = child.__redom_index != null;
      var replace = exists && next === childEls[i$1 + 1];

      mount(parent, child, current, replace);

      if (replace) {
        current = next;
      }

      continue;
    }

    if (child.length != null) {
      current = traverse(parent, child, current);
    }
  }

  return current;
}

function listPool (View, key, initData) {
  return new ListPool(View, key, initData);
}

var ListPool = function ListPool (View, key, initData) {
  this.View = View;
  this.initData = initData;
  this.oldLookup = {};
  this.lookup = {};
  this.oldViews = [];
  this.views = [];

  if (key != null) {
    this.key = typeof key === 'function' ? key : propKey(key);
  }
};

ListPool.prototype.update = function update (data, context) {
  var ref = this;
    var View = ref.View;
    var key = ref.key;
    var initData = ref.initData;
  var keySet = key != null;

  var oldLookup = this.lookup;
  var newLookup = {};

  var newViews = Array(data.length);
  var oldViews = this.views;

  for (var i = 0; i < data.length; i++) {
    var item = data[i];
    var view = (void 0);

    if (keySet) {
      var id = key(item);

      view = oldLookup[id] || new View(initData, item, i, data);
      newLookup[id] = view;
      view.__redom_id = id;
    } else {
      view = oldViews[i] || new View(initData, item, i, data);
    }
    view.update && view.update(item, i, data, context);

    var el = getEl(view.el);

    el.__redom_view = view;
    newViews[i] = view;
  }

  this.oldViews = oldViews;
  this.views = newViews;

  this.oldLookup = oldLookup;
  this.lookup = newLookup;
};

function propKey (key) {
  return function (item) {
    return item[key];
  };
}

function list (parent, View, key, initData) {
  return new List(parent, View, key, initData);
}

var List = function List (parent, View, key, initData) {
  this.View = View;
  this.initData = initData;
  this.views = [];
  this.pool = new ListPool(View, key, initData);
  this.el = ensureEl(parent);
  this.keySet = key != null;
};

List.prototype.update = function update (data, context) {
    if ( data === void 0 ) data = [];

  var ref = this;
    var keySet = ref.keySet;
  var oldViews = this.views;

  this.pool.update(data, context);

  var ref$1 = this.pool;
    var views = ref$1.views;
    var lookup = ref$1.lookup;

  if (keySet) {
    for (var i = 0; i < oldViews.length; i++) {
      var oldView = oldViews[i];
      var id = oldView.__redom_id;

      if (lookup[id] == null) {
        oldView.__redom_index = null;
        unmount(this, oldView);
      }
    }
  }

  for (var i$1 = 0; i$1 < views.length; i$1++) {
    var view = views[i$1];

    view.__redom_index = i$1;
  }

  setChildren(this, views);

  if (keySet) {
    this.lookup = lookup;
  }
  this.views = views;
};

List.extend = function extendList (parent, View, key, initData) {
  return List.bind(List, parent, View, key, initData);
};

list.extend = List.extend;

/* global Node */

function place (View, initData) {
  return new Place(View, initData);
}

var Place = function Place (View, initData) {
  this.el = text('');
  this.visible = false;
  this.view = null;
  this._placeholder = this.el;

  if (View instanceof Node) {
    this._el = View;
  } else if (View.el instanceof Node) {
    this._el = View;
    this.view = View;
  } else {
    this._View = View;
  }

  this._initData = initData;
};

Place.prototype.update = function update (visible, data) {
  var placeholder = this._placeholder;
  var parentNode = this.el.parentNode;

  if (visible) {
    if (!this.visible) {
      if (this._el) {
        mount(parentNode, this._el, placeholder);
        unmount(parentNode, placeholder);

        this.el = getEl(this._el);
        this.visible = visible;
      } else {
        var View = this._View;
        var view = new View(this._initData);

        this.el = getEl(view);
        this.view = view;

        mount(parentNode, view, placeholder);
        unmount(parentNode, placeholder);
      }
    }
    this.view && this.view.update && this.view.update(data);
  } else {
    if (this.visible) {
      if (this._el) {
        mount(parentNode, placeholder, this._el);
        unmount(parentNode, this._el);

        this.el = placeholder;
        this.visible = visible;

        return;
      }
      mount(parentNode, placeholder, this.view);
      unmount(parentNode, this.view);

      this.el = placeholder;
      this.view = null;
    }
  }
  this.visible = visible;
};

/* global Node */

function router (parent, Views, initData) {
  return new Router(parent, Views, initData);
}

var Router = function Router (parent, Views, initData) {
  this.el = ensureEl(parent);
  this.Views = Views;
  this.initData = initData;
};

Router.prototype.update = function update (route, data) {
  if (route !== this.route) {
    var Views = this.Views;
    var View = Views[route];

    this.route = route;

    if (View && (View instanceof Node || View.el instanceof Node)) {
      this.view = View;
    } else {
      this.view = View && new View(this.initData, data);
    }

    setChildren(this.el, [this.view]);
  }
  this.view && this.view.update && this.view.update(data, route);
};

var ns = 'http://www.w3.org/2000/svg';

function svg (query) {
  var args = [], len = arguments.length - 1;
  while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

  var element;

  var type = typeof query;

  if (type === 'string') {
    element = createElement(query, ns);
  } else if (type === 'function') {
    var Query = query;
    element = new (Function.prototype.bind.apply( Query, [ null ].concat( args) ));
  } else {
    throw new Error('At least one argument required');
  }

  parseArgumentsInternal(getEl(element), args, true);

  return element;
}

var s = svg;

svg.extend = function extendSvg () {
  var args = [], len = arguments.length;
  while ( len-- ) args[ len ] = arguments[ len ];

  return svg.bind.apply(svg, [ this ].concat( args ));
};

svg.ns = ns;




/***/ }),

/***/ "./src/img/svg/noto_tomato.svg":
/*!*************************************!*\
  !*** ./src/img/svg/noto_tomato.svg ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "assets/c93354ed3efc002274f4.svg";

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src;
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) {
/******/ 					var i = scripts.length - 1;
/******/ 					while (i > -1 && !scriptUrl) scriptUrl = scripts[i--].src;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _js_renderTomato__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./js/renderTomato */ "./src/js/renderTomato.js");
/* harmony import */ var _scss_index_scss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./scss/index.scss */ "./src/scss/index.scss");


const init = () => {
  new _js_renderTomato__WEBPACK_IMPORTED_MODULE_0__.RenderTomato();
};
init();
})();

/******/ })()
;
//# sourceMappingURL=main6f967448266c00ea3236.js.map