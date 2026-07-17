package ui.presentation.transit

import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import core.eventengine.transit.TransitSubTab
import core.eventengine.transit.ComprehensiveTransitPayload

@Composable
fun TransitSubTabContainer(
    activePayload: ComprehensiveTransitPayload,
    modifier: Modifier = Modifier
) {
    // 1. Manage Active Sub-Tab Local State Tracking
    var selectedSubTab by remember { mutableStateOf(TransitSubTab.CURRENT_GOCHARA) }
    val horizontalScrollState = rememberScrollState()

    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(Color(0xFFF8F9FA))
    ) {
        // 2. HORIZONTAL SUB-TAB SELECTION BAR (Matches your layout look)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(horizontalScrollState)
                .padding(horizontal = 16.dp, vertical = 12.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            TransitSubTab.values().forEach { subTab ->
                val isSelected = selectedSubTab == subTab
                val label = when (subTab) {
                    TransitSubTab.CURRENT_GOCHARA -> "Current Gochara"
                    TransitSubTab.CURRENT_DASHA -> "Current Dasha"
                    TransitSubTab.CURRENT_TRANSITS -> "Current Transits"
                    TransitSubTab.CURRENT_PANCHANGA -> "Panchanga"
                    TransitSubTab.CURRENT_STRENGTHS -> "Current Strengths"
                    TransitSubTab.CURRENT_YOGAS -> "Current Yogas"
                    TransitSubTab.CURRENT_DOSHAS -> "Current Doshas"
                    TransitSubTab.CURRENT_ASPECTS -> "Current Aspects"
                    TransitSubTab.CURRENT_HOUSE_ACTIVATION -> "House Activation"
                    TransitSubTab.CURRENT_NAKSHATRA -> "Current Nakshatra"
                    TransitSubTab.CURRENT_SENSITIVE_POINTS -> "Sensitive Points"
                    TransitSubTab.CURRENT_EVENTS -> "Planet Ingress"
                    TransitSubTab.TRANSIT_TIMELINE -> "Transit Timeline"
                }

                // Render dynamic, low-allocation clean rounded sub-chips
                Button(
                    onClick = { selectedSubTab = subTab },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isSelected) Color(0xFF6200EE) else Color(0xFFE0E0E0),
                        contentColor = if (isSelected) Color.White else Color(0xFF333333)
                    ),
                    shape = RoundedCornerShape(20.dp),
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 6.dp),
                    modifier = Modifier.height(36.dp)
                ) {
                    Text(
                        text = label,
                        fontSize = 13.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                    )
                }
            }
        }

        Divider(color = Color(0xFFE0E0E0), thickness = 1.dp)

        // 3. DYNAMIC CONTENT RESOLVER VIEW MATRIX (Renders selected sub-tab payload content)
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
                .padding(16.dp)
        ) {
            val currentResult = activePayload.generatedTabResults[selectedSubTab]

            when (selectedSubTab) {
                TransitSubTab.CURRENT_GOCHARA -> {
                    Column {
                        Text("🪐 Active Gochara Positions", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color(0xFF333333))
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Ingress Transaction Hash: ${activePayload.sourceTransactionId}", fontSize = 12.sp, color = Color.Gray)
                        // Ingest your raw longitudes list view mapping coordinates here
                    }
                }
                TransitSubTab.CURRENT_ASPECTS -> {
                    Column {
                        Text("📐 Real-Time Planetary Aspect Geometry", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(8.dp))
                        currentResult?.activeIndicators?.forEach { aspect ->
                            Card(
                                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                                colors = CardDefaults.cardColors(containerColor = Color.White)
                            ) {
                                Text(text = "✅ Active Grid Aspect: ${aspect.replace("_", " ")}", modifier = Modifier.padding(12.dp), fontSize = 14.sp)
                            }
                        }
                    }
                }
                TransitSubTab.CURRENT_SENSITIVE_POINTS -> {
                    Column {
                        Text("💎 Calculated Coordinate Sensitive Lots", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(8.dp))
                        currentResult?.tokenPayload?.forEach { (pointName, pointValue) ->
                            Row(
                                modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(pointName.replace("_", " "), fontWeight = FontWeight.Medium)
                                Text(String.format("%.4f°", pointValue), color = Color(0xFF6200EE), fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
                TransitSubTab.CURRENT_HOUSE_ACTIVATION -> {
                    Column {
                        Text("🏠 Bhava House Activation Intersections", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(8.dp))
                        currentResult?.activeIndicators?.forEach { activation ->
                            Text("• ${activation.replace("_", " ")}", fontSize = 14.sp, modifier = Modifier.padding(vertical = 4.dp))
                        }
                    }
                }
                else -> {
                    // Fallback stub frame for remaining sub-tabs block structures
                    Column(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = "$selectedSubTab Telemetry Feed Staged In Cache Memory", color = Color.Gray, fontSize = 14.sp)
                    }
                }
            }
        }
    }
}
