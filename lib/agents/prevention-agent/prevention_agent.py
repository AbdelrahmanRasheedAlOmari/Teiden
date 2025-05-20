#!/usr/bin/env python3
"""
Prevention Agent for Teiden Dashboard

This script implements a LangGraph-based agent that monitors API token usage,
detects when credit balances are low or thresholds are crossed, and sends
notifications to Slack or other configured channels.
"""

import os
import json
import datetime
import time
from typing import Dict, List, Any, Optional, TypedDict, Literal
from dotenv import load_dotenv
import pandas as pd
import requests
from supabase import create_client
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langgraph.graph import StateGraph, END

# Load environment variables
load_dotenv()
supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_KEY", os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY"))
openai_api_key = os.environ.get("OPENAI_API_KEY")
slack_webhook_url = os.environ.get("SLACK_WEBHOOK_URL")

# Initialize Supabase client
supabase = create_client(supabase_url, supabase_key)

# Define state types
class PreventionState(TypedDict):
    user_id: Optional[str]
    project_id: Optional[str]
    provider: Optional[str]
    api_keys: Optional[List[Dict[str, Any]]]
    usage_data: Optional[Dict[str, Any]]
    forecast_data: Optional[Dict[str, Any]]
    thresholds: Optional[Dict[str, Any]]
    alerts: Optional[List[Dict[str, Any]]]
    notification_channels: Optional[List[str]]
    error: Optional[str]
    status: Literal["initialized", "fetching_keys", "fetching_usage", "fetching_forecasts", 
                   "analyzing_thresholds", "sending_notifications", "completed", "error"]
    notification_sent: Optional[bool]
    notification_details: Optional[Dict[str, Any]]

# Define agent methods
def fetch_api_keys(state: PreventionState) -> PreventionState:
    """Fetch API keys from Supabase"""
    try:
        state = state.copy()
        state["status"] = "fetching_keys"
        
        # Build query
        query = supabase.table("user_api_keys").select("*")
        
        # Apply filters if provided
        if state["user_id"]:
            query = query.eq("user_id", state["user_id"])
        if state["project_id"]:
            query = query.eq("project_id", state["project_id"])
        if state["provider"]:
            query = query.eq("provider", state["provider"])
            
        # Execute query
        response = query.execute()
        
        # Check for errors
        if hasattr(response, 'error') and response.error:
            state["error"] = f"Error fetching API keys: {response.error.message}"
            state["status"] = "error"
            return state
            
        # Update state with fetched keys
        state["api_keys"] = response.data
        return state
    except Exception as e:
        state["error"] = f"Error in fetch_api_keys: {str(e)}"
        state["status"] = "error"
        return state

def fetch_usage_data(state: PreventionState) -> PreventionState:
    """Fetch recent usage data for the API keys"""
    try:
        state = state.copy()
        state["status"] = "fetching_usage"
        
        if not state["api_keys"]:
            state["error"] = "No API keys found"
            state["status"] = "error"
            return state
            
        # Calculate date range for recent usage (last 7 days)
        end_date = datetime.datetime.now()
        start_date = end_date - datetime.timedelta(days=7)
        
        # Format dates for query
        start_date_str = start_date.isoformat()
        end_date_str = end_date.isoformat()
        
        # Fetch usage data for each key
        usage_data = {}
        
        for key in state["api_keys"]:
            key_id = key["id"]
            
            # Query usage metrics
            query = supabase.table("usage_metrics") \
                .select("*") \
                .eq("api_key_id", key_id) \
                .gte("timestamp", start_date_str) \
                .lte("timestamp", end_date_str) \
                .order("timestamp", desc=True)
                
            response = query.execute()
            
            if hasattr(response, 'error') and response.error:
                print(f"Error fetching usage data for key {key_id}: {response.error.message}")
                continue
                
            usage_data[key_id] = {
                "metrics": response.data,
                "key_details": key
            }
            
        # Update state with usage data
        state["usage_data"] = usage_data
        return state
    except Exception as e:
        state["error"] = f"Error in fetch_usage_data: {str(e)}"
        state["status"] = "error"
        return state

