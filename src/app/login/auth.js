import { environment } from '../../environments/environment';
// import { fromFetch } from 'rxjs/fetch';
// import { tap, switchMap } from 'rxjs/operators';

export default class Auth {
    constructor() {}

    static authorized() {
        return fetch(`${environment.maprules}/auth/session`, { credentials: 'include' })
            .then((response) => {
                if (response.status === 200) {
                    location.replace('/')
                } else if (response.status == 401) {
                    return;
                } else {
                    throw new Error()
                }
            })
    }

    static login() {
        return fetch(`${environment.maprules}/auth/login`)
            .then(function(response) {
                if (response.status === 200) {
                    return response.text();
                } else {
                    throw Error({ status: response.status })
                }
            })
            .catch(function (error) {
                throw error;
            })
    }

    static haveParameter(...params) {
        return Auth.getParameters(...params).length === params.length;
    }

    static getParameters(...params) {
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

    static verify() {
        const [
            oauth_token,
            oauth_verifier
        ] = Auth.getParameters('oauth_token', 'oauth_verifier');

        return fetch(`${environment.maprules}/auth/verify?oauth_token=${oauth_token}&oauth_verifier=${oauth_verifier}`)
            .then(function (resp) {
                if (resp.status !== 200) throw new Error();
                return resp.json()
            })
    }
}