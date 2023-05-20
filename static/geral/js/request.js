export async function MakeRequest(url, method, body) {
    let headers = {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json'
    }

    if (method == 'post' || method == 'put' || method == 'delete') {
        const csrf = document.querySelector('[name=csrfmiddlewaretoken]').value
        headers['X-CSRFToken'] = csrf
    }

    const response = await fetch(url, {
        method: method,
        headers: headers,
        body: body
    });
    
    return await response.json()
}