export async function MakeRequest(url, method, body, form = false) {
    let headers = {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRFToken': ''
    };
    if (form) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    if (method == 'post' || method == 'put' || method == 'delete') {
        const csrf = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
        headers['X-CSRFToken'] = csrf;
    }
    const response = await fetch(url, {
        method: method,
        headers: headers,
        body: body
    });
    return response;
}
