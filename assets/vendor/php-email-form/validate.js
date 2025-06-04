document.querySelector('.php-email-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const form = this;
  const formData = new FormData(form);
  const loading = form.querySelector('.loading');
  const error = form.querySelector('.error-message');
  const sent = form.querySelector('.sent-message');

  loading.style.display = 'block';
  error.style.display = 'none';
  sent.style.display = 'none';

  fetch(form.action, {
    method: 'POST',
    body: formData
  })
  .then(response => response.text())
  .then(text => {
    loading.style.display = 'none';
    if (text.trim() === 'OK') {
      sent.style.display = 'block';
      form.reset();
    } else {
      error.innerHTML = text;
      error.style.display = 'block';
    }
  })
  .catch(err => {
    loading.style.display = 'none';
    error.innerHTML = 'Error sending message: ' + err;
    error.style.display = 'block';
  });
});