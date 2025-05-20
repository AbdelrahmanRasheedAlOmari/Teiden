#!/usr/bin/env python3
"""
Forecasting Agent for Teiden Dashboard

This script implements a LangGraph-based agent that forecasts API token usage
based on historical data from Supabase. It uses time series analysis to predict
future usage patterns and stores the forecasts back in Supabase.
"""

import os
import json
import datetime
from typing import Dict, List, Any, Optional, TypedDict, Literal
from dotenv import load_dotenv
import pandas as pd
import numpy as np
from supabase import create_client
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from prophet import Prophet
from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END

# Load environment variables
load_dotenv()
supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_KEY", os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY"))
openai_api_key = os.environ.get("OPENAI_API_KEY")

# Initialize Supabase client
supabase = create_client(supabase_url, supabase_key)

# Define state types
class ForecastState(TypedDict):
    user_id: Optional[str]
    project_id: Optional[str]
    provider: Optional[str]
    usage_data: Optional[List[Dict[str, Any]]]
    forecast_results: Optional[Dict[str, Any]]
    error: Optional[str]
    status: Literal["initialized", "fetching_data", "analyzing_data", "forecasting", "storing_results", "completed", "error"]
    timeframe: Literal["7d", "14d", "30d", "90d"]
    forecast_horizon: Literal["7d", "14d", "30d", "90d"]
    forecast_model: Literal["statistical", "prophet", "ensemble", "llm"]
    models_to_forecast: List[str]
    threshold_alerts: Dict[str, Any]

# Define forecasting methods
def fetch_historical_data(state: ForecastState) -> ForecastState:
    """Fetch historical usage data from Supabase"""
    try:
        # Update state to indicate we're fetching data
        state = state.copy()
        state["status"] = "fetching_data"
        
        # Calculate date range based on timeframe
        end_date = datetime.datetime.now()
        if state["timeframe"] == "7d":
            start_date = end_date - datetime.timedelta(days=7)
        elif state["timeframe"] == "14d":
            start_date = end_date - datetime.timedelta(days=14)
        elif state["timeframe"] == "30d":
            start_date = end_date - datetime.timedelta(days=30)
        else:  # 90d
            start_date = end_date - datetime.timedelta(days=90)
            
        # Format dates for Supabase query
        start_date_str = start_date.isoformat()
        end_date_str = end_date.isoformat()
        
        # Build the query based on provided filters
        query = supabase.table("usage_metrics").select("*").gte("timestamp", start_date_str).lte("timestamp", end_date_str)
        
        # Apply filters if provided
        if state["user_id"]:
            query = query.eq("user_id", state["user_id"])
        if state["project_id"]:
            query = query.eq("project_id", state["project_id"])
        if state["provider"]:
            query = query.eq("provider", state["provider"])
            
        # Execute the query
        response = query.execute()
        
        # Check for errors
        if hasattr(response, 'error') and response.error:
            state["error"] = f"Error fetching data: {response.error.message}"
            state["status"] = "error"
            return state
            
        # Update state with fetched data
        data = response.data
        state["usage_data"] = data
        
        # Extract unique models to forecast if not specified
        if not state["models_to_forecast"]:
            models = set(item["model"] for item in data)
            state["models_to_forecast"] = list(models)
            
        return state
    except Exception as e:
        state["error"] = f"Error in fetch_historical_data: {str(e)}"
        state["status"] = "error"
        return state

