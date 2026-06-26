import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, DollarSign, CheckCircle } from "lucide-react";

export default function WithdrawalInstructions() {
  return (
    <Card className="literary-shadow bg-white/80 backdrop-blur-sm border-amber-200">
      <CardHeader>
        <CardTitle className="literary-text flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          How Withdrawals Work
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Current Process (Demo App)
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>You earn money from book sales (100% goes to you!)</li>
            <li>You request withdrawal via Earnings page</li>
            <li>System marks earnings as "withdrawn" in database</li>
            <li>You receive confirmation email</li>
            <li><strong>Admin manually processes payment</strong> to your Cash App/PayPal/Bank</li>
            <li>Money arrives in 2-3 business days</li>
          </ol>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <h3 className="font-bold text-orange-900 mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            For Automated Real Money Transfers
          </h3>
          <div className="space-y-2 text-sm text-orange-800">
            <p>To automatically send real money, you need:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Stripe Connect:</strong> For automated bank/card transfers</li>
              <li><strong>PayPal Payouts API:</strong> For PayPal transfers</li>
              <li><strong>Cash App Business API:</strong> Currently not publicly available</li>
              <li><strong>Banking Compliance:</strong> Licenses, regulations, KYC verification</li>
              <li><strong>Escrow Account:</strong> To hold funds before distribution</li>
            </ul>
            <p className="mt-3 font-semibold">
              💡 Most platforms (Etsy, Gumroad, etc.) use manual or semi-automated payment processing with Stripe/PayPal integration.
            </p>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h3 className="font-bold text-green-900 mb-2">✅ What You Can Do Now</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-green-800 ml-2">
            <li>Set up your payment details in Settings</li>
            <li>Track all your earnings</li>
            <li>Request withdrawals when ready</li>
            <li>Admin manually sends payments to your account</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}