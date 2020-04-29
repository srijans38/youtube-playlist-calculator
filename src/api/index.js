import axios from "axios";

var key = process.env.VUE_APP_GOOGLE;

export const getPlaylistDataAPI = async (listId) => {
    try {
        var url = `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${listId}&part=snippet&key=${key}&fields=items(snippet(publishedAt,title,description,thumbnails(medium),position,resourceId(videoId)))&maxResults=50`
        const response = await axios.get(url);
        return response;
    } catch (error) {
        console.log(error);
    }
}