def fetch_forecasts(state: PreventionState) -> PreventionState:
    """Fetch forecasts to predict upcoming usage and costs"""
    try:
        state = state.copy()
        state["status"] = "fetching_forecasts"
        
        # Fetch the latest forecasts for the relevant API keys/projects
        forecasts = {}
        
        if state["api_keys"]:
            for key in state["api_keys"]:
                key_id = key["id"]
                user_id = key["user_id"]
                project_id = key.get("project_id")
                
                # Build query for forecasts
                query = supabase.table("forecasts") \
                    .select("*") \
                    .eq("user_id", user_id) \
                    .eq("is_latest", True)
                    
                if project_id:
                    query = query.eq("project_id", project_id)
                    
                response = query.execute()
                
                if hasattr(response, 'error') and response.error:
                    print(f"Error fetching forecasts for key {key_id}: {response.error.message}")
                    continue
                    
                if response.data:
                    forecasts[key_id] = response.data
        
        # Update state with forecast data
        state["forecast_data"] = forecasts
        return state
    except Exception as e:
        state["error"] = f"Error in fetch_forecasts: {str(e)}"
        state["status"] = "error"
        return state

def fetch_thresholds(state: PreventionState) -> PreventionState:
    """Fetch configured thresholds for alerts"""
    try:
        state = state.copy()
        
        # Query thresholds table
        query = supabase.table("thresholds").select("*")
        
        if state["user_id"]:
            query = query.eq("user_id", state["user_id"])
            
        response = query.execute()
        
        if hasattr(response, 'error') and response.error:
            print(f"Error fetching thresholds: {response.error.message}")
            # Continue with default thresholds
            thresholds = {}
        else:
            # Convert to dictionary for easier lookup
            thresholds = {item["id"]: item for item in response.data}
            
        # Get notification settings
        settings_query = supabase.table("notification_settings").select("*")
        
        if state["user_id"]:
            settings_query = settings_query.eq("user_id", state["user_id"])
            
        settings_response = settings_query.execute()
        
        if not hasattr(settings_response, 'error') and settings_response.data:
            notification_settings = settings_response.data[0]
        else:
            # Default settings if none found
            notification_settings = {
                "channels": ["slack"],
                "frequency": "immediate",
                "enabled": True
            }
            
        # Update state
        state["thresholds"] = {
            "thresholds": thresholds,
            "notification_settings": notification_settings,
            "default_cost_threshold": 100,  # Default $100
            "default_usage_threshold": 0.8,  # Default 80% of capacity
            "default_balance_threshold": 0.2  # Alert when 20% balance remaining
        }
        
        state["notification_channels"] = notification_settings.get("channels", ["slack"])
        
        return state
    except Exception as e:
        print(f"Error in fetch_thresholds: {str(e)}")
        # Don't fail the whole process, use defaults
        state["thresholds"] = {
            "default_cost_threshold": 100,
            "default_usage_threshold": 0.8,
            "default_balance_threshold": 0.2
        }
        state["notification_channels"] = ["slack"]
        return state

