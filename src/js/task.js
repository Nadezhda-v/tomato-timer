export class Task {
  constructor(title, count = 0) {
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
