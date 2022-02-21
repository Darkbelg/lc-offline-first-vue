<template>
  <div class="flex w-screen h-screen text-gray-700">
    <div v-if="isOffline" class="absolute top-0 left-0 opacity-75 z-10 w-full text-center py-2 bg-red-300 border-b border-red-700 text-white">
      Sorry, it looks like you are offline
    </div>
    <sidebar></sidebar>
    <editor v-if="Object.keys(activeNote).length"></editor>
    <notes v-else></notes>
  </div>
</template>

<script>
import Sidebar from "@/components/Sidebar";
import Editor from "@/components/Editor";
import Notes from "@/components/Notes";

export default {
  name: 'App',
  components: {
    Sidebar,
    Editor,
    Notes
  },
  mounted(){
    window.addEventListener('offline', () => {
      this.$store.commit('updateIsOffline', true);
    });
    window.addEventListener('online', () => {
      this.$store.commit('updateIsOffline', false);

      // sync up a user's data with an external api
      this.syncUserData();
    });
  },
  beforeUnmount() {
    this.$store.state.dispatch('destroyEditor');
  },
  methods: {
    syncUserData(){
      if (this.isOffline){
        return 'updating';
      }
    }
  },
  computed: {
    activeNote(){
      return this.$store.state.activeNote;
    },
    isOffline(){
      return this.$store.state.isOffline;
    }
  }
}
</script>
