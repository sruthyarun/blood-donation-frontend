const API_URL = "http://localhost:5000/bloodStocks";

const fetchBloodStocks = async () => {
    try {
        const response = await axios.get(API_URL);
        setInventory(response.data);
    } catch (error) {
        console.error("Failed to fetch blood stocks:", error);
    }
};