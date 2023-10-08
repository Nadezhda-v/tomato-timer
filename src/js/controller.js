import { Model } from './model';

export class Controller {
  constructor() {
    this.model = new Model();
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
}
