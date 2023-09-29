import { buttonImportance } from './getElements';

const switchStylesButton = () => {
  let count = 1;
  const imp = ['default', 'important', 'so-so'];

  buttonImportance.addEventListener('click', ({ target }) => {
    target.classList.remove(...imp);
    target.classList.add(imp[count]);
    count = (count + 1) % imp.length;
  });
};

const control = () => {
  switchStylesButton();
};

export default control;
