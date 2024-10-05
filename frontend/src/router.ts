import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import("./views/user/UserView.vue")
    },
    {
      path: "/admin",
      name: "admin",
      component: () => import("./views/admin/AdminView.vue"),
      children: [
        {
          path: "",
          name: "waiting",
          component: () => import("./views/admin/WaitingSubView.vue")
        },
        {
          path: "accepted",
          name: "accepted",
          component: () => import("./views/admin/AcceptedSubView.vue")
        },
        {
          path: "rejected",
          name: "rejected",
          component: () => import("./views/admin/RejectedSubView.vue")
        }
      ]
    },
    {
      path: "/queue",
      name: "queue",
      component: () => import("./views/queue/QueueView.vue")
    }
  ]
})

export default router
