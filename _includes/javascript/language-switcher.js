function switchLanguage(lang) {
    localStorage.setItem('preferredLanguage', lang);
    
    document.querySelectorAll('[class^="lang-"]').forEach(el => {
      el.style.display = 'none';
    });
    
    document.querySelectorAll(`.lang-${lang}`).forEach(el => {
      el.style.display = 'block';
    });
  }
  
  function applyLanguage() {
    const lang = localStorage.getItem('preferredLanguage') || 'en';
    switchLanguage(lang);
  }
  
  document.addEventListener('DOMContentLoaded', applyLanguage);