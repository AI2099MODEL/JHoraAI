package com.jhora.ai.core

import android.app.Application
import com.google.firebase.messaging.FirebaseMessaging
import com.jhora.ai.notifications.NotificationHelper
import com.jhora.ai.utils.Logger

class JHoraApplication : Application() {

    override fun onCreate() {
        super.onCreate()
        
        Logger.i("JHoraAI Application Core Initialized")

        // Create standard Notification Channels
        NotificationHelper.createNotificationChannel(this)

        // Subscribe to standard astrological transits alerts topic
        FirebaseMessaging.getInstance().subscribeToTopic("astrological_transits")
            .addOnCompleteListener { task ->
                if (task.isSuccessful) {
                    Logger.d("Subscribed to astronomical_transits pushes")
                } else {
                    Logger.e("Failed to subscribe to transit pushes", task.exception)
                }
            }
    }
}
