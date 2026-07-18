package com.jhora.ai.download

import android.app.DownloadManager
import android.content.Context
import android.net.Uri
import android.os.Environment
import android.webkit.URLUtil
import android.widget.Toast
import com.jhora.ai.utils.Logger

class AppDownloadManager(private val context: Context) {

    fun downloadFile(url: String, userAgent: String?, contentDisposition: String?, mimeType: String?) {
        try {
            Logger.d("Download started for URL: $url")
            val request = DownloadManager.Request(Uri.parse(url))
            
            // Extract file name
            val fileName = URLUtil.guessFileName(url, contentDisposition, mimeType)
            
            // Set headers and config
            request.addRequestHeader("User-Agent", userAgent)
            request.setDescription("Downloading JHoraAI Chart Document...")
            request.setTitle(fileName)
            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
            request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, fileName)
            
            // Enqueue download
            val manager = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
            manager.enqueue(request)
            
            Toast.makeText(context, "Download started: $fileName", Toast.LENGTH_SHORT).show()
        } catch (e: Exception) {
            Logger.e("Download failed", e)
            Toast.makeText(context, "Download failed: ${e.localizedMessage}", Toast.LENGTH_LONG).show()
        }
    }
}
