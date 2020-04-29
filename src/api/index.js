import axios from "axios";

var key = process.env.VUE_APP_GOOGLE;
var url = `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=PLdTodMosi-BwEwlzjN6EyS1vwGXFo-UlK&part=snippet&key=${key}&fields=items(snippet(publishedAt,title,description,thumbnails(medium),position,resourceId(videoId)))&maxResults=50`

export const getPlaylistData = async () => {
    try {
        const response = await axios.get(url);
        return response;
    } catch (error) {
        console.log(error);
    }
}