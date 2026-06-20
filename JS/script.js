const toggleLogin = document.getElementById('toggle-login');
const toggleRegister = document.getElementById('toggle-register');
const formLogin = document.getElementById('form-login');
const formRegister = document.getElementById('form-register');

toggleLogin.addEventListener('click', () => {
    toggleLogin.classList.add('active');
    toggleRegister.classList.remove('active');

    formLogin.classList.remove('d-none');
    formRegister.classList.add('d-none');
});

toggleRegister.addEventListener('click', () => {
    toggleLogin.classList.remove('active');
    toggleRegister.classList.add('active');

    formLogin.classList.add('d-none');
    formRegister.classList.remove('d-none');
});