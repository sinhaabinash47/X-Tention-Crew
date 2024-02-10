<template>
  <v-app>
    <v-main>
      <!-- <HelloWorld/> -->
      <CreateUsers/>
    </v-main>
  </v-app>
</template>

<script>
import CreateUsers from './components/CreateUsers.vue';
// import ShowList from './components/ShowList.vue'

export default {
  name: 'App',

  components: {
    // HelloWorld,
    CreateUsers
},

  data: () => ({
    //
  }),
}
</script>
