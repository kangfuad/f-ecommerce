import { createApp } from 'vue'
import './assets/main.css'
import App from './App.vue'
import { DIContainer } from './infrastructure/di/container'

const app = createApp(App)

// Install Dependency Injection Container
DIContainer.install(app)

app.mount('#app')
