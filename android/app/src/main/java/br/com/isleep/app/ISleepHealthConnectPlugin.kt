package br.com.isleep.app

import android.content.Intent
import androidx.activity.result.ActivityResult
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.SleepSessionRecord
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.ActivityCallback
import com.getcapacitor.annotation.CapacitorPlugin
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.time.Instant
import java.time.temporal.ChronoUnit

@CapacitorPlugin(name = "ISleepHealthConnect")
class ISleepHealthConnectPlugin : Plugin() {
    private val permissions = setOf(HealthPermission.getReadPermission(SleepSessionRecord::class))
    private fun client() = HealthConnectClient.getOrCreate(context)

    @PluginMethod fun checkAvailability(call: PluginCall) {
        val status = when (HealthConnectClient.getSdkStatus(context)) {
            HealthConnectClient.SDK_AVAILABLE -> "available"
            HealthConnectClient.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED -> "update-required"
            else -> "unavailable"
        }
        call.resolve(JSObject().put("status", status))
    }

    @PluginMethod fun requestPermissions(call: PluginCall) {
        if (HealthConnectClient.getSdkStatus(context) != HealthConnectClient.SDK_AVAILABLE) { call.resolve(JSObject().put("granted", false)); return }
        CoroutineScope(Dispatchers.IO).launch {
            val granted = client().permissionController.getGrantedPermissions()
            if (granted.containsAll(permissions)) { withContext(Dispatchers.Main) { call.resolve(JSObject().put("granted", true)) }; return@launch }
            val contract = PermissionController.createRequestPermissionResultContract()
            val intent: Intent = contract.createIntent(context, permissions)
            withContext(Dispatchers.Main) { startActivityForResult(call, intent, "permissionResult") }
        }
    }

    @ActivityCallback private fun permissionResult(call: PluginCall?, result: ActivityResult) {
        if (call == null) return
        val granted = PermissionController.createRequestPermissionResultContract().parseResult(result.resultCode, result.data)
        call.resolve(JSObject().put("granted", granted.containsAll(permissions)))
    }

    @PluginMethod fun readSleepSessions(call: PluginCall) {
        if (HealthConnectClient.getSdkStatus(context) != HealthConnectClient.SDK_AVAILABLE) { call.reject("Health Connect indisponível"); return }
        val days = call.getInt("days", 14) ?: 14
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val granted = client().permissionController.getGrantedPermissions()
                if (!granted.contains(HealthPermission.getReadPermission(SleepSessionRecord::class))) throw SecurityException("Permissão de sono não concedida")
                val end = Instant.now(); val start = end.minus(days.toLong(), ChronoUnit.DAYS)
                val response = client().readRecords(ReadRecordsRequest(SleepSessionRecord::class, TimeRangeFilter.between(start, end), ascendingOrder = true))
                val rows = JSArray()
                response.records.forEach { record ->
                    val stages = JSArray(); record.stages.forEach { stage -> stages.put(JSObject().put("start", stage.startTime.toString()).put("end", stage.endTime.toString()).put("type", stage.stage)) }
                    rows.put(JSObject().put("externalId", record.metadata.id).put("start", record.startTime.toString()).put("end", record.endTime.toString()).put("title", record.title ?: "").put("sourceName", record.metadata.dataOrigin.packageName).put("stages", stages))
                }
                withContext(Dispatchers.Main) { call.resolve(JSObject().put("sessions", rows)) }
            } catch (error: Exception) { withContext(Dispatchers.Main) { call.reject(error.message ?: "Falha ao ler o sono", error) } }
        }
    }
}
