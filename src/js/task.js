class Task {
  constructor(title, count = 0) {
    this.title = title;
    this.count = count;
    this.id = Math.random().toString().substring(2, 10);
  }

  // Увеличение значения счетчика на 1
  increaseCount() {
    this.count += 1;
  }

  // Устанавление заголовка задачи
  setTitle(title) {
    this.title = title;
    return this;
  }
}

const task = new Task('новая задача');
console.log(task);
