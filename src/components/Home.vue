<template>
  <b-container>
    <b-row align-h="center" align-content="center">
      <b-col class="text-center">
        <h3 class="my-5">Youtube Playlist Calculator</h3>
        <hr>
        <b-input-group prepend="URL" class="my-5">
          <b-form-input v-model="playlistUrl" placeholder="https://www.youtube.com/playlist?list=PL6rBC_87VKs76V9Vc0s44Gg_Q6qObZrFY"></b-form-input>
          <b-input-group-append>
            <b-button @click="parseAndGo" variant="outline-danger">Go</b-button>
          </b-input-group-append>
        </b-input-group>
      </b-col>
    </b-row>
    <hr>
    <transition-group name="list" tag="div" class="row mb-5">
      <b-col class="text-center" sm="12" md="6" lg="4" v-for="item in playlistItems"
      :key="item.position">
          <b-card
          :img-src="item.thumbUrl"
          img-alt="Image"
          img-top
          tag="article"
          style=""
          class="mt-5 mx-2"
          >
            <b-card-title class="text-truncate"> {{item.position+1 + '. ' + item.title }}</b-card-title>
            <b-card-text class="text-truncate">
              {{ item.description }}
            </b-card-text>

            <b-button :href="'https://youtube.com/watch?v='+ item.videoId" variant="primary">Watch Video</b-button>
          </b-card>
      </b-col>
    </transition-group>
  </b-container>
</template>

<script>
import { getPlaylistDataAPI } from "@/api";
export default {
  name: "Home",
  data() {
    return {
      playlistItems: [],
      playlistUrl: '',
    };
  },
  computed: {
    playlistId() {
      var { list } = this.parseURL(this.playlistUrl);
      return list;
    }
  },
  methods: {
    async getPlaylistData() {
      const {
        data: { items }
      } = await getPlaylistDataAPI(this.playlistId);
      items.map((item) => {
        const { 
          snippet : { 
            description, 
            position, 
            publishedAt, 
            resourceId : { videoId }, 
            thumbnails : { 
              medium : { url }
            }, 
            title
          }
        } = item;
        this.playlistItems.push({
          description,
          position,
          publishedAt,
          videoId,
          thumbUrl : url,
          title
        });
      });
    },
    parseURL(url) {
      var parser = document.createElement('a'),
        searchObject = {},
        queries, split, i;
      parser.href = url;
      queries = parser.search.replace(/^\?/, '').split('&');
      for( i = 0; i < queries.length; i++ ) {
        split = queries[i].split('=');
        searchObject[split[0]] = split[1];
      }
      return searchObject;
    },
    parseAndGo() {
      if(this.playlistId) {
        console.log('test');
        this.getPlaylistData();
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .list-enter-active, .list-leave-active {
    transition: all 1s;
  }
  .list-enter, .list-leave-to /* .list-leave-active below version 2.1.8 */ {
    opacity: 0;
    transform: translateY(30px);
  }
</style>
