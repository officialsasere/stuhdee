'use client'

import { getToken, onMessage } from 'firebase/messaging'
import { getFirebaseMessaging } from './config'

export async function requestNotificationPermission(): Promise<string | null> {
  try {
    const permission = await Notification.requestPermission()
    
    if (permission !== 'granted') {
      console.log('Notification permission denied')
      return null
    }

    const messaging = await getFirebaseMessaging()
    if (!messaging) {
      console.log('Messaging not supported')
      return null
    }

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    })

    return token
  } catch (error: unknown) {
    console.error('Error getting notification permission:', error)
    return null
  }
}

export async function onMessageListener() {
  const messaging = await getFirebaseMessaging()
  if (!messaging) return

  onMessage(messaging, (payload) => {
    console.log('Message received:', payload)
    
    // Show notification
    if (payload.notification) {
      new Notification(payload.notification.title || 'Stuhdee', {
        body: payload.notification.body,
        icon: '/icon-192x192.png',
      })
    }
  })
}