<template>
  <b-container>
    <b-row align-h="center" align-content="center">
      <b-col>
        <b-row align-v="center">
          <b-col sm="2" lg="1" class="d-none d-sm-block">
            <b-img src="@/assets/logo.png" alt="logo" fluid></b-img>
          </b-col>
          <b-col>
            <h3 class="my-5 text-center">Youtube Playlist Calculator</h3>
          </b-col>
        </b-row>
        <hr />
        <b-input-group prepend="URL" class="my-5">
          <b-form-input
            aria-label="Playlist URL"
            id="playlist-url"
            v-model="playlistUrl"
            placeholder="https://www.youtube.com/playlist?list=PL6rBC_87VKs76V9Vc0s44Gg_Q6qObZrFY"
          ></b-form-input>

          <b-input-group-append>
            <b-button
              :disabled="playlistId === undefined"
              @click="goCalc"
              variant="outline-danger"
            >Go</b-button>
          </b-input-group-append>
        </b-input-group>
      </b-col>
    </b-row>
    <hr />
    <transition-group name="fade" appear mode="in-out" @before-leave="beforeLeave">
      <b-row v-if="totalDuration.seconds != 0" key="duration">
        <b-col>
          <b-card header="Total Playlist Duration" class="text-center mb-3">
            <b-card-text>{{ totalDuration.string }}</b-card-text>
          </b-card>
          <hr />
        </b-col>
      </b-row>
      <b-row v-else-if="loading" class="text-center" key="loading">
        <b-col>
          <b-spinner variant="danger" type="grow" label="Loading"></b-spinner>
          <hr />
        </b-col>
      </b-row>
      <b-row v-else class="text-center" key="info">
        <b-col>
          <div class="alert alert-success" role="alert">
            <h4 class="alert-heading mb-4">Hey!</h4>
            <p>This app helps you to calculate the total duration of a YouTube playlist.</p>
            <p>Just paste the URL above and hit Go.</p>
            <hr />
            <b-row align-v="center">
              <b-col cols="1">
                <a href="http://github.com/srijans38/youtube-playlist-calculator" class="text-dark">
                  Source
                </a>
              </b-col>
              <b-col>
                <p class="mb-0 mr-3 text-right">
                  Made by
                  <a href="http://github.com/srijans38" class="text-dark">Srijan Sharma</a>.
                </p>
              </b-col>
            </b-row>
          </div>
          <hr />
        </b-col>
      </b-row>
    </transition-group>
    <transition name="list">
      <b-row v-if="playlistTitle.length > 0" class="text-center">
        <b-col class="text-center" sm="12">
          <h3 class="my-4">{{ playlistTitle }}</h3>
          <p class="text-truncate mx-5">{{ playlistDesc }}</p>
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
import {
  getPlaylistDataAPI,
  getVideoDurationAPI,
  getPlaylistInfoAPI
} from "@/api";
import humanizeDuration from "humanize-duration";

export default {
  name: "Home",
  data() {
    return {
      playlistTitle: "",
      playlistDesc: "",
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
      return require("@/assets/not-found.png");
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
      };
    }
  },
  methods: {
    humanizeDuration(duration) {
      return humanizeDuration(duration * 1000);
    },
    async getVideoDuration() {
      //Get video resource from the API

      //Chunking the videoIds array; TODO : could be done in one step
      this.getChunkedVideoIds();

      var results = await getVideoDurationAPI(this.chunkedVideoIds);

      //Setting durations and hiding loading anim
      this.durations = Object.assign({}, this.durations, results);
      this.loading = false;
    },
    async getPlaylistData() {
      //Get playlistItems resource from the API

      //Destructuring needed resources from the response
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

        //handling if a thumbnail is not returned in case of a private video
        var url;
        if (!thumbnails.medium) {
          url = this.notFoundImg;
        } else {
          url = thumbnails.medium.url;
        }

        //setting state for playlists and videoIds
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

      //setting nextPageToken for pagination
      this.nextPageToken = nextPageToken;
    },
    getChunkedVideoIds() {
      //Dividing the videoIds array into chunks of 50 each for API limit
      var results = [];
      var arr = this.videoIds;
      while (arr.length) {
        results.push(arr.splice(0, 50));
      }
      this.chunkedVideoIds = results;
    },
    parseURL(url) {
      //Method to parse the PlaylistId attrib from the URL
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
    async goCalc() {
      //Onclick handler for Go button; resets vars and calls funcs
      this.loading = true;
      this.playlistItems = [];
      this.nextPageToken = "";
      this.durations = Object.assign({}, {});
      const { title, description } = await getPlaylistInfoAPI(this.playlistId);
      this.playlistTitle = title;
      this.playlistDesc = description;
      while (this.nextPageToken || this.nextPageToken == "") {
        //Handling API Pagination
        await this.getPlaylistData();
      }
      await this.getVideoDuration();
    },
    beforeLeave(el) {
      const { marginLeft, marginTop, width, height } = window.getComputedStyle(
        el
      );
      el.style.left = `${el.offsetLeft - parseFloat(marginLeft, 10)}px`;
      el.style.top = `${el.offsetTop - parseFloat(marginTop, 10)}px`;
      el.style.width = width;
      el.style.height = height;
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@600&display=swap");

h3 {
  font-family: "Montserrat";
}
.list-enter-active,
.list-leave-active {
  transition: all 1s;
}
.list-enter, .list-leave-to /* .list-leave-active below version 2.1.8 */ {
  opacity: 0;
  transform: translateY(30px);
}

.fade-enter-active,
.fade-leave-active {
  transition: all 2s;
}

.fade-leave-active {
  position: absolute;
}

.fade-enter, .fade-leave-to /* .list-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
