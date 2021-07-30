export const loadPlugin = async (url: string) => {
    const result = await fetch(url);
    return result.text();
}