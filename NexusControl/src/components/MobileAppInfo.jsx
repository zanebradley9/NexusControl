import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Download, Globe } from "lucide-react";

export default function MobileAppInfo() {
  return (
    <Card className="literary-shadow bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
      <CardHeader>
        <CardTitle className="literary-text flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Mobile Access 📱
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white p-4 rounded-lg border border-indigo-200">
          <h4 className="font-bold text-indigo-900 mb-2">Access Anywhere</h4>
          <p className="text-sm text-indigo-700 mb-3">
            BookStudio 2.0 works perfectly on your phone's browser! No app download needed.
          </p>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600" />
              <span className="text-indigo-800">Open in Chrome, Safari, or any browser</span>
            </div>
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-indigo-600" />
              <span className="text-indigo-800">Save to home screen for app-like experience</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-indigo-600" />
              <span className="text-indigo-800">Fully responsive on all devices</span>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
          <p className="text-xs text-purple-700">
            <strong>💡 Tip:</strong> Add BookStudio to your phone's home screen:
            <br />
            📱 iPhone: Safari → Share → "Add to Home Screen"
            <br />
            📱 Android: Chrome → Menu → "Add to Home Screen"
          </p>
        </div>

        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <p className="text-xs text-green-700">
            <strong>🚀 Coming Soon:</strong> Native iOS and Android apps in development! We're working on dedicated mobile apps for an even better experience.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}