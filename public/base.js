
/* *************************************************************************** */

// Set bootstrap theme
document.documentElement.setAttribute('data-bs-theme', window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

/* *************************************************************************** */

// Inject modal.
document.body.insertAdjacentHTML('beforeend', `<div class="modal" tabindex="-1" role="dialog" id="m-modal">
<div class="modal-dialog modal-dialog-centered" role="document">
  <div class="modal-content rounded-3 shadow">
    <div class="modal-body p-4 text-center">
      <h5 class="mb-0" id="m-title">Loading...</h5>
      <p class="mb-0" id="m-description">loading...</p>
    </div>
    <div class="modal-footer flex-nowrap p-0">
      <button type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 py-3 m-0 rounded-0 border-end" id="m-accept-btn">Loading...</button>
      <button type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 py-3 m-0 rounded-0" id="m-cancel-btn">Loading...</button>
    </div>
  </div>
</div>
</div>`);

// Modal utility class.
class Modal {
    /*
     *
     * Example usage:
     * 
     * new Modal('Title', 'Description', {
     *     accept: {
     *         text: 'Accept',
     *         bold: true,
     *         action: () => {
     *             console.log('Accepted.');
     *         },
     *         close: true
     *     },
     *     cancel: {
     *         text: 'Cancel',
     *         bold: false,
     *         action: () => {
     *             console.log('Cancelled.');
     *         },
     *         close: true
     *     },
     * }).show(false);
     *
     */

    constructor(title, description, buttons) {
        document.getElementById('m-title').innerHTML = title;
        document.getElementById('m-description').innerHTML = description;

        document.getElementById('m-accept-btn').innerHTML = `${buttons['accept'].bold ? `<strong>` : ``}${buttons['accept'].text}${buttons['accept'].bold ? `</strong>` : ``}`;
        document.getElementById('m-cancel-btn').innerHTML = `${buttons['cancel'].bold ? `<strong>` : ``}${buttons['cancel'].text}${buttons['cancel'].bold ? `</strong>` : ``}`;

        document.getElementById('m-accept-btn').addEventListener('click', buttons['accept'].action);
        document.getElementById('m-cancel-btn').addEventListener('click', buttons['cancel'].action);

        document.getElementById('m-accept-btn').removeAttribute('data-bs-dismiss');
        document.getElementById('m-cancel-btn').removeAttribute('data-bs-dismiss');

        if (buttons['accept'].close) document.getElementById('m-accept-btn').setAttribute('data-bs-dismiss', 'modal');
        if (buttons['cancel'].close) document.getElementById('m-cancel-btn').setAttribute('data-bs-dismiss', 'modal');
    }

    show(allowKeyboard) {
        new bootstrap.Modal('#m-modal', {
            keyboard: allowKeyboard
        }).show();
    }
}

/* *************************************************************************** */
