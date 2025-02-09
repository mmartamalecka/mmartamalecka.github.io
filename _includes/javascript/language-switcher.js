function switchLanguage(lang) {
    localStorage.setItem('preferredLanguage', lang);
    
    document.querySelectorAll('[class^="lang-"]').forEach(el => {
      el.style.display = 'none';
    });
    
    document.querySelectorAll(`.lang-${lang}`).forEach(el => {
      el.style.display = 'block';
    });

    const activeButton = document.querySelector(`.button-${lang}`);
    const inactiveButton = document.querySelector(`.button-${lang === 'en' ? 'pl' : 'en'}`);

    if (activeButton && inactiveButton) {
      activeButton.style.display = 'none';
      activeButton.style.padding = '0';
      inactiveButton.style.display = '';
      inactiveButton.style.padding = ''; 
    }
  }
  
  function applyLanguage() {
    const lang = localStorage.getItem('preferredLanguage') || 'en';
    switchLanguage(lang);
  }
  
  document.addEventListener('DOMContentLoaded', applyLanguage);