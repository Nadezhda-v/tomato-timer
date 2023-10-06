import {
  el,
  mount,
  setChildren,
} from 'redom';

export class RenderTomato {
  constructor() {
    this.headerContainer = this.createHeader();
    this.mainContainer = this.createMain();
    this.modalOverlay = this.createModalOverlay();
    this.render();
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
    const mainContainer = el('div.container.main__container', [
      el('div.pomodoro-form.window', [
        el('div.window__panel', [
          el('p.window__panel-task.window__panel-task_active',
            'Сверстать сайт'),
          el('p.window__panel-task.window__panel-task_next',
            'Томат 2'),
        ]),
        el('div.window__body', [
          el('p.window__timer-text', '25:00'),
          el('div.window__buttons', [
            el('button.button.button__start-button.button-primary', 'Старт'),
            el('button.button.button__stop-button.button-secondary', 'Стоп'),
          ]),
        ]),
        el('form.task-form', { action: 'submit' }, [
          el('input.task-name.input-primary', {
            type: 'text',
            name: 'task-name',
            id: 'task-name',
            placeholder: 'название задачи',
          }),
          el('button.button.button-importance.default', {
            'type': 'button',
            'data-importance': 'default',
            'aria-label': 'Указать важность',
          }),
          el('button.button.button-primary.task-form__add-button', 'Добавить', {
            type: 'submit',
          }),
        ]),
      ]),
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
        el('ul.pomodoro-tasks__quest-tasks'),
        el('p.pomodoro-tasks__deadline-timer', '1 час 30 мин'),
      ]),
    ]);

    mount(mainSection, mainContainer);
    const main = el('main', mainSection);

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
    return modalOverlay;
  }

  render() {
    const body = document.body;
    setChildren(body, [
      this.headerContainer,
      this.mainContainer,
      this.modalOverlay,
    ]);
  }
}
