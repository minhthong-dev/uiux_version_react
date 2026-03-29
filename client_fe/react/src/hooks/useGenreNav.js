import { useNavigate } from 'react-router-dom';

/**
 * Hook tùy chỉnh để điều hướng đến trang tìm kiếm với bộ lọc thể loại
 */
const useGenreNav = () => {
    const navigate = useNavigate();

    const goToGenre = (genreId) => {
        if (!genreId) return;
        // Chuyển hướng sang trang search kèm query genre
        navigate(`/search?genre=${genreId}`);
    };

    return { goToGenre };
};

export default useGenreNav;
