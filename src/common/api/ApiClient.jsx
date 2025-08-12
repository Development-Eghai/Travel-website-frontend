import axios from "axios";

// export const BACKEND_DOMAIN = import.meta.env.VITE_BACKEND_URL;
export const BACKEND_DOMAIN = "http://localhost:8006";

export const BACKEND_BASE = "/api";

export const APIBaseUrl = axios.create({
    baseURL: `${BACKEND_DOMAIN}${BACKEND_BASE}`,
});

APIBaseUrl.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error?.response?.status === 401) {
            // const state = store.getState();
            // const userId = state?.login?.user_data?.user_id;
            try {
                // await UserLogoutApi({ user_id: userId });
            } catch (logoutError) {
                console.error("Logout failed", logoutError);
            }
            // store.dispatch(UserLogout());
            window.location.href = "/";
        }

        return Promise.reject(error);
    }
);



APIBaseUrl.interceptors.request.use(
    (config) => {
        try {
            // const state = store.getState();
            let token = null;
            // if (state?.login?.isLoggedIn && state?.login?.user_data?.accessToken) {
            //     token = state?.login?.user_data?.accessToken;
            // }
            // config.headers["ngrok-skip-browser-warning"] = `69420`;
            // if (token) {
            //     config.headers["Authorization"] = `Bearer ${token}`;
            // }
            // console.log(config.headers, "config.headers")
        } catch (e) {
            console.error("Error accessing state:", e);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);