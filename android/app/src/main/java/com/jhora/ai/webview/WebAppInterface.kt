package com.jhora.ai.webview

import android.content.Context
import android.content.Intent
import android.webkit.JavascriptInterface
import android.widget.Toast
import com.jhora.ai.MainActivity
import com.jhora.ai.notifications.NotificationHelper
import com.jhora.ai.update.OtaUpdateManager
import com.jhora.ai.utils.Logger

class WebAppInterface(private val activity: MainActivity) {

    @JavascriptInterface
    fun showToast(message: String) {
        activity.runOnUiThread {
            Toast.makeText(activity, message, Toast.LENGTH_SHORT).show()
        }
    }

    @JavascriptInterface
    fun showLocalNotification(title: String, message: String) {
        Logger.d("JS Interface showLocalNotification: $title - $message")
        NotificationHelper.showNotification(
            activity,
            System.currentTimeMillis().toInt(),
            title,
            message
        )
    }

    @JavascriptInterface
    fun shareText(text: String, title: String) {
        Logger.d("JS Interface shareText")
        try {
            val intent = Intent(Intent.ACTION_SEND).apply {
                type = "text/plain"
                putExtra(Intent.EXTRA_TEXT, text)
            }
            activity.startActivity(Intent.createChooser(intent, title))
        } catch (e: Exception) {
            Logger.e("Failed to share text", e)
        }
    }

    @JavascriptInterface
    fun triggerOtaUpdateCheck() {
        Logger.d("JS Interface triggerOtaUpdateCheck")
        OtaUpdateManager(activity).checkForUpdates(manual = true)
    }

    @JavascriptInterface
    fun setUserLoggedIn(loggedIn: Boolean) {
        Logger.d("JS Interface setUserLoggedIn: $loggedIn")
        activity.saveUserLoginState(loggedIn)
    }
}
