-- Create forecasts table
CREATE TABLE forecasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  provider VARCHAR(255) NOT NULL,
  model VARCHAR(255) NOT NULL,
  forecast_date DATE NOT NULL,
  tokens_input_forecast BIGINT NOT NULL DEFAULT 0,
  tokens_output_forecast BIGINT NOT NULL DEFAULT 0,
  cost_forecast DECIMAL(10, 6) NOT NULL DEFAULT 0,
  forecast_model VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  confidence_level DECIMAL(3, 2) NOT NULL DEFAULT 0.8,
  is_latest BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS on forecasts table
ALTER TABLE forecasts ENABLE ROW LEVEL SECURITY;

-- Create policies for forecasts
CREATE POLICY "Users can view their own forecasts" ON forecasts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own forecasts" ON forecasts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own forecasts" ON forecasts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own forecasts" ON forecasts
  FOR DELETE USING (auth.uid() = user_id);

-- Create thresholds table
CREATE TABLE thresholds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  api_key_id UUID REFERENCES user_api_keys(id) ON DELETE CASCADE,
  provider VARCHAR(255),
  model VARCHAR(255),
  cost_threshold DECIMAL(10, 2) NOT NULL DEFAULT 100.00,
  usage_threshold DECIMAL(3, 2) NOT NULL DEFAULT 0.8,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on thresholds table
ALTER TABLE thresholds ENABLE ROW LEVEL SECURITY;

-- Create policies for thresholds
CREATE POLICY "Users can view their own thresholds" ON thresholds
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own thresholds" ON thresholds
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own thresholds" ON thresholds
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own thresholds" ON thresholds
  FOR DELETE USING (auth.uid() = user_id);

-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  alert_count INT NOT NULL DEFAULT 0,
  alert_types TEXT[] NOT NULL,
  severity VARCHAR(50) NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
  channels TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Create notification_settings table
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channels TEXT[] NOT NULL DEFAULT ARRAY['slack'],
  frequency VARCHAR(50) NOT NULL DEFAULT 'immediate',
  enabled BOOLEAN NOT NULL DEFAULT true,
  slack_webhook_url TEXT,
  email_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on notification_settings table
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for notification_settings
CREATE POLICY "Users can view their own notification settings" ON notification_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification settings" ON notification_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification settings" ON notification_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Create triggers for updating the updated_at timestamp
CREATE TRIGGER update_thresholds_updated_at
BEFORE UPDATE ON thresholds
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at
BEFORE UPDATE ON notification_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 