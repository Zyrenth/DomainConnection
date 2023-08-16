
/* *************************************************************************** */

const list = document.getElementById('sub-domain-list');

window.socket.emit(`records`);

window.socket.on(`records`, (records) => {
    for (const key of Object.keys(records)) {
        for (const record of records[key]) {
            list.innerHTML += `<tr>
                <td>${key}</td>
                <td>${record.user.name} (${record.user.id})</td>
                <td>${record.record}</td>
                <td>${new Date(record.date).toLocaleString()}</td>
            </tr>`;
        }
    }
});

/* *************************************************************************** */