def analyze_thresholds(state: PreventionState) -> PreventionState:
    """Check if any usage metrics have crossed thresholds"""
    try:
        state = state.copy()
        state["status"] = "analyzing_thresholds"
        
        alerts = []
        
        # Get default thresholds
        thresholds = state.get("thresholds", {})
        default_cost_threshold = thresholds.get("default_cost_threshold", 100)
        default_usage_threshold = thresholds.get("default_usage_threshold", 0.8)
        default_balance_threshold = thresholds.get("default_balance_threshold", 0.2)
        
        # First, check current usage against thresholds
        usage_data = state.get("usage_data", {})
        
        for key_id, key_data in usage_data.items():
            metrics = key_data.get("metrics", [])
            key_details = key_data.get("key_details", {})
            
            if not metrics:
                continue
                
            # Calculate aggregated metrics for this key
            total_cost = sum(metric.get("cost_in_usd", 0) for metric in metrics)
            daily_costs = {}
            
            for metric in metrics:
                date = metric.get("timestamp", "").split("T")[0]
                daily_costs[date] = daily_costs.get(date, 0) + metric.get("cost_in_usd", 0)
                
            # Calculate daily average and trend
            if daily_costs:
                dates = sorted(daily_costs.keys())
                if len(dates) >= 2:
                    first_day = dates[0]
                    last_day = dates[-1]
                    daily_trend = daily_costs[last_day] / daily_costs[first_day] if daily_costs[first_day] > 0 else 1
                else:
                    daily_trend = 1
                    
                daily_avg = sum(daily_costs.values()) / len(daily_costs)
            else:
                daily_avg = 0
                daily_trend = 1
                
            # Get model-specific threshold if available
            # This would be extended in a real implementation to check per model/provider
            specific_threshold = next(
                (t for t in thresholds.get("thresholds", {}).values() 
                 if t.get("api_key_id") == key_id),
                None
            )
            
            cost_threshold = specific_threshold.get("cost_threshold", default_cost_threshold) if specific_threshold else default_cost_threshold
            
            # Check if we're approaching the threshold
            if total_cost > cost_threshold * default_usage_threshold:
                alerts.append({
                    "type": "cost_threshold",
                    "severity": "warning" if total_cost < cost_threshold else "critical",
                    "api_key_id": key_id,
                    "api_key_name": key_details.get("name", "Unknown"),
                    "provider": key_details.get("provider", "Unknown"),
                    "current_cost": total_cost,
                    "threshold": cost_threshold,
                    "percentage": (total_cost / cost_threshold) * 100,
                    "daily_avg": daily_avg,
                    "trend": daily_trend,
                    "message": f"API usage cost is {(total_cost / cost_threshold) * 100:.1f}% of threshold (${total_cost:.2f} / ${cost_threshold:.2f})"
                })
                
        # Next, check forecasts against thresholds
        forecast_data = state.get("forecast_data", {})
        
        for key_id, forecasts in forecast_data.items():
            key_details = next((k for k in state.get("api_keys", []) if k["id"] == key_id), {})
            
            # Skip if we don't have the key details
            if not key_details:
                continue
                
            # Get model-specific thresholds
            specific_threshold = next(
                (t for t in thresholds.get("thresholds", {}).values() 
                 if t.get("api_key_id") == key_id),
                None
            )
            
            cost_threshold = specific_threshold.get("cost_threshold", default_cost_threshold) if specific_threshold else default_cost_threshold
            
            # Process forecasts for each model
            for forecast in forecasts:
                model = forecast.get("model", "unknown")
                forecast_date = forecast.get("forecast_date")
                cost_forecast = forecast.get("cost_forecast", 0)
                
                # Skip very small forecasts to reduce noise
                if cost_forecast < 1:
                    continue
                    
                # If forecast is approaching threshold, add an alert
                if cost_forecast > cost_threshold * default_usage_threshold:
                    alerts.append({
                        "type": "forecast_threshold",
                        "severity": "warning" if cost_forecast < cost_threshold else "critical",
                        "api_key_id": key_id,
                        "api_key_name": key_details.get("name", "Unknown"),
                        "provider": key_details.get("provider", "Unknown"),
                        "model": model,
                        "forecast_date": forecast_date,
                        "forecast_cost": cost_forecast,
                        "threshold": cost_threshold,
                        "percentage": (cost_forecast / cost_threshold) * 100,
                        "message": f"Forecasted cost for {model} on {forecast_date} is {(cost_forecast / cost_threshold) * 100:.1f}% of threshold (${cost_forecast:.2f} / ${cost_threshold:.2f})"
                    })
                    
        # Update state with alerts
        state["alerts"] = alerts
        
        return state
    except Exception as e:
        state["error"] = f"Error in analyze_thresholds: {str(e)}"
        # Don't fail the whole process
        print(f"Error analyzing thresholds: {str(e)}")
        state["alerts"] = []
        return state

