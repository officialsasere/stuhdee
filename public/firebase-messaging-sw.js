importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: "AIzaSyA09zEajym2aLpVIRCsKmZYywX9igRYI50",
  authDomain: "stuhdee-web.firebaseapp.com",
  projectId: "stuhdee-web",
  storageBucket: "stuhdee-web.firebasestorage.app",
  messagingSenderId: "809146264702",
  appId: "1:809146264702:web:d62420372e35dc6c163c2f"
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload)
  
  const notificationTitle = payload.notification.title || 'Stuhdee'
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192x192.png',
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})