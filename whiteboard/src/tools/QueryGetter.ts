export const getQueryH5Url = () => {
    const query = new URLSearchParams(window.location.search);
    return query.get("h5Url");
}
