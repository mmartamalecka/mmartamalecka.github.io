function initializeGallery(galleryId) {
    const gallery = document.getElementById(galleryId);
    const container = gallery.querySelector('.gallery-container');
    const prevBtn = gallery.querySelector('.gallery-nav.prev');
    const nextBtn = gallery.querySelector('.gallery-nav.next');
    const images = JSON.parse(gallery.dataset.images);
    const imageServePath = gallery.dataset.imageServePath;
    let currentIndex = 0;
    let isTransitioning = false;
  
    function createImage(src, className) {
      const img = new Image();
      img.src = imageServePath + src;
      img.className = className;
      img.alt = "Gallery image";
      return img;
    }
  
    let currentImg = createImage(images[0], 'current');
    let nextImg = createImage(images[1], 'next');
    container.appendChild(currentImg);
    container.appendChild(nextImg);
  
    function changeImage(direction) {
      if (isTransitioning) return;
      isTransitioning = true;
  
      const nextIndex = direction === 'next' 
        ? (currentIndex + 1) % images.length 
        : (currentIndex - 1 + images.length) % images.length;
  
      nextImg.src = imageServePath + images[nextIndex];
      
      
      nextImg.style.transition = 'none';
      nextImg.style.transform = direction === 'next' ? 'translateX(100%)' : 'translateX(-100%)';
      
      setTimeout(() => {
        nextImg.style.transition = 'transform 0.5s ease-in-out';
        nextImg.style.transform = 'translateX(0)';
        currentImg.style.transform = direction === 'next' ? 'translateX(-100%)' : 'translateX(100%)';
      }, 20);
  
      setTimeout(() => {
        container.removeChild(currentImg);
        currentImg = nextImg;
        currentImg.className = 'current';
        
        nextImg = createImage(images[(nextIndex + 1) % images.length], 'next');
        nextImg.style.transform = direction === 'next' ? 'translateX(100%)' : 'translateX(-100%)';
        container.appendChild(nextImg);
  
        currentIndex = nextIndex;
        isTransitioning = false;
      }, 520);
    }
  
    nextBtn.addEventListener('click', () => changeImage('next'));
    prevBtn.addEventListener('click', () => changeImage('prev'));
  }
  
  document.addEventListener('DOMContentLoaded', function() {
    const galleries = document.querySelectorAll('.image-gallery');
    galleries.forEach(gallery => {
      initializeGallery(gallery.id);
    });
  });