def send_notifications(state: PreventionState) -> PreventionState:
    """Send notifications for any alerts that were triggered"""
    try:
        state = state.copy()
        state["status"] = "sending_notifications"
        
        alerts = state.get("alerts", [])
        
        if not alerts:
            print("No alerts to send notifications for")
            state["notification_sent"] = False
            state["status"] = "completed"
            return state
            
        # Generate notification content using LLM for better messaging
        notification_content = generate_notification_content(alerts, state.get("api_keys", []))
        
        # Send to configured channels
        notification_channels = state.get("notification_channels", ["slack"])
        notification_details = {}
        
        if "slack" in notification_channels and slack_webhook_url:
            # Send to Slack
            slack_response = send_slack_notification(notification_content)
            notification_details["slack"] = slack_response
            
        if "email" in notification_channels:
            # Email would be implemented here in a real system
            notification_details["email"] = {"status": "not_implemented"}
            
        # Store the notification in the database for tracking
        if alerts:
            now = datetime.datetime.now().isoformat()
            notification_data = {
                "user_id": state.get("user_id"),
                "project_id": state.get("project_id"),
                "content": notification_content["message"],
                "alert_count": len(alerts),
                "alert_types": [alert["type"] for alert in alerts],
                "severity": max([alert["severity"] for alert in alerts], key=lambda x: 0 if x == "warning" else 1),
                "sent_at": now,
                "channels": notification_channels
            }
            
            try:
                supabase.table("notifications").insert([notification_data]).execute()
            except Exception as insert_error:
                print(f"Error storing notification: {str(insert_error)}")
        
        # Update state
        state["notification_sent"] = True
        state["notification_details"] = notification_details
        state["status"] = "completed"
        
        return state
    except Exception as e:
        state["error"] = f"Error in send_notifications: {str(e)}"
        state["status"] = "error"
        return state

def generate_notification_content(alerts, api_keys):
    """Generate clear, actionable notification content using LLM"""
    try:
        # If we have OpenAI API key, use LLM for better content
        if openai_api_key:
            # Format alerts for LLM context
            alert_descriptions = []
            for i, alert in enumerate(alerts):
                # Find key details
                key_details = next((k for k in api_keys if k["id"] == alert["api_key_id"]), {})
                project_id = key_details.get("project_id", "Unknown")
                
                alert_descriptions.append(f"Alert {i+1}: {alert['message']} for {alert['api_key_name']} ({alert['provider']}), Project ID: {project_id}, Severity: {alert['severity']}")
                
            alerts_text = "\n".join(alert_descriptions)
            
            # Create prompt for LLM
            prompt = ChatPromptTemplate.from_messages([
                ("system", """You are an AI assistant that creates clear, concise, and actionable notification messages
                about API usage alerts. Format your response as a JSON object with the following fields:
                - "title": A brief, attention-grabbing title summarizing the situation
                - "message": A detailed message explaining the alerts and what action should be taken
                - "summary": A one-sentence summary for notification previews
                
                The message should be formatted with Slack markdown, using *bold* for emphasis,
                bullet points for multiple alerts, and code blocks for any data or metrics.
                Focus on clarity and actionability."""),
                
                ("user", f"""
                We need to send a notification about the following API usage alerts:
                
                {alerts_text}
                
                There are {len(alerts)} total alerts. Format the notification to be clear,
                concise, and actionable, telling the team what they need to know and what
                action they should consider taking.
                """)
            ])
            
            # Generate content using LLM
            llm = ChatOpenAI(temperature=0.2, api_key=openai_api_key)
            response = llm.invoke(prompt)
            
            try:
                # Parse the response
                content = json.loads(response.content)
                return content
            except:
                # Fallback if parsing fails
                print("Error parsing LLM response, using fallback notification")
        
        # Fallback notification if LLM is not available or fails
        severity_counts = {"warning": 0, "critical": 0}
        for alert in alerts:
            severity_counts[alert["severity"]] += 1
            
        title = f"🚨 ALERT: {len(alerts)} API Usage {'Warnings' if severity_counts['critical'] == 0 else 'Critical Alerts'}"
        
        # Basic message
        message = f"*API Usage Alert*\n\n"
        message += f"We've detected {len(alerts)} alerts related to API usage:\n"
        
        for i, alert in enumerate(alerts[:5]):  # Show first 5 alerts
            message += f"• {alert['message']}\n"
            
        if len(alerts) > 5:
            message += f"• ... and {len(alerts) - 5} more\n"
            
        message += "\n*Recommended Actions:*\n"
        message += "• Review your API usage patterns\n"
        message += "• Consider adjusting your thresholds or budget\n"
        message += "• Check the dashboard for more details\n"
        
        return {
            "title": title,
            "message": message,
            "summary": f"{len(alerts)} API usage alerts detected ({severity_counts['critical']} critical, {severity_counts['warning']} warnings)"
        }
    except Exception as e:
        print(f"Error generating notification content: {str(e)}")
        # Very basic fallback
        return {
            "title": "API Usage Alert",
            "message": f"We've detected {len(alerts)} API usage alerts. Please check the dashboard for details.",
            "summary": f"{len(alerts)} API usage alerts detected"
        }