def analyze_data(state: ForecastState) -> ForecastState:
    """Analyze the historical data to identify patterns and trends"""
    try:
        state = state.copy()
        state["status"] = "analyzing_data"
        
        if not state["usage_data"]:
            state["error"] = "No historical data available for analysis"
            state["status"] = "error"
            return state
            
        # Convert to pandas DataFrame for analysis
        df = pd.DataFrame(state["usage_data"])
        
        # Convert timestamp to datetime
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df = df.sort_values("timestamp")
        
        # Group by date, model and sum the tokens
        daily_usage = df.groupby([pd.Grouper(key="timestamp", freq="D"), "model"]).agg({
            "tokens_input": "sum",
            "tokens_output": "sum",
            "cost_in_usd": "sum"
        }).reset_index()
        
        # Analyze growth rate for each model
        model_analysis = {}
        for model in state["models_to_forecast"]:
            model_data = daily_usage[daily_usage["model"] == model]
            
            if len(model_data) <= 1:
                model_analysis[model] = {
                    "avg_daily_input_tokens": float(model_data["tokens_input"].mean() if not model_data.empty else 0),
                    "avg_daily_output_tokens": float(model_data["tokens_output"].mean() if not model_data.empty else 0),
                    "avg_daily_cost": float(model_data["cost_in_usd"].mean() if not model_data.empty else 0),
                    "growth_rate": 0.0,
                    "volatility": 0.0,
                    "data_points": len(model_data)
                }
                continue
                
            # Calculate growth rate
            if len(model_data) >= 7:
                # Use 7-day average at beginning and end
                start_avg = model_data.iloc[:7]["tokens_input"].mean() + model_data.iloc[:7]["tokens_output"].mean()
                end_avg = model_data.iloc[-7:]["tokens_input"].mean() + model_data.iloc[-7:]["tokens_output"].mean()
                
                if start_avg > 0:
                    growth_rate = (end_avg / start_avg - 1) * 100
                else:
                    growth_rate = 0
            else:
                # If less than 7 days, use simple start/end comparison
                start_val = model_data.iloc[0]["tokens_input"] + model_data.iloc[0]["tokens_output"]
                end_val = model_data.iloc[-1]["tokens_input"] + model_data.iloc[-1]["tokens_output"]
                
                if start_val > 0:
                    growth_rate = (end_val / start_val - 1) * 100
                else:
                    growth_rate = 0
            
            # Calculate volatility (standard deviation of daily percentage changes)
            total_tokens = model_data["tokens_input"] + model_data["tokens_output"]
            pct_changes = total_tokens.pct_change().dropna()
            volatility = float(pct_changes.std() * 100) if not pct_changes.empty else 0
            
            model_analysis[model] = {
                "avg_daily_input_tokens": float(model_data["tokens_input"].mean()),
                "avg_daily_output_tokens": float(model_data["tokens_output"].mean()),
                "avg_daily_cost": float(model_data["cost_in_usd"].mean()),
                "growth_rate": float(growth_rate),
                "volatility": volatility,
                "data_points": len(model_data),
                "last_7_days_avg_cost": float(model_data.iloc[-7:]["cost_in_usd"].mean() if len(model_data) >= 7 else model_data["cost_in_usd"].mean())
            }
        
        # Update state with analysis results
        state["data_analysis"] = {
            "model_analysis": model_analysis,
            "total_days": len(df["timestamp"].dt.date.unique()),
            "total_api_calls_estimate": int(df["tokens_input"].sum() / 1000),  # rough estimate assuming 1k tokens per call
            "total_cost": float(df["cost_in_usd"].sum())
        }
        
        return state
    except Exception as e:
        state["error"] = f"Error in analyze_data: {str(e)}"
        state["status"] = "error"
        return state

