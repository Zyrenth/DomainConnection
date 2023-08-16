
/* *************************************************************************** */

// Load necesarry DOM elements.
const username = document.getElementById('username');
const profilePicture = document.getElementById('profile-picture');

/* *************************************************************************** */

// Connect to socket.
window.socket = io(window.location.protocol + '//' + window.location.hostname + ':4000', {
    query: { token: window.SESSION['access_token'] }
});

// Disconnect toast.
window.socket.on('connect', () => {
    bootstrap.Toast.getOrCreateInstance(document.getElementById('connectionLostToast')).hide();
    console.log(`Connected.`)
});

window.socket.on('disconnect', () => {
    bootstrap.Toast.getOrCreateInstance(document.getElementById('connectionLostToast')).show();
    console.log(`Disconnected.`)
});

/* *************************************************************************** */

// Fetch Discord profile.
window.socket.emit('get_profile');

window.socket.on('get_profile', (data) => {
    window.discordOAuth = data;
    username.innerHTML = `${timeBasedGreeting()}${data.global_name}.`;
    profilePicture.src = `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png?size=1024`;
});

/* *************************************************************************** */

// Time based greeting.
function timeBasedGreeting() {
    const currentHour = new Date().getHours();

    if (currentHour >= 5 && currentHour < 12)       return `Good morning, `;
    else if (currentHour >= 12 && currentHour < 18) return `Good afternoon, `;
    else                                            return `Good evening, `;
}

/* *************************************************************************** */
