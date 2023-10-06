import {
  el,
  mount,
} from 'redom';

import {
  questTasks,
} from './getElements';

export class RenderTask {
  constructor(task, countList) {
    this.task = task;
    this.countList = countList;
    this.init();
  }

  init() {
    const taskTextClasses = this.countList === 1 ?
      'pomodoro-tasks__task-text pomodoro-tasks__task-text_active' :
      'pomodoro-tasks__task-text';

    this.el = el(`li.pomodoro-tasks__list-task.${this.task.importance}`,
      { 'data-id': this.task.id }, [
        el('span.count-number', this.countList),
        el('div', { className: taskTextClasses }, this.task.title),
        el('button.pomodoro-tasks__task-button'),
        el('div.burger-popup', [
          el('button.popup-button.burger-popup__edit-button', 'Редактировать'),
          el('button.popup-button.burger-popup__delete-button', 'Удалить'),
        ]),
      ]);

    mount(questTasks, this.el);
  }
}
