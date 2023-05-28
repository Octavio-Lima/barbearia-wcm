type Methods = 'post' | 'put' | 'delete' | 'get';

export async function MakeRequest(url: string, method: Methods, body?: string, form = false) {
    let headers = {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRFToken': ''
    }

    if (form) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    if (method == 'post' || method == 'put' || method == 'delete') {
        const csrf = (document.querySelector('[name=csrfmiddlewaretoken]')! as HTMLInputElement)?.value;
        headers['X-CSRFToken'] = csrf;
    }

    const response = await fetch(url, {
        method: method,
        headers: headers,
        body: body
    });
    
    return response
}