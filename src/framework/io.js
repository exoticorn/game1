export default {
    load: function(url, responseType) {
        return new Promise(function(resolve, reject) {
            let request = new XMLHttpRequest();
            request.open('GET', url);
            request.onreadystatechange = function() {
                if(request.readyState === 4) {
                    if(request.status !== 200) {
                        reject(request.statusText);
                    } else {
                        resolve(request.response);
                    }
                }
            };
            request.responseType = responseType || '';
            request.send();
        });
    },
    error: function(msg) {
        let e = document.createElement('pre');
        e.className = 'error';
        e.appendChild(document.createTextNode(msg));
        document.body.appendChild(e);
        throw msg;
    }
};
