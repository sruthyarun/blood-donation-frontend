
import axios from "axios";

export const currentUser = async () => {
    try {
        const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));

        if (!loggedUser) return;

        const response = await fetch(
            `https://blood-donation-backend-olwl.onrender.com/api/donors/${loggedUser.id}`
        );

        const data = await response.json();

        return data;
    } catch (error) {
        console.error(error);
        return [];
    }
};
