import axios from "axios";

var key = process.env.VUE_APP_GOOGLE;

export const getPlaylistDataAPI = async (listId, nextPageToken) => {
    try {
        var url = `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${listId}&part=snippet&key=${key}&fields=nextPageToken,items(snippet(publishedAt,title,description,thumbnails(medium),position,resourceId(videoId)))&maxResults=50&pageToken=${nextPageToken}`
        const response = await axios.get(url);
        return response;
    } catch (error) {
        console.log(error);
    }
}