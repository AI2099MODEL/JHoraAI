package com.jhora.ai.notifications

import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.jhora.ai.utils.Logger

class FirebaseNotificationService : FirebaseMessagingService() {

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Logger.d("FCM Token refreshed: $token")
        // In production, send token to astrological core backend if needed
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        Logger.d("FCM Message received from: ${remoteMessage.from}")

        val title = remoteMessage.notification?.title ?: remoteMessage.data["title"] ?: "JHoraAI Alert"
        val body = remoteMessage.notification?.body ?: remoteMessage.data["body"] ?: "New transit or dasha calculation completed."

        NotificationHelper.showNotification(
            applicationContext,
            System.currentTimeMillis().toInt(),
            title,
            body
        )
    }
}
