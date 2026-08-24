import { createApp } from 'vue'
import './assets/main.css'
import App from './App.vue'
import { router } from './presentation/router'
import { DIContainer } from './infrastructure/di/container'

const app = createApp(App)

// Install Dependency Injection Container
DIContainer.install(app)

// Install Vue Router
app.use(router)

app.mount('#app')
