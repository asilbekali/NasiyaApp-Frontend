import axios from "axios";
import { Cookies } from "react-cookie";

const cookies = new Cookies();

export const instance = () => {
    const token = cookies.get("token");
    return axios.create({
        baseURL: "http://13.233.230.148/",
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });
};
