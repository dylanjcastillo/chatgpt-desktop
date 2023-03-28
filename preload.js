window.addEventListener('DOMContentLoaded', () => {
  // Add a draggable div at the top of the window
  const draggableDiv = document.createElement('div');
  draggableDiv.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 24px;
    z-index: 10000;
    -webkit-app-region: drag;
  `;

  document.body.appendChild(draggableDiv);
});
