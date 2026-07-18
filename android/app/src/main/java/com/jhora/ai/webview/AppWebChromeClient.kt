package com.jhora.ai.webview

import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import android.os.Environment
import android.provider.MediaStore
import android.webkit.GeolocationPermissions
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.widget.Toast
import androidx.core.content.FileProvider
import com.jhora.ai.MainActivity
import com.jhora.ai.utils.Logger
import java.io.File
import java.io.IOException
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class AppWebChromeClient(private val activity: MainActivity) : WebChromeClient() {

    private var cameraPhotoPath: String? = null

    override fun onProgressChanged(view: WebView?, newProgress: Int) {
        super.onProgressChanged(view, newProgress)
        activity.updateProgress(newProgress)
    }

    override fun onGeolocationPermissionsShowPrompt(
        origin: String?,
        callback: GeolocationPermissions.Callback?
    ) {
        Logger.d("onGeolocationPermissionsShowPrompt for origin: $origin")
        // Always grant location permission for the app webview
        callback?.invoke(origin, true, false)
    }

    // Handles standard <input type="file"> file uploads
    override fun onShowFileChooser(
        webView: WebView?,
        filePathCallback: ValueCallback<Array<Uri>>?,
        fileChooserParams: FileChooserParams?
    ): Boolean {
        Logger.d("onShowFileChooser invoked")
        activity.setUploadMessageCallback(filePathCallback)

        // Set up camera capture intent
        var takePictureIntent: Intent? = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
        if (takePictureIntent?.resolveActivity(activity.packageManager) != null) {
            var photoFile: File? = null
            try {
                photoFile = createTempImageFile()
                takePictureIntent.putExtra("PhotoPath", cameraPhotoPath)
            } catch (ex: IOException) {
                Logger.e("Unable to create temporary image file", ex)
            }

            if (photoFile != null) {
                cameraPhotoPath = "file:" + photoFile.absolutePath
                val photoURI = FileProvider.getUriForFile(
                    activity,
                    "${activity.packageName}.fileprovider",
                    photoFile
                )
                takePictureIntent.putExtra(MediaStore.EXTRA_OUTPUT, photoURI)
            } else {
                takePictureIntent = null
            }
        }

        // Set up gallery picker intent
        val contentSelectionIntent = Intent(Intent.ACTION_GET_CONTENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "*/*" // Allow all file types (images, PDFs, documents)
        }

        val intentArray: Array<Intent> = if (takePictureIntent != null) {
            arrayOf(takePictureIntent)
        } else {
            emptyArray()
        }

        val chooserIntent = Intent(Intent.ACTION_CHOOSER).apply {
            putExtra(Intent.EXTRA_INTENT, contentSelectionIntent)
            putExtra(Intent.EXTRA_TITLE, "Select Document or Capture Photo")
            putExtra(Intent.EXTRA_INITIAL_INTENTS, intentArray)
        }

        try {
            activity.startActivityForResult(chooserIntent, MainActivity.FILECHOOSER_RESULTCODE)
        } catch (e: ActivityNotFoundException) {
            activity.setUploadMessageCallback(null)
            Toast.makeText(activity, "Cannot open file chooser", Toast.LENGTH_LONG).show()
            return false
        }

        return true
    }

    @Throws(IOException::class)
    private fun createTempImageFile(): File {
        val timeStamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
        val imageFileName = "JPEG_" + timeStamp + "_"
        val storageDir = activity.getExternalFilesDir(Environment.DIRECTORY_PICTURES)
        return File.createTempFile(
            imageFileName,
            ".jpg",
            storageDir
        )
    }
}
