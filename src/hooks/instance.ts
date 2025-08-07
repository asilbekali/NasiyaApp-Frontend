import axios from "axios";
import { Cookies } from "react-cookie";

const cookies = new Cookies();

export const instance = () => {
    const token = cookies.get("token");
    return axios.create({
        baseURL: "http://18.159.45.32/",
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });
};
