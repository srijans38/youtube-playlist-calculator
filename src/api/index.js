import axios from "axios";
import moment from 'moment';

var key = process.env.VUE_APP_GOOGLE;

export const getPlaylistDataAPI = async (listId, nextPageToken) => {
    try {
        var url = `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${listId}&part=snippet&key=${key}&fields=nextPageToken,items(snippet(publishedAt,title,description,thumbnails(medium),position,resourceId(videoId)))&maxResults=50&pageToken=${nextPageToken}`
        const response = await axios.get(url);
        return response;
    } catch (error) {
        console.error(error);
    }
}

export const getVideoDurationAPI = async (videosIds) => {
    let durations = {};
    try {
        for(var chunk of videosIds) {
            var url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${chunk.join()}&maxResults=50&fields=items(id,contentDetails(duration))&key=${key}`        
            const response = await axios.get(url);
            var { items } = response.data;
            items.map((item) => {
                var { id, contentDetails: { duration }} = item;
                durations[id] = moment.duration(duration).asSeconds();
            });
        }
        return durations;
    } catch (error) {
        console.error(error)       
    }
}