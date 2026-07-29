package com.jhora.ai.update

import android.app.AlertDialog
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import androidx.core.content.FileProvider
import androidx.work.*
import com.jhora.ai.BuildConfig
import com.jhora.ai.utils.Logger
import com.jhora.ai.utils.NetworkUtils
import org.json.JSONObject
import java.io.File
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.TimeUnit

class OtaUpdateManager(private val context: Context) {

    fun checkForUpdates(manual: Boolean = false) {
        if (!NetworkUtils.isInternetAvailable(context)) {
            if (manual) {
                showDialog("Offline", "Please connect to the internet to check for updates.")
            }
            return
        }

        Thread {
            try {
                Logger.d("Checking for OTA Updates...")
                val url = URL("https://api.github.com/repos/nitinjain2098/jhora-ai/releases/latest")
                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "GET"
                connection.connectTimeout = 5000
                connection.readTimeout = 5000
                connection.setRequestProperty("Accept", "application/vnd.github.v3+json")

                if (connection.responseCode == 200) {
                    val response = connection.inputStream.bufferedReader().use { it.readText() }
                    val json = JSONObject(response)
                    val latestVersion = json.getString("tag_name").replace("v", "")
                    val currentVersion = "1.0.0" // Standard fallback, matching version in build.gradle

                    Logger.d("Latest Version: $latestVersion, Current Version: $currentVersion")

                    if (isNewerVersion(currentVersion, latestVersion)) {
                        val assets = json.getJSONArray("assets")
                        if (assets.length() > 0) {
                            val apkUrl = assets.getJSONObject(0).getString("browser_download_url")
                            val releaseNotes = json.optString("body", "No release notes available.")
                            
                            // Post back to main thread
                            (context as? android.app.Activity)?.runOnUiThread {
                                showUpdateDialog(latestVersion, releaseNotes, apkUrl)
                            }
                        }
                    } else if (manual) {
                        (context as? android.app.Activity)?.runOnUiThread {
                            showDialog("Up to Date", "JHoraAI Pro is already at the latest version ($currentVersion).")
                        }
                    }
                }
            } catch (e: Exception) {
                Logger.e("OTA update check failed", e)
                if (manual) {
                    (context as? android.app.Activity)?.runOnUiThread {
                        showDialog("Error", "Could not complete update check: ${e.localizedMessage}")
                    }
                }
            }
        }.start()
    }

    private fun isNewerVersion(current: String, latest: String): Boolean {
        try {
            val currParts = current.split(".").map { it.toInt() }
            val lateParts = latest.split(".").map { it.toInt() }
            for (i in 0 until minOf(currParts.size, lateParts.size)) {
                if (lateParts[i] > currParts[i]) return true
                if (lateParts[i] < currParts[i]) return false
            }
            return lateParts.size > currParts.size
        } catch (e: Exception) {
            return latest != current
        }
    }

    private fun showUpdateDialog(version: String, notes: String, apkUrl: String) {
        AlertDialog.Builder(context)
            .setTitle("New Update Available (v$version)")
            .setMessage("Release Notes:\n$notes\n\nWould you like to install the update?")
            .setPositiveButton("Update Now") { _, _ ->
                triggerBackgroundDownload(apkUrl)
            }
            .setNegativeButton("Later", null)
            .show()
    }

    private fun triggerBackgroundDownload(apkUrl: String) {
        val data = Data.Builder()
            .putString(OtaUpdateWorker.KEY_APK_URL, apkUrl)
            .build()

        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()

        val updateRequest = OneTimeWorkRequestBuilder<OtaUpdateWorker>()
            .setInputData(data)
            .setConstraints(constraints)
            .build()

        WorkManager.getInstance(context).enqueueUniqueWork(
            "ota_update_download",
            ExistingWorkPolicy.REPLACE,
            updateRequest
        )
    }

    private fun showDialog(title: String, message: String) {
        AlertDialog.Builder(context)
            .setTitle(title)
            .setMessage(message)
            .setPositiveButton("OK", null)
            .show()
    }

    companion object {
        fun installApk(context: Context, apkFile: File) {
            try {
                Logger.d("Launching APK installer for: ${apkFile.absolutePath}")
                val intent = Intent(Intent.ACTION_VIEW)
                val apkUri: Uri = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                    intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                    FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", apkFile)
                } else {
                    Uri.fromFile(apkFile)
                }
                intent.setDataAndType(apkUri, "application/vnd.android.package-archive")
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                context.startActivity(intent)
            } catch (e: Exception) {
                Logger.e("Failed to install APK", e)
            }
        }
    }
}