def generate_forecast(state: ForecastState) -> ForecastState:
    """Generate forecasts based on historical data using the selected forecasting model"""
    try:
        state = state.copy()
        state["status"] = "forecasting"
        
        if not state["usage_data"]:
            state["error"] = "No historical data available for forecasting"
            state["status"] = "error"
            return state
            
        # Convert to pandas DataFrame
        df = pd.DataFrame(state["usage_data"])
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        
        # Determine forecast horizon in days
        if state["forecast_horizon"] == "7d":
            horizon_days = 7
        elif state["forecast_horizon"] == "14d":
            horizon_days = 14
        elif state["forecast_horizon"] == "30d":
            horizon_days = 30
        else:  # 90d
            horizon_days = 90
            
        # Generate forecasts for each model
        forecasts = {}
        for model_name in state["models_to_forecast"]:
            model_df = df[df["model"] == model_name].copy()
            
            if model_df.empty:
                continue
                
            # Group by day
            model_df = model_df.groupby(pd.Grouper(key="timestamp", freq="D")).agg({
                "tokens_input": "sum",
                "tokens_output": "sum",
                "cost_in_usd": "sum"
            }).reset_index()
            
            # Fill missing dates with zeros
            date_range = pd.date_range(start=model_df["timestamp"].min(), end=model_df["timestamp"].max(), freq="D")
            model_df = model_df.set_index("timestamp").reindex(date_range, fill_value=0).reset_index().rename(columns={"index": "timestamp"})
            
            # Select forecasting method based on state
            if state["forecast_model"] == "statistical":
                # Use Holt-Winters exponential smoothing
                input_forecast, output_forecast, cost_forecast = statistical_forecast(model_df, horizon_days)
            elif state["forecast_model"] == "prophet":
                # Use Facebook Prophet
                input_forecast, output_forecast, cost_forecast = prophet_forecast(model_df, horizon_days)
            elif state["forecast_model"] == "ensemble":
                # Use ensemble of methods
                input_forecast, output_forecast, cost_forecast = ensemble_forecast(model_df, horizon_days)
            else:  # "llm"
                # Use LLM-based forecasting
                input_forecast, output_forecast, cost_forecast = llm_forecast(model_df, horizon_days, model_name, openai_api_key)
            
            # Store forecasts
            forecast_dates = [
                (datetime.datetime.now() + datetime.timedelta(days=i)).strftime("%Y-%m-%d")
                for i in range(1, horizon_days + 1)
            ]
            
            forecasts[model_name] = {
                "dates": forecast_dates,
                "tokens_input": [float(val) for val in input_forecast],
                "tokens_output": [float(val) for val in output_forecast],
                "cost_in_usd": [float(val) for val in cost_forecast],
                "total_forecast_cost": float(sum(cost_forecast)),
                "total_forecast_tokens": float(sum(input_forecast) + sum(output_forecast))
            }
            
        # Update state with forecasts
        state["forecast_results"] = {
            "forecasts": forecasts,
            "generated_at": datetime.datetime.now().isoformat(),
            "forecast_horizon": state["forecast_horizon"],
            "forecast_model": state["forecast_model"]
        }
        
        return state
    except Exception as e:
        state["error"] = f"Error in generate_forecast: {str(e)}"
        state["status"] = "error"
        return state

def statistical_forecast(df, horizon_days):
    """Generate forecast using Holt-Winters exponential smoothing"""
    # For tokens_input
    input_model = ExponentialSmoothing(
        df["tokens_input"],
        trend="add",
        seasonal="add" if len(df) >= 14 else None,
        seasonal_periods=7 if len(df) >= 14 else None
    ).fit()
    input_forecast = input_model.forecast(horizon_days)
    
    # For tokens_output
    output_model = ExponentialSmoothing(
        df["tokens_output"],
        trend="add",
        seasonal="add" if len(df) >= 14 else None,
        seasonal_periods=7 if len(df) >= 14 else None
    ).fit()
    output_forecast = output_model.forecast(horizon_days)
    
    # For cost_in_usd
    cost_model = ExponentialSmoothing(
        df["cost_in_usd"],
        trend="add",
        seasonal="add" if len(df) >= 14 else None,
        seasonal_periods=7 if len(df) >= 14 else None
    ).fit()
    cost_forecast = cost_model.forecast(horizon_days)
    
    # Ensure non-negative values
    input_forecast = np.maximum(input_forecast, 0)
    output_forecast = np.maximum(output_forecast, 0)
    cost_forecast = np.maximum(cost_forecast, 0)
    
    return input_forecast, output_forecast, cost_forecast

def prophet_forecast(df, horizon_days):
    """Generate forecast using Facebook Prophet"""
    # Prepare dataframes in Prophet format
    prophet_input_df = df[["timestamp", "tokens_input"]].rename(columns={"timestamp": "ds", "tokens_input": "y"})
    prophet_output_df = df[["timestamp", "tokens_output"]].rename(columns={"timestamp": "ds", "tokens_output": "y"})
    prophet_cost_df = df[["timestamp", "cost_in_usd"]].rename(columns={"timestamp": "ds", "cost_in_usd": "y"})
    
    # Fit Prophet models and generate forecasts
    input_model = Prophet(daily_seasonality=True).fit(prophet_input_df)
    output_model = Prophet(daily_seasonality=True).fit(prophet_output_df)
    cost_model = Prophet(daily_seasonality=True).fit(prophet_cost_df)
    
    # Make forecasts
    input_future = input_model.make_future_dataframe(periods=horizon_days)
    output_future = output_model.make_future_dataframe(periods=horizon_days)
    cost_future = cost_model.make_future_dataframe(periods=horizon_days)
    
    input_forecast = input_model.predict(input_future)
    output_forecast = output_model.predict(output_future)
    cost_forecast = cost_model.predict(cost_future)
    
    # Extract just the forecast values for new dates
    input_values = input_forecast["yhat"].iloc[-horizon_days:].values
    output_values = output_forecast["yhat"].iloc[-horizon_days:].values
    cost_values = cost_forecast["yhat"].iloc[-horizon_days:].values
    
    # Ensure non-negative values
    input_values = np.maximum(input_values, 0)
    output_values = np.maximum(output_values, 0)
    cost_values = np.maximum(cost_values, 0)
    
    return input_values, output_values, cost_values

