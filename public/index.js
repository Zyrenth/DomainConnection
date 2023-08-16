
/* *************************************************************************** */

if(document.getElementById(`domain.sub`).value.length === 0 || document.getElementById(`domain.record`).value.length === 0) document.getElementById(`domain.submit`).disabled = true;

document.getElementById('domain.sub').addEventListener('input', checkFields);
document.getElementById('domain.record').addEventListener('input', checkFields);

function checkFields() {
    if(document.getElementById(`domain.sub`).value.length > 0 && document.getElementById(`domain.record`).value.length > 0) document.getElementById(`domain.submit`).disabled = false;
    else document.getElementById(`domain.submit`).disabled = true;
}

document.getElementById('domain.submit').addEventListener('click', function(){
    if(!/^[a-zA-Z0-9]*$/.test(document.getElementById(`domain.sub`).value) || !/^[a-zA-Z0-9=]*$/.test(document.getElementById(`domain.record`).value) || !document.getElementById(`domain.record`).value.startsWith(`dh=`)) {
        document.getElementById(`dynamicErrorToastText`).innerHTML = `The sub-domain and record value can only contain letters, numbers or a valid format.`;
        bootstrap.Toast.getOrCreateInstance(document.getElementById('dynamicErrorToast')).show();
        return;
    };
    
    window.socket.emit(`activate`, {
        sub: document.getElementById(`domain.sub`).value,
        record: document.getElementById(`domain.record`).value
    });

    document.getElementById(`domain.sub`).value = ``;
    document.getElementById(`domain.record`).value = ``;

    document.getElementById(`domain.sub`).disabled = true;
    document.getElementById(`domain.record`).disabled = true;
    document.getElementById(`domain.submit`).disabled = true;
    document.getElementById(`domain.submit`).innerText = `Activating...`;
});

window.socket.on(`activate`, (success) => {
    document.getElementById(`domain.sub`).disabled = false;
    document.getElementById(`domain.record`).disabled = false;
    document.getElementById(`domain.submit`).disabled = false;
    document.getElementById(`domain.submit`).innerText = `Activate`;

    if(!success) {
        document.getElementById(`dynamicErrorToastText`).innerHTML = `Failed to activate your sub-domain, please try again.`;
        bootstrap.Toast.getOrCreateInstance(document.getElementById('dynamicErrorToast')).show();
        return;
    }

    document.getElementById(`dynamicToastText`).innerHTML = `Successfully activated your sub-domain, please wait a few seconds until verifying the domain on Discord.`;
    bootstrap.Toast.getOrCreateInstance(document.getElementById('dynamicToast')).show();
});

/* *************************************************************************** */