// assets/js/compartir.js
document.addEventListener('DOMContentLoaded', () => {
    const url    = encodeURIComponent(window.location.href);
    const titulo = encodeURIComponent(document.title);

    const btnWhatsapp = document.querySelector('.btn-whatsapp');
    const btnFacebook = document.querySelector('.btn-facebook');
    const btnEmail    = document.getElementById('btn-compartir-email');

    if (btnWhatsapp) {
        btnWhatsapp.href = `https://api.whatsapp.com/send?text=${titulo}%20${url}`;
    }

    if (btnFacebook) {
        btnFacebook.href = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    }

    if (btnEmail) {
        btnEmail.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = `mailto:?subject=${titulo}&body=${encodeURIComponent('Te comparto esta información del portal:\n\n')}${url}`;
        });
    }
});