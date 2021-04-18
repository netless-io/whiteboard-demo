export const getQueryH5Url = () => {
    const query = new URLSearchParams(window.location.search);
    return query.get("h5Url");
}

export const createH5Scenes = (pageNumber: number) => {
    return new Array(pageNumber).fill(1).map((_, index) => ({ name: `${index + 1}` }));
}