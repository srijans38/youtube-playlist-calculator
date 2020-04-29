<template>
  <b-container>
    <b-row align-h="center" align-content="center">
      <b-col class="text-center">
        <h3 class="my-5">Youtube Playlist Calculator</h3>
        <hr>
        <b-button class="my-5" @click="getPlaylistData">Test</b-button>
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
            <b-card-title class="text-truncate"> {{ item.title }}</b-card-title>
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
import { getPlaylistData } from "@/api";
export default {
  name: "Home",
  data() {
    return {
      playlistItems: []
    };
  },
  methods: {
    async getPlaylistData() {
      const {
        data: { items }
      } = await getPlaylistData();
      items.map((item) => {
        const {snippet : {description, position, publishedAt, resourceId : { videoId }, thumbnails : { medium : { url }}, title}} = item;
        this.playlistItems.push({
          description,
          position,
          publishedAt,
          videoId,
          thumbUrl : url,
          title
        });
      });
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
