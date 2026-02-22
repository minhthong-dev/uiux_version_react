import BASE_API_URL from "../config/configApiUrl";
const GAME_API_URL = `${BASE_API_URL}/games`;
import { manageToken, getInfor } from "../utils/manageToken";

const getAllGames = async () => {
    const response = await fetch(`${GAME_API_URL}/all`, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + manageToken.getToken(),
            "Content-Type": "application/json",
        },
    });
    const data = await response.json();
    return data.data || [];
};
const searchGames = async (encryptedQuery) => {
    const response = await fetch(`${GAME_API_URL}/search?q=${encodeURIComponent(encryptedQuery)}`, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + manageToken.getToken(),
            "Content-Type": "application/json",
        },
    });
    const data = await response.json();
    return data || [];
};
const getGameById = async (gameId) => {
    const response = await fetch(`${GAME_API_URL}/${gameId}`, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + manageToken.getToken(),
            "Content-Type": "application/json",
        },
    });
    const data = await response.json();
    return data || [];
};
const addWishlist = async (gameId) => {
    const response = await fetch(`${GAME_API_URL}/wishlist`, {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + manageToken.getToken(),
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ gameId: gameId, userId: getInfor().id }),
    });
    const data = await response.json();
    return data || [];
};
const removeWishlist = async (gameId) => {
    const response = await fetch(`${GAME_API_URL}/wishlist`, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + manageToken.getToken(),
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ gameId: gameId, userId: getInfor().id }),
    });
    const data = await response.json();
    return data || [];
};
const getWishlist = async () => {
    const response = await fetch(`${GAME_API_URL}/wishlist/${getInfor().id}`, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + manageToken.getToken(),
            "Content-Type": "application/json",
        },
    });
    const data = await response.json();
    return data || [];
};
const isWishlist = async (gameId) => {
    const response = await fetch(`${GAME_API_URL}/wishlist/${gameId}/${getInfor().id}`, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + manageToken.getToken(),
            "Content-Type": "application/json",
        },
    });
    const data = await response.json();
    return data.isWishlist;
};
const like = async (gameId) => {
    const response = await fetch(`${GAME_API_URL}/like`, {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + manageToken.getToken(),
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ gameId: gameId, userId: getInfor().id }),
    });
    const data = await response.json();
    return data || [];
};
const unlike = async (gameId) => {
    const response = await fetch(`${GAME_API_URL}/like`, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + manageToken.getToken(),
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ gameId: gameId, userId: getInfor().id }),
    });
    const data = await response.json();
    return data || [];
};
const getLike = async () => {
    const response = await fetch(`${GAME_API_URL}/like/${getInfor().id}`, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + manageToken.getToken(),
            "Content-Type": "application/json",
        },
    });
    const data = await response.json();
    return data || [];
};
const isLike = async (gameId) => {
    const response = await fetch(`${GAME_API_URL}/like/${gameId}/${getInfor().id}`, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + manageToken.getToken(),
            "Content-Type": "application/json",
        },
    });
    const data = await response.json();
    return data.isWishlist;
};
// const createGame = async (game) => {
//     const response = await fetch(`${GAME_API_URL}/create`, {
//         method: "POST",
//         headers: {
//             "Authorization": "Bearer " + manageToken.getToken(),
//             "Content-Type": "application/json",
//         },
//         body: JSON.stringify(game),
//     });
//     const data = await response.json();
//     return data;
// };

// const uploadCoverImage = async (gameId, file) => {
//     const formData = new FormData();
//     formData.append("gameId", gameId);
//     formData.append("image", file); // Tên field phải khớp với backend (thường là 'image')

//     const response = await fetch(`${GAME_API_URL}/upload-cover`, {
//         method: "POST",
//         headers: {
//             "Authorization": "Bearer " + manageToken.getToken(),
//         },
//         body: formData,
//     });
//     return await response.json();
// };

// const uploadScreenshotImage = async (gameId, files) => {
//     const formData = new FormData();
//     formData.append("gameId", gameId);

//     // Đối với screenshots, backend mong đợi field name 'images' (theo code Backend: req.files.images)
//     for (let i = 0; i < files.length; i++) {
//         formData.append("images", files[i]);
//     }

//     const response = await fetch(`${GAME_API_URL}/upload-screenshot`, {
//         method: "POST",
//         headers: {
//             "Authorization": "Bearer " + manageToken.getToken(),
//         },
//         body: formData,
//     });
//     return await response.json();
// };

// const updateGame = async (gameId, gameData) => {
//     const response = await fetch(`${GAME_API_URL}/${gameId}`, {
//         method: "PUT",
//         headers: {
//             "Authorization": "Bearer " + manageToken.getToken(),
//             "Content-Type": "application/json",
//         },
//         body: JSON.stringify(gameData),
//     });
//     const data = await response.json();
//     return data;
// };
// const deleteGame = async (gameId) => {
//     const response = await fetch(`${GAME_API_URL}/${gameId}`, {
//         method: "DELETE",
//         headers: {
//             "Authorization": "Bearer " + manageToken.getToken(),
//             "Content-Type": "application/json",
//         },
//     });
//     const data = await response.json();
//     return data;
// }
export default {
    getAllGames,
    searchGames,
    getGameById,
    addWishlist,
    removeWishlist,
    getWishlist,
    isWishlist,
    like,
    unlike,
    getLike,
    isLike,
    // createGame,
    // uploadCoverImage,
    // uploadScreenshotImage,
    // updateGame,
    // deleteGame
};