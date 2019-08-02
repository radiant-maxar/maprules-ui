var environment = {
    maprules: 'http://localhost:3001'
}
class Auth {
    constructor() {}

    authorized() {
        return fetch(`${environment.maprules}/auth/session`)
            .then((resp) => {
                if (resp.status === 200) {
                    location.replace('/')
                } else if (resp.status === 401) {
                    return this.login();
                } else {
                    throw Error();
                }
            })
    }

    login() {
        return fetch(`${environment.maprules}/auth/login`)
            .then(function(response) {
                if (response.status === 200) {
                    return response.text();
                } else {
                    throw new Error('Unable to login to MapRules');
                }
            })
            .then(function(loginPage) { // login page to login into maprules.
                location.replace(loginPage);
            })
            .catch(function (error) {
                throw error;
            })
    }

    haveParameters(...params) {
        return this.getParameters(...params).length === params.length;
    }

    getParameters(...params) {
        var results = [], tmp = [];
        params.forEach(function(parameterName) {
            location.search.substr(1).split('&').forEach(function (item) {
                tmp = item.split('=');
                if (tmp[0] === parameterName) {
                    results.push(decodeURIComponent(tmp[1]));
                }
            });
        });
        return results;
    }

    verify() {
        const [
            oauth_token,
            oauth_verifier
        ] = this.getParameters('oauth_token', 'oauth_verifier');

        const options = {
            credentials: 'include',
            mode: 'cors',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        return fetch(`${environment.maprules}/auth/verify?oauth_token=${oauth_token}&oauth_verifier=${oauth_verifier}`, options)
            .then(function (resp) {
                if (resp.status !== 200) throw new Error();
                return resp.json()
            })
            .then( function(resp) {
                localStorage.setItem( 'user', JSON.stringify( resp ) );
                let pathname = window.location.pathname;
                location.replace( pathname.substr( 0, pathname.lastIndexOf( '/' ) + 1 ) );
            } )
            .catch( function(err) {
                window.alert( 'Failed to complete oauth handshake. Check console for details & retry.' );
                // clear oauth params.
                window.history.pushState( {}, document.title, window.location.pathname );
            } );
    }
}