def ensemble_forecast(df, horizon_days):
    """Generate forecast using an ensemble of methods"""
    # Get forecasts from multiple methods
    statistical_input, statistical_output, statistical_cost = statistical_forecast(df, horizon_days)
    
    try:
        prophet_input, prophet_output, prophet_cost = prophet_forecast(df, horizon_days)
    except:
        # If Prophet fails, use only statistical
        return statistical_input, statistical_output, statistical_cost
    
    # Simple average ensemble
    input_forecast = (statistical_input + prophet_input) / 2
    output_forecast = (statistical_output + prophet_output) / 2
    cost_forecast = (statistical_cost + prophet_cost) / 2
    
    return input_forecast, output_forecast, cost_forecast

def llm_forecast(df, horizon_days, model_name, openai_api_key):
    """Use LLM to generate forecasts based on historical data and trends"""
    # Last 14 days of data for context (or all if less than 14 days)
    context_df = df.tail(min(14, len(df)))
    
    # Calculate basic statistics
    avg_input = context_df["tokens_input"].mean()
    avg_output = context_df["tokens_output"].mean()
    avg_cost = context_df["cost_in_usd"].mean()
    
    # Calculate trend
    if len(context_df) > 3:
        input_trend = (context_df["tokens_input"].iloc[-1] / context_df["tokens_input"].iloc[0] - 1) * 100 if context_df["tokens_input"].iloc[0] > 0 else 0
        output_trend = (context_df["tokens_output"].iloc[-1] / context_df["tokens_output"].iloc[0] - 1) * 100 if context_df["tokens_output"].iloc[0] > 0 else 0
        cost_trend = (context_df["cost_in_usd"].iloc[-1] / context_df["cost_in_usd"].iloc[0] - 1) * 100 if context_df["cost_in_usd"].iloc[0] > 0 else 0
    else:
        input_trend = output_trend = cost_trend = 0
    
    # Format data for the LLM
    daily_data = context_df.to_dict(orient="records")
    formatted_data = "\n".join([
        f"Date: {row['timestamp'].strftime('%Y-%m-%d')}, Input Tokens: {row['tokens_input']:.1f}, Output Tokens: {row['tokens_output']:.1f}, Cost: ${row['cost_in_usd']:.2f}"
        for row in daily_data
    ])
    
    # Create prompt for the LLM
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are an expert AI data scientist specializing in API usage forecasting.
        You're going to forecast future daily API usage based on historical data.
        Give your answer ONLY as a JSON array of dictionaries, with each dictionary containing
        'input_tokens', 'output_tokens', and 'cost_in_usd' for each future day.
        No explanation or other text, just the JSON. Ensure values are reasonable and follow trends."""),
        
        ("user", f"""
        I need a forecast for API usage of the '{model_name}' model for the next {horizon_days} days.
        
        Here is the recent daily usage data:
        {formatted_data}
        
        Summary statistics:
        - Average daily input tokens: {avg_input:.1f}
        - Average daily output tokens: {avg_output:.1f}
        - Average daily cost: ${avg_cost:.2f}
        - Input tokens trend: {input_trend:.1f}% change
        - Output tokens trend: {output_trend:.1f}% change
        - Cost trend: {cost_trend:.1f}% change
        
        Based on this data, forecast the next {horizon_days} days of usage as a JSON array.
        Each element should be a dictionary with keys 'input_tokens', 'output_tokens', and 'cost_in_usd'.
        Factor in day-of-week patterns if they exist. Be realistic with your forecasts.
        """
        )
    ])
    
    # Generate forecast using LLM
    llm = ChatOpenAI(temperature=0, api_key=openai_api_key)
    response = llm.invoke(prompt)
    
    try:
        # Parse the response
        forecast_data = json.loads(response.content)
        
        # Extract forecast values
        input_forecast = np.array([day["input_tokens"] for day in forecast_data])
        output_forecast = np.array([day["output_tokens"] for day in forecast_data])
        cost_forecast = np.array([day["cost_in_usd"] for day in forecast_data])
        
        # Truncate or pad to match horizon_days
        if len(input_forecast) > horizon_days:
            input_forecast = input_forecast[:horizon_days]
            output_forecast = output_forecast[:horizon_days]
            cost_forecast = cost_forecast[:horizon_days]
        elif len(input_forecast) < horizon_days:
            # Pad with the last value repeated
            input_forecast = np.pad(input_forecast, (0, horizon_days - len(input_forecast)), 'edge')
            output_forecast = np.pad(output_forecast, (0, horizon_days - len(output_forecast)), 'edge')
            cost_forecast = np.pad(cost_forecast, (0, horizon_days - len(cost_forecast)), 'edge')
        
        return input_forecast, output_forecast, cost_forecast
    except Exception as e:
        # Fallback to statistical forecast if LLM fails
        print(f"LLM forecast failed: {str(e)}. Falling back to statistical method.")
        return statistical_forecast(df, horizon_days)

def store_forecasts(state: ForecastState) -> ForecastState:
    """Store forecast results in Supabase"""
    try:
        state = state.copy()
        state["status"] = "storing_results"
        
        if not state.get("forecast_results"):
            state["error"] = "No forecast results to store"
            state["status"] = "error"
            return state
            
        # Prepare data to store in the forecasts table
        forecast_data = []
        
        for model_name, forecast in state["forecast_results"]["forecasts"].items():
            for i, date_str in enumerate(forecast["dates"]):
                forecast_data.append({
                    "user_id": state["user_id"],
                    "project_id": state["project_id"],
                    "provider": state["provider"],
                    "model": model_name,
                    "forecast_date": date_str,
                    "tokens_input_forecast": forecast["tokens_input"][i],
                    "tokens_output_forecast": forecast["tokens_output"][i],
                    "cost_forecast": forecast["cost_in_usd"][i],
                    "forecast_model": state["forecast_model"],
                    "created_at": datetime.datetime.now().isoformat(),
                    "confidence_level": 0.8,  # Default confidence level
                    "is_latest": True,  # Mark as the latest forecast
                })
        
        if forecast_data:
            # First, mark previous forecasts as not latest
            if state["user_id"]:
                query = supabase.table("forecasts").update({"is_latest": False}).eq("user_id", state["user_id"]).eq("is_latest", True)
                if state["project_id"]:
                    query = query.eq("project_id", state["project_id"])
                query.execute()
            
            # Then, store new forecasts
            supabase.table("forecasts").insert(forecast_data).execute()
        
        # Update state
        state["status"] = "completed"
        return state
    except Exception as e:
        state["error"] = f"Error storing forecasts: {str(e)}"
        state["status"] = "error"
        return state

def check_thresholds(state: ForecastState) -> ForecastState:
    """Check if any forecasted usage exceeds thresholds and prepare alerts"""
    try:
        state = state.copy()
        
        if not state.get("forecast_results") or not state.get("forecast_results", {}).get("forecasts"):
            return state
            
        # Get thresholds from the database or use defaults
        thresholds_query = supabase.table("thresholds").select("*")
        if state["user_id"]:
            thresholds_query = thresholds_query.eq("user_id", state["user_id"])
        
        thresholds_response = thresholds_query.execute()
        thresholds = thresholds_response.data if hasattr(thresholds_response, 'data') else []
        
        # Default thresholds if none are set
        default_threshold = 0.8  # 80% of monthly budget or expected usage
        
        alerts = []
        
        for model_name, forecast in state["forecast_results"]["forecasts"].items():
            total_forecast_cost = forecast["total_forecast_cost"]
            
            # Find the threshold for this model, or use default
            model_threshold = next(
                (t for t in thresholds if t["model"] == model_name), 
                {"cost_threshold": default_threshold * 1000}  # Default $1000 * 80%
            )
            
            # Check if forecast exceeds threshold
            if total_forecast_cost > model_threshold["cost_threshold"]:
                alerts.append({
                    "model": model_name,
                    "forecast_cost": total_forecast_cost,
                    "threshold": model_threshold["cost_threshold"],
                    "percentage": (total_forecast_cost / model_threshold["cost_threshold"]) * 100,
                    "message": f"Forecasted cost for {model_name} exceeds threshold by {(total_forecast_cost / model_threshold['cost_threshold'] - 1) * 100:.1f}%"
                })
        
        # Update state with any alerts
        state["threshold_alerts"] = {
            "alerts": alerts,
            "total_alerts": len(alerts)
        }
        
        return state
    except Exception as e:
        print(f"Error checking thresholds: {str(e)}")
        # Don't fail the whole process for threshold checks
        state["threshold_alerts"] = {"alerts": [], "total_alerts": 0, "error": str(e)}
        return state

# Build the LangGraph
def build_graph():
    """Build the LangGraph for the forecasting agent"""
    workflow = StateGraph(ForecastState)
    
    # Add nodes to the graph
    workflow.add_node("fetch_historical_data", fetch_historical_data)
    workflow.add_node("analyze_data", analyze_data)
    workflow.add_node("generate_forecast", generate_forecast)
    workflow.add_node("check_thresholds", check_thresholds)
    workflow.add_node("store_forecasts", store_forecasts)
    
    # Define the edges
    workflow.add_edge("fetch_historical_data", "analyze_data")
    workflow.add_edge("analyze_data", "generate_forecast")
    workflow.add_edge("generate_forecast", "check_thresholds")
    workflow.add_edge("check_thresholds", "store_forecasts")
    workflow.add_edge("store_forecasts", END)
    
    # Add conditional edges for error handling
    workflow.add_conditional_edges(
        "fetch_historical_data",
        lambda x: "error" if x["status"] == "error" else "analyze_data",
        {
            "error": END,
            "analyze_data": "analyze_data"
        }
    )
    
    workflow.add_conditional_edges(
        "analyze_data",
        lambda x: "error" if x["status"] == "error" else "generate_forecast",
        {
            "error": END,
            "generate_forecast": "generate_forecast"
        }
    )
    
    workflow.add_conditional_edges(
        "generate_forecast",
        lambda x: "error" if x["status"] == "error" else "check_thresholds",
        {
            "error": END,
            "check_thresholds": "check_thresholds"
        }
    )
    
    workflow.add_conditional_edges(
        "store_forecasts",
        lambda x: "error" if x["status"] == "error" else END,
        {
            "error": END
        }
    )
    
    # Compile the graph
    return workflow.compile()

def run_forecast(
    user_id: str = None, 
    project_id: str = None, 
    provider: str = None,
    timeframe: str = "30d",
    forecast_horizon: str = "14d",
    forecast_model: str = "ensemble",
    models_to_forecast: List[str] = None
) -> Dict[str, Any]:
    """Run the forecasting agent with the given parameters"""
    # Initialize state
    state = ForecastState(
        user_id=user_id,
        project_id=project_id,
        provider=provider,
        usage_data=None,
        forecast_results=None,
        error=None,
        status="initialized",
        timeframe=timeframe,
        forecast_horizon=forecast_horizon,
        forecast_model=forecast_model,
        models_to_forecast=models_to_forecast or [],
        threshold_alerts={}
    )
    
    # Build and run the graph
    graph = build_graph()
    result = graph.invoke(state)
    
    # Return the relevant portions of the result
    if result["status"] == "error":
        return {
            "success": False,
            "error": result["error"],
            "status": result["status"]
        }
    else:
        return {
            "success": True,
            "status": result["status"],
            "forecasts": result.get("forecast_results", {}).get("forecasts", {}),
            "data_analysis": result.get("data_analysis", {}),
            "threshold_alerts": result.get("threshold_alerts", {})
        }

if __name__ == "__main__":
    # Example usage
    result = run_forecast(
        timeframe="30d",
        forecast_horizon="14d",
        forecast_model="ensemble"
    )
    print(json.dumps(result, indent=2)) 