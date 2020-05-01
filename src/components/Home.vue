<template>
  <b-container>
    <b-row align-h="center" align-content="center">
      <b-col class="text-center">
        <h3 class="my-5">Youtube Playlist Calculator</h3>
        <hr />
        <b-input-group prepend="URL" class="my-5">
          <b-form-input
            v-model="playlistUrl"
            placeholder="https://www.youtube.com/playlist?list=PL6rBC_87VKs76V9Vc0s44Gg_Q6qObZrFY"
          ></b-form-input>
          <b-input-group-append>
            <b-button :disabled="playlistId === undefined" @click="goCalc" variant="outline-danger">Go</b-button>
          </b-input-group-append>
        </b-input-group>
      </b-col>
    </b-row>
    <hr>
    <transition name="list">
      <b-row v-if="totalDuration.seconds != 0">
        <b-col>
          <b-card header="Total Playlist Duration" class="text-center mb-3">
            <b-card-text>{{ totalDuration.string }}</b-card-text>
          </b-card>
          <hr>
        </b-col>
      </b-row>
      <b-row v-if="loading" class="text-center">
        <b-col>
          <b-spinner variant="danger" type="grow" label="Loading"></b-spinner>
          <hr>
        </b-col>
      </b-row>
    </transition>
    <transition-group name="list" tag="div" class="row mb-5">
      <b-col
        class="text-center"
        sm="12"
        md="6"
        lg="4"
        v-for="item in playlistItems"
        :key="item.position"
      >
        <b-card
          :img-src="item.thumbUrl"
          img-alt="Image"
          img-top
          tag="article"
          style
          class="mt-5 mx-2"
        >
          <b-card-title class="text-truncate">{{item.position+1 + '. ' + item.title }}</b-card-title>
          <b-card-sub-title>{{ humanizeDuration(durations[item.videoId]) }}</b-card-sub-title>
          <b-card-text class="text-truncate">{{ item.description }}</b-card-text>

          <b-button
            :href="'https://youtube.com/watch?v='+ item.videoId"
            variant="primary"
          >Watch Video</b-button>
        </b-card>
      </b-col>
    </transition-group>
  </b-container>
</template>

<script>
import { getPlaylistDataAPI, getVideoDurationAPI } from "@/api";
import humanizeDuration from 'humanize-duration';

export default {
  name: "Home",
  data() {
    return {
      playlistItems: [],
      videoIds: [],
      chunkedVideoIds: [],
      durations: {},
      playlistUrl: "",
      nextPageToken: "",
      loading: false
    };
  },
  computed: {
    playlistId() {
      var { list } = this.parseURL(this.playlistUrl);
      return list;
    },
    notFoundImg() {
      return require('@/assets/not-found.png');
    },
    totalDuration() {
      var seconds = Object.values(this.durations).reduce((a, b) => a + b, 0);
      var string = "";
      if (seconds) {
        var date = new Date(0);
        date.setSeconds(seconds);
        string = humanizeDuration(seconds * 1000);
      }
      return {
        seconds,
        string
      }
    }
  },
  methods: {
    humanizeDuration(duration) {
      return humanizeDuration(duration * 1000);
    },
    async getVideoDuration() {
      this.getChunkedVideoIds();
      var results = await getVideoDurationAPI(this.chunkedVideoIds);
      this.durations = Object.assign({}, this.durations, results);
    },
    async getPlaylistData() {
      const {
        data: { nextPageToken, items }
      } = await getPlaylistDataAPI(this.playlistId, this.nextPageToken);
      items.map(item => {
        const {
          snippet: {
            description,
            position,
            publishedAt,
            resourceId: { videoId },
            thumbnails,
            title
          }
        } = item;
        var url;
        if(!thumbnails) {
          url = this.notFoundImg;
        } else {
          url = thumbnails.medium.url;
        }
        this.playlistItems.push({
          description,
          position,
          publishedAt,
          videoId,
          thumbUrl: url,
          title
        });
        this.videoIds.push(videoId);
      });
      this.nextPageToken = nextPageToken;
    },
    getChunkedVideoIds() {
      var results = [];
      var arr = this.videoIds;
      while (arr.length) {
        results.push(arr.splice(0, 50));
      }
      this.chunkedVideoIds = results;
    },
    parseURL(url) {
      var parser = document.createElement("a"),
        searchObject = {},
        queries,
        split,
        i;
      parser.href = url;
      queries = parser.search.replace(/^\?/, "").split("&");
      for (i = 0; i < queries.length; i++) {
        split = queries[i].split("=");
        searchObject[split[0]] = split[1];
      }
      return searchObject;
    },
    goPlayList() {
      if (this.playlistId) {
        this.getPlaylistData()
      }
    },
    async goCalc() {
      this.loading = true;
      this.playlistItems = [];
      this.nextPageToken = "";
      while(this.nextPageToken || this.nextPageToken == "") {
        await this.getPlaylistData();
      }
      this.getVideoDuration().then(() => {
        this.loading = false;
      });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 1s;
}
.list-enter, .list-leave-to /* .list-leave-active below version 2.1.8 */ {
  opacity: 0;
  transform: translateY(30px);
}
</style>
