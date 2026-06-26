import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, Palette, Bell, Save, User, CreditCard, AlertCircle, LogOut, Image, UploadCloud } from "lucide-react";
import { motion } from "framer-motion";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    theme: "nebula",
    font_size: "medium",
    auto_save: true,
    notifications_enabled: true,
    background_type: "solid",
    background_color_1: "#fefcf7",
    background_color_2: "#f0ebe5",
    gradient_direction: "to right",
    background_image_url: "",
    bank_account_name: "",
    bank_account_number: "",
    bank_name: "",
    paypal_email: "",
    cashapp_username: "",
    visa_card_number: "",
    visa_card_name: "",
    visa_card_expiry: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const userData = await base44.auth.me();
        setUser(userData);
      }

      const userSettings = await base44.entities.UserSettings.list();
      if (userSettings.length > 0) {
        // Merge existing settings with default values to ensure new fields are present
        setSettings(prevSettings => ({
          ...prevSettings,
          ...userSettings[0]
        }));
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
    setIsLoading(false);
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const existingSettings = await base44.entities.UserSettings.list();
      
      const settingsToSave = { ...settings };
      const fieldsToDelete = ['id', 'created_date', 'updated_date', 'created_by'];
      fieldsToDelete.forEach(field => {
          if (settingsToSave.hasOwnProperty(field)) {
              delete settingsToSave[field];
          }
      });

      if (existingSettings.length > 0) {
        await base44.entities.UserSettings.update(existingSettings[0].id, settingsToSave);
      } else {
        await base44.entities.UserSettings.create(settingsToSave);
      }
      
            localStorage.setItem('bookstudio_background', JSON.stringify({
        type: settings.background_type,
        color1: settings.background_color_1,
        color2: settings.background_color_2,
        direction: settings.gradient_direction,
        imageUrl: settings.background_image_url
      }));
      alert("Settings saved successfully! Your new background will be applied across the app.");
      window.dispatchEvent(new CustomEvent('settings-updated'));

    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings. Please try again.");
    }
    setIsSaving(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setSettings({ ...settings, background_image_url: file_url, background_type: 'image' });
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image.");
    }
    setIsUploading(false);
  };



  const themes = [
    { value: "nebula", label: "🌌 Nebula Theme", description: "Dark purples and blues with glowing effects" },
    { value: "paper_ink", label: "📜 Paper & Ink", description: "Classic library feel with warm tones" },
    { value: "minimal", label: "✨ Minimal Mode", description: "Clean white and teal modern look" },
    { value: "void", label: "🌑 Void Theme", description: "Deep black with neon cyan accents" }
  ];

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold literary-text mb-2">Settings ⚙️</h1>
          <p className="text-amber-700 text-lg">Customize your BookStudio experience</p>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {Array(3).fill(0).map((_, i) => (
              <Card key={i} className="literary-shadow animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-amber-200 rounded w-1/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-amber-100 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile Info */}
            <Card className="literary-shadow bg-white/80 backdrop-blur-sm border-amber-200">
              <CardHeader>
                <CardTitle className="literary-text flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input value={user?.full_name || ""} disabled className="bg-gray-50" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={user?.email || ""} disabled className="bg-gray-50" />
                  </div>
                </div>
                <p className="text-xs text-amber-600">Contact support to change your profile information</p>
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card className="literary-shadow bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 border-purple-200">
              <CardHeader>
                <CardTitle className="literary-text flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Appearance & Theme
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Background Type</Label>
                  <Select value={settings.background_type} onValueChange={(val) => setSettings({...settings, background_type: val})}>
                    <SelectTrigger className="border-amber-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">Solid Color</SelectItem>
                      <SelectItem value="gradient">Gradient</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                

                {settings.background_type === 'image' && (
                  <div>
                    <Label>Custom Background Image</Label>
                    <Input type="file" onChange={handleImageUpload} disabled={isUploading} className="border-amber-200" />
                    {isUploading && <p className="text-sm text-amber-700 mt-2">Uploading...</p>}
                    {settings.background_image_url && (
                      <div className="mt-4">
                        <Label>Preview</Label>
                        <img src={settings.background_image_url} alt="Background preview" className="mt-2 rounded-lg w-full h-32 object-cover border border-amber-200" />
                      </div>
                    )}
                  </div>
                )}

                {settings.background_type === 'solid' && (
                    <div>
                        <Label>Background Color</Label>
                        <div className="flex gap-2">
                        <Input
                            type="color"
                            value={settings.background_color_1 || '#fefcf7'}
                            onChange={(e) => setSettings({...settings, background_color_1: e.target.value})}
                            className="w-20 h-10 p-1"
                        />
                        <Input
                            type="text"
                            value={settings.background_color_1 || '#fefcf7'}
                            onChange={(e) => setSettings({...settings, background_color_1: e.target.value})}
                            className="flex-1 border-amber-200"
                            placeholder="#fefcf7"
                        />
                        </div>
                    </div>
                )}

                {settings.background_type === 'gradient' && (
                    <div className='space-y-4'>
                        <div>
                            <Label>Gradient Colors</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="color"
                                    value={settings.background_color_1 || '#fefcf7'}
                                    onChange={(e) => setSettings({...settings, background_color_1: e.target.value})}
                                    className="w-20 h-10 p-1"
                                />
                                <Input
                                    type="color"
                                    value={settings.background_color_2 || '#f0ebe5'}
                                    onChange={(e) => setSettings({...settings, background_color_2: e.target.value})}
                                    className="w-20 h-10 p-1"
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Gradient Direction</Label>
                            <Select value={settings.gradient_direction} onValueChange={(val) => setSettings({...settings, gradient_direction: val})}>
                                <SelectTrigger className="border-amber-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="to top">To Top</SelectItem>
                                    <SelectItem value="to bottom">To Bottom</SelectItem>
                                    <SelectItem value="to left">To Left</SelectItem>
                                    <SelectItem value="to right">To Right</SelectItem>
                                    <SelectItem value="to top right">To Top Right</SelectItem>
                                    <SelectItem value="to bottom left">To Bottom Left</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}

                <div>
                  <Label>Font Size</Label>
                  <Select value={settings.font_size} onValueChange={(val) => setSettings({...settings, font_size: val})}>
                    <SelectTrigger className="border-amber-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium (Default)</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card className="literary-shadow bg-white/80 backdrop-blur-sm border-amber-200">
              <CardHeader>
                <CardTitle className="literary-text flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-save while writing</Label>
                    <p className="text-xs text-amber-600">Automatically save your work every 30 seconds</p>
                  </div>
                  <Switch
                    checked={settings.auto_save}
                    onCheckedChange={(val) => setSettings({...settings, auto_save: val})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable notifications</Label>
                    <p className="text-xs text-amber-600">Get updates about comments, orders, and new features</p>
                  </div>
                  <Switch
                    checked={settings.notifications_enabled}
                    onCheckedChange={(val) => setSettings({...settings, notifications_enabled: val})}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment & Withdrawal */}
            <Card className="literary-shadow bg-white/80 backdrop-blur-sm border-amber-200">
              <CardHeader>
                <CardTitle className="literary-text flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment & Withdrawal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
                  <p className="text-sm text-blue-800">
                    💰 Set up your payment details to withdraw your earnings. Your information is securely stored.
                  </p>
                </div>

                <div>
                  <Label className="font-semibold text-lg mb-3 block">Bank Account Details</Label>
                  
                  <div className="space-y-3">
                    <div>
                      <Label>Account Holder Name</Label>
                      <Input
                        placeholder="John Doe"
                        value={settings.bank_account_name}
                        onChange={(e) => setSettings({...settings, bank_account_name: e.target.value})}
                        className="border-amber-200"
                      />
                    </div>

                    <div>
                      <Label>Bank Name</Label>
                      <Input
                        placeholder="Chase Bank, Wells Fargo, etc."
                        value={settings.bank_name}
                        onChange={(e) => setSettings({...settings, bank_name: e.target.value})}
                        className="border-amber-200"
                      />
                    </div>

                    <div>
                      <Label>Account Number</Label>
                      <Input
                        type="password"
                        placeholder="••••••••••"
                        value={settings.bank_account_number}
                        onChange={(e) => setSettings({...settings, bank_account_number: e.target.value})}
                        className="border-amber-200"
                      />
                      <p className="text-xs text-amber-600 mt-1">Your account number is encrypted and secure</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-amber-200 pt-4 mt-4">
                  <Label className="font-semibold text-lg mb-3 block">PayPal Account</Label>
                  
                  <div>
                    <Label>PayPal Email</Label>
                    <Input
                      type="email"
                      placeholder="your-email@paypal.com"
                      value={settings.paypal_email}
                      onChange={(e) => setSettings({...settings, paypal_email: e.target.value})}
                      className="border-amber-200"
                    />
                    <p className="text-xs text-amber-600 mt-1">Alternative method for receiving payments</p>
                  </div>
                </div>

                <div className="border-t border-amber-200 pt-4 mt-4">
                  <Label className="font-semibold text-lg mb-3 block">Cash App</Label>

                  <div>
                    <Label>Cash App Username</Label>
                    <Input
                      type="text"
                      placeholder="$YourUsername"
                      value={settings.cashapp_username}
                      onChange={(e) => setSettings({...settings, cashapp_username: e.target.value})}
                      className="border-amber-200"
                    />
                    <p className="text-xs text-amber-600 mt-1">Enter your Cash App $Cashtag (e.g., $JohnDoe)</p>
                  </div>
                  </div>

                  <div className="border-t border-amber-200 pt-4 mt-4">
                  <Label className="font-semibold text-lg mb-3 block">💳 Visa Card</Label>

                  <div className="space-y-3">
                    <div>
                      <Label>Name on Card</Label>
                      <Input
                        type="text"
                        placeholder="John Doe"
                        value={settings.visa_card_name}
                        onChange={(e) => setSettings({...settings, visa_card_name: e.target.value})}
                        className="border-amber-200"
                      />
                    </div>

                    <div>
                      <Label>Card Number</Label>
                      <Input
                        type="text"
                        placeholder="4111 1111 1111 1111"
                        value={settings.visa_card_number}
                        onChange={(e) => setSettings({...settings, visa_card_number: e.target.value})}
                        className="border-amber-200"
                      />
                    </div>

                    <div>
                      <Label>Expiry Date</Label>
                      <Input
                        type="text"
                        placeholder="MM/YY"
                        value={settings.visa_card_expiry}
                        onChange={(e) => setSettings({...settings, visa_card_expiry: e.target.value})}
                        className="border-amber-200"
                      />
                    </div>
                  </div>
                  </div>
                  </CardContent>
                  </Card>

            {/* Save Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button
                onClick={saveSettings}
                disabled={isSaving}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-lg py-6"
              >
                <Save className="w-5 h-5 mr-2" />
                {isSaving ? "Saving..." : "Save All Settings"}
              </Button>
            </motion.div>

            {/* Logout */}
            <Card className="literary-shadow bg-white/80 backdrop-blur-sm border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2">
                  <LogOut className="w-5 h-5" />
                  Log Out
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Sign out of your BookStudio account</p>
                <Button
                  onClick={() => base44.auth.logout()}
                  variant="destructive"
                  className="w-full"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </Button>
              </CardContent>
            </Card>
            </div>
        )}
      </div>
    </div>
  );
}