def send_slack_notification(content):
    """Send a notification to Slack"""
    try:
        if not slack_webhook_url:
            return {"success": False, "error": "Slack webhook URL not configured"}
            
        # Create Slack message payload
        slack_payload = {
            "blocks": [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": content["title"]
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": content["message"]
                    }
                },
                {
                    "type": "divider"
                },
                {
                    "type": "context",
                    "elements": [
                        {
                            "type": "mrkdwn",
                            "text": f"*Teiden Prevention Agent* | {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
                        }
                    ]
                }
            ]
        }
        
        # Send to Slack
        response = requests.post(
            slack_webhook_url,
            json=slack_payload,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            return {"success": True}
        else:
            return {"success": False, "error": f"Error sending to Slack: {response.status_code} {response.text}"}
    except Exception as e:
        return {"success": False, "error": str(e)}

# Build the LangGraph
def build_graph():
    """Build the LangGraph for the prevention agent"""
    workflow = StateGraph(PreventionState)
    
    # Add nodes to the graph
    workflow.add_node("fetch_api_keys", fetch_api_keys)
    workflow.add_node("fetch_usage_data", fetch_usage_data)
    workflow.add_node("fetch_forecasts", fetch_forecasts)
    workflow.add_node("fetch_thresholds", fetch_thresholds)
    workflow.add_node("analyze_thresholds", analyze_thresholds)
    workflow.add_node("send_notifications", send_notifications)
    
    # Define the edges
    workflow.add_edge("fetch_api_keys", "fetch_usage_data")
    workflow.add_edge("fetch_usage_data", "fetch_forecasts")
    workflow.add_edge("fetch_forecasts", "fetch_thresholds")
    workflow.add_edge("fetch_thresholds", "analyze_thresholds")
    workflow.add_edge("analyze_thresholds", "send_notifications")
    workflow.add_edge("send_notifications", END)
    
    # Add conditional edges for error handling
    workflow.add_conditional_edges(
        "fetch_api_keys",
        lambda x: "error" if x["status"] == "error" else "fetch_usage_data",
        {
            "error": END,
            "fetch_usage_data": "fetch_usage_data"
        }
    )
    
    workflow.add_conditional_edges(
        "fetch_usage_data",
        lambda x: "error" if x["status"] == "error" else "fetch_forecasts",
        {
            "error": END,
            "fetch_forecasts": "fetch_forecasts"
        }
    )
    
    # Compile the graph
    return workflow.compile()

def run_prevention_check(
    user_id: str = None,
    project_id: str = None,
    provider: str = None
) -> Dict[str, Any]:
    """Run the prevention agent to check for threshold crossings"""
    # Initialize state
    state = PreventionState(
        user_id=user_id,
        project_id=project_id,
        provider=provider,
        api_keys=None,
        usage_data=None,
        forecast_data=None,
        thresholds=None,
        alerts=None,
        notification_channels=None,
        error=None,
        status="initialized",
        notification_sent=None,
        notification_details=None
    )
    
    # Build and run the graph
    graph = build_graph()
    result = graph.invoke(state)
    
    # Return the relevant portions of the result
    if result.get("status") == "error":
        return {
            "success": False,
            "error": result.get("error"),
            "status": result.get("status")
        }
    else:
        return {
            "success": True,
            "status": result.get("status"),
            "alerts": result.get("alerts", []),
            "notification_sent": result.get("notification_sent", False),
            "notification_details": result.get("notification_details", {})
        }

if __name__ == "__main__":
    # Example usage
    result = run_prevention_check()
    print(json.dumps(result, indent=2)) 