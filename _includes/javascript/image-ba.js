document.addEventListener('DOMContentLoaded', function() {
  const containers = document.querySelectorAll('.image-comparison, .video-comparison');

  containers.forEach(container => {
    const slider = container.querySelector('.slider');
    const beforeElement = container.querySelector('.image-before');
    const afterElement = container.querySelector('.image-after');
    const sliderButton = container.querySelector('.slider-button');
    const sliderLine = container.querySelector('.slider-line');

    let isDown = false;
    let currentPercentage = 50;
    let targetPercentage = 50;

    const smoothingFactor = 0.1;

    const setPositions = (percentage) => {
      if (beforeElement.tagName === 'VIDEO') {
        beforeElement.style.width = `100%`;
        afterElement.style.width = `100%`;
        afterElement.style.left = `0`;
        afterElement.style.clipPath = `inset(0 0 0 ${percentage}%)`;

      } else {
        beforeElement.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
      }
      sliderButton.style.left = `${percentage}%`;
      sliderLine.style.left = `${percentage}%`;
      slider.value = percentage;
    };

    const animate = () => {
      if (Math.abs(targetPercentage - currentPercentage) > 0.1) {
        currentPercentage += (targetPercentage - currentPercentage) * smoothingFactor;
        setPositions(currentPercentage);
        requestAnimationFrame(animate);
      } else {
        currentPercentage = targetPercentage;
        setPositions(currentPercentage);
      }
    };

    const onMove = (e) => {
      if (!isDown) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX || e.touches[0].clientX;
      targetPercentage = ((x - rect.left) / rect.width) * 100;
      targetPercentage = Math.max(0, Math.min(100, targetPercentage));
      requestAnimationFrame(animate);
    };

    slider.addEventListener('mousedown', () => isDown = true);
    slider.addEventListener('touchstart', () => isDown = true);

    window.addEventListener('mouseup', () => isDown = false);
    window.addEventListener('touchend', () => isDown = false);

    slider.addEventListener('mousemove', onMove);
    slider.addEventListener('touchmove', onMove);

    slider.addEventListener('input', (e) => {
      targetPercentage = parseFloat(e.target.value);
      requestAnimationFrame(animate);
    });

    if (beforeElement.tagName === 'VIDEO') {
      beforeElement.play();
      afterElement.play();
    }

    setPositions(50);
  });
});