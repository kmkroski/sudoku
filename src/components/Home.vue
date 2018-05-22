<template>
  <div class="home">
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <router-link class="navbar-brand" to="/">
        <i class="icon ion-md-apps mr-3 ml-2"></i>
        Sudoku
      </router-link>
    </nav>

    <div class="container p-4">
      <div v-if="this.$localStorage.get('game')">
        <button
          class="btn btn-block btn-lg btn-link text-success mb-3"
          @click="goToGame"
        >
          Resume
          {{ ['Easy', 'Medium', 'Hard', 'Insane'][this.$localStorage.get('level') - 1] }}
          Game
        </button>

        <hr>
      </div>

      <button
        class="btn btn-block btn-lg btn-link mb-3"
        @click="setupGame(1)"
      >
        Easy
      </button>

      <button
        class="btn btn-block btn-lg btn-link mb-3"
        @click="setupGame(2)"
      >
        Medium
      </button>

      <button
        class="btn btn-block btn-lg btn-link mb-3"
        @click="setupGame(3)"
      >
        Hard
      </button>

      <button
        class="btn btn-block btn-lg btn-link mb-3"
        @click="setupGame(4)"
      >
        Insane
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  methods: {
    goToGame() {
      this.$router.push('/game');
    },
    setupGame(level) {
      this.$localStorage.remove('game');
      this.$localStorage.set('level', level);
      this.goToGame();
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
