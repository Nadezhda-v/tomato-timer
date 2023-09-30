import control from './js/control';
import { Task } from './js/task';
import { Timer } from './js/timer';

import './scss/index.scss';

const task = new Task('новая задача');
console.log(task);

const timer = new Timer({});
timer.addTask(task);
timer.activateTask(task.id);

console.log(timer);

const init = () => {
  control();
};

init();
