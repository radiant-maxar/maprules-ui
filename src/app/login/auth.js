var environment = {
    maprules: 'http://localhost:3001'
}
class Auth {
    constructor() {}

    authorized() {
        // var options = /
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
                    throw Error({ status: response.status })
                }
            })
            .then(function(loginPage) { // login page to login into maprules.
                window.open(loginPage, 'osmLogin',
                    'width=500,height=800,toolbar=no,status=no,menubar=no');

                window.osmCallback = function(error, user) {
                    if (error) {
                        window.console.warn( 'Failed to verify oauth tokens w/ provider:' );
                        window.console.warn( 'XMLHttpRequest.status', error.status || null );
                        window.console.warn( 'XMLHttpRequest.responseText ', error.responseText || null );

                        window.alert( 'Failed to complete oauth handshake. Check console for details & retry.' );
                        window.history.pushState( {}, document.title, window.location.pathname );
                    } else {
                        if (localStorage) {
                            localStorage.setItem('user', JSON.stringify(user))
                        }
                    }
                }
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
                if ( opener ) {
                    window.onbeforeunload = function() {
                        opener.osmCallback( null, resp );
                    };

                    let pathname = opener.location.pathname;

                    // redirect parent
                    opener.location.replace( pathname.substr( 0, pathname.lastIndexOf( '/' ) + 1 ) );

                    // close self
                    window.close();
                } else {
                    localStorage.setItem( 'user', JSON.stringify( resp ) );

                    let pathname = window.location.pathname;

                    window.location.replace( pathname.substr( 0, pathname.lastIndexOf( '/' ) + 1 ) );
                }
            } )
            .catch( function(err) {
                if ( opener ) {
                    window.onbeforeunload = function() {
                        opener.osmCallback( err, null );
                    };

                    self.close();
                } else {
                    window.alert( 'Failed to complete oauth handshake. Check console for details & retry.' );
                    // clear oauth params.
                    window.history.pushState( {}, document.title, window.location.pathname );
                }
            } );
    }
}