import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const MarketplaceBondsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Regeneration-Backed Bonds</CardTitle>
          <CardDescription>Long-term financial instruments secured by regenerative assets</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="p-4 border-l-4 border-l-green-500 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Regen Bond Structure</h4>
              <p className="text-sm text-green-800">
                Bonds backed by escrow of physical RIUs. Principal returned at maturity; interest paid quarterly. Risk-free asset backed by regenerative assets that only increase in value.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="font-semibold text-sm mb-2">5-Year Regen Bond</p>
                <p className="text-3xl font-bold text-emerald-600">3.8%</p>
                <p className="text-xs text-muted-foreground">Annual coupon</p>
                <p className="text-xs text-slate-700 mt-2">$1M-$100M denominations</p>
              </div>

              <div className="p-4 border rounded-lg">
                <p className="font-semibold text-sm mb-2">10-Year Regen Bond</p>
                <p className="text-3xl font-bold text-emerald-600">5.2%</p>
                <p className="text-xs text-muted-foreground">Annual coupon</p>
                <p className="text-xs text-slate-700 mt-2">$5M-$500M denominations</p>
              </div>

              <div className="p-4 border rounded-lg">
                <p className="font-semibold text-sm mb-2">Perpetual Regen Bond</p>
                <p className="text-3xl font-bold text-emerald-600">6.5%</p>
                <p className="text-xs text-muted-foreground">Annual coupon</p>
                <p className="text-xs text-slate-700 mt-2">Unlimited denominations</p>
              </div>

              <div className="p-4 border rounded-lg">
                <p className="font-semibold text-sm mb-2">Green Impact Bond</p>
                <p className="text-3xl font-bold text-emerald-600">4.5%</p>
                <p className="text-xs text-muted-foreground">Annual coupon</p>
                <p className="text-xs text-slate-700 mt-2">Proceeds fund new projects</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
