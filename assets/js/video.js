// Activa el sonido del video al primer clic del usuario
const video = document.getElementById('video-inicio');

if (video) {
    document.addEventListener('click', function () {
        if (video.muted) {
            video.muted = false;
            video.volume = 0.5;
        }
    }, { once: true });
}