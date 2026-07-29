package com.jhora.ai.update

import android.content.Context
import androidx.work.Worker
import androidx.work.WorkerParameters
import com.jhora.ai.notifications.NotificationHelper
import com.jhora.ai.utils.Logger
import java.io.File
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL

class OtaUpdateWorker(context: Context, params: WorkerParameters) : Worker(context, params) {

    companion object {
        const val KEY_APK_URL = "apk_url"
        private const val NOTIFICATION_ID = 999
    }

    override fun doWork(): Result {
        val apkUrl = inputData.getString(KEY_APK_URL) ?: return Result.failure()
        Logger.d("Starting background download of APK: $apkUrl")

        NotificationHelper.showNotification(
            applicationContext,
            NOTIFICATION_ID,
            "Downloading Update",
            "JHoraAI is downloading the latest update...",
            true
        )

        try {
            val url = URL(apkUrl)
            val connection = url.openConnection() as HttpURLConnection
            connection.connect()

            if (connection.responseCode != HttpURLConnection.HTTP_OK) {
                Logger.e("Server returned HTTP ${connection.responseCode}")
                return Result.failure()
            }

            val fileLength = connection.contentLength
            val input = connection.inputStream
            
            val updateDir = File(applicationContext.cacheDir, "updates")
            if (!updateDir.exists()) updateDir.mkdirs()
            val apkFile = File(updateDir, "jhora_update.apk")
            if (apkFile.exists()) apkFile.delete()

            val output = FileOutputStream(apkFile)

            val data = ByteArray(4096)
            var total: Long = 0
            var count: Int
            while (input.read(data).also { count = it } != -1) {
                total += count
                output.write(data, 0, count)
                
                // Optional progress updating in status bar
                if (fileLength > 0) {
                    val progress = (total * 100 / fileLength).toInt()
                    if (progress % 10 == 0) {
                        NotificationHelper.showNotification(
                            applicationContext,
                            NOTIFICATION_ID,
                            "Downloading Update",
                            "Progress: $progress%",
                            true
                        )
                    }
                }
            }

            output.flush()
            output.close()
            input.close()

            Logger.d("Background download finished. File size: ${apkFile.length()} bytes")

            NotificationHelper.showNotification(
                applicationContext,
                NOTIFICATION_ID,
                "Download Complete",
                "Click to install JHoraAI update",
                false
            )

            // Trigger actual install
            OtaUpdateManager.installApk(applicationContext, apkFile)

            return Result.success()
        } catch (e: Exception) {
            Logger.e("Failed to download APK in background", e)
            NotificationHelper.showNotification(
                applicationContext,
                NOTIFICATION_ID,
                "Download Failed",
                "Failed to download JHoraAI update",
                false
            )
            return Result.failure()
        }
    }
}
