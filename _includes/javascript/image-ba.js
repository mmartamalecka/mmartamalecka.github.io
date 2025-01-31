document.addEventListener('DOMContentLoaded', function() {
    const containers = document.querySelectorAll('.image-comparison');
  
    containers.forEach(container => {
      const slider = container.querySelector('.slider');
      const beforeImage = container.querySelector('.image-before');
      const sliderButton = container.querySelector('.slider-button');
      const sliderLine = container.querySelector('.slider-line');
  
      let isDown = false;
  
      const setPositions = (x) => {
        const rect = slider.getBoundingClientRect();
        const percentage = Math.max(0, Math.min(100, ((x - rect.left) / rect.width) * 100));
        
        beforeImage.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
        sliderButton.style.left = `${percentage}%`;
        sliderLine.style.left = `${percentage}%`;
        slider.value = percentage;
      };
  
      const initialPos = 50;
      setPositions(slider.getBoundingClientRect().left + (slider.getBoundingClientRect().width * initialPos / 100));
  
      const onMove = (e) => {
        if (!isDown) return;
        const x = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        setPositions(x);
      };
  
      slider.addEventListener('mousedown', () => isDown = true);
      slider.addEventListener('touchstart', () => isDown = true);
  
      window.addEventListener('mouseup', () => isDown = false);
      window.addEventListener('touchend', () => isDown = false);
  
      slider.addEventListener('mousemove', onMove);
      slider.addEventListener('touchmove', onMove);
  
      slider.addEventListener('input', (e) => {
        const percentage = e.target.value;
        setPositions(slider.getBoundingClientRect().left + (slider.getBoundingClientRect().width * percentage / 100));
      });
    });
  });