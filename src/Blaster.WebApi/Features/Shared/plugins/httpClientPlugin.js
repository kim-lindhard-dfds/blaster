import {HttpClient} from 'httpclient';

const HttpClientPlugin = {
    install(Vue, options) {
        const httpClient = new HttpClient();
        Vue.prototype.$http = httpClient;

        // Check if userManagementPlugin is loaded.
        if (Vue.prototype.isAuthenticated) {
            Vue.prototype.$http.setInterceptRequestHandler(async (req) => {
                return new Promise((resolve, err) => {
                    if (!Vue.prototype.isAuthenticated()) { // Not signed in
                        let result = Vue.prototype.signIn();
                        if (result) {
                            result.then(() => {
                                Vue.prototype.acquireToken(["user.read"])
                                .then(resp => {
                                    req.headers["X-Msal-Auth-Token"] = resp.accessToken;
                                    resolve(req)
                                });
                            })
                        }
                    } else { // Already signed in
                        Vue.prototype.getCachedAccessToken()
                        .then(resp => {
                            if (resp) {
                                req.headers["X-Msal-Auth-Token"] = resp.accessToken;
                                resolve(req)
                            } else { // Acquire new token
                                Vue.prototype.acquireToken(["user.read"])
                                .then(resp => {
                                    req.headers["X-Msal-Auth-Token"] = resp.accessToken;
                                    resolve(req)
                                });
                            }
                        });
                    } 
                });
            });

            if (options) {
                if (options.interceptRequestHandler) {
                    Vue.prototype.$http.setInterceptRequestHandler(options.interceptRequestHandler);
                }
            }
        }
    }
};

export default HttpClientPlugin;