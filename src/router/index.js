import Vue from 'vue';
import Router from 'vue-router';

import Home from '@/components/Home';
import GameBoard from '@/components/GameBoard';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      component: Home,
    },
    {
      path: '/game',
      component: GameBoard,
    },
  ],
});
