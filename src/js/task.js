/**
 * Класс, представляющий задачу
 */
class Task {
  /**
   * @param {string} title Заголовок задачи
   * @param {number} [count=0] Счетчик (по умолчанию 0)
   * @param {string} id Идентификатор задачи
   */
  constructor(title, count = 0) {
    this.title = title;
    this.count = count;
    this.id = Math.random().toString().substring(2, 10);
  }

  /**
   * Увеличение значения счетчика на 1
   */
  increaseCount() {
    this.count += 1;
  }

  /**
   * Устанавление заголовка задачи
   * @param {string} title Новый заголовок задачи
   * @return {Task} Обновленный объект задачи для цепочки методов
   */
  setTitle(title) {
    this.title = title;
    return this;
  }
}

const task = new Task('новая задача');
console.log(task);
