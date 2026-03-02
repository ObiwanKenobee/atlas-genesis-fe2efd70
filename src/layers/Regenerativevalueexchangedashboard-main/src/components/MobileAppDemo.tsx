import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Smartphone, 
  Download, 
  Apple, 
  Play,
  QrCode,
  Zap,
  Shield,
  Bell,
  Wallet,
  TrendingUp,
  Globe,
  Users,
  Leaf,
  CheckCircle2,
  Star,
  MessageCircle,
  Camera,
  Fingerprint,
  Sun,
  Moon
} from 'lucide-react';

interface Feature {
  id: string;
  name: string;
  description: string;
  icon: typeof Smartphone;
  status: 'available' | 'coming-soon' | 'beta';
}

const mobileFeatures: Feature[] = [
  {
    id: 'trading',
    name: 'Mobile Trading',
    description: 'Buy, sell, and trade regenerative assets on the go',
    icon: TrendingUp,
    status: 'available'
  },
  {
    id: 'wallet',
    name: 'Digital Wallet',
    description: 'Secure multi-asset wallet with biometric authentication',
    icon: Wallet,
    status: 'available'
  },
  {
    id: 'impact',
    name: 'Impact Tracking',
    description: 'Real-time environmental and social impact metrics',
    icon: Globe,
    status: 'available'
  },
  {
    id: 'notifications',
    name: 'Push Notifications',
    description: 'Instant alerts for trades, governance, and impact updates',
    icon: Bell,
    status: 'available'
  },
  {
    id: 'camera',
    name: 'Evidence Upload',
    description: 'Capture and verify impact evidence with camera',
    icon: Camera,
    status: 'beta'
  },
  {
    id: 'offline',
    name: 'Offline Mode',
    description: 'Access key features without internet connection',
    icon: Zap,
    status: 'coming-soon'
  },
  {
    id: 'biometric',
    name: 'Biometric Security',
    description: 'Face ID and fingerprint authentication',
    icon: Fingerprint,
    status: 'available'
  },
  {
    id: 'social',
    name: 'Social Features',
    description: 'Connect with regenerators and share impact stories',
    icon: MessageCircle,
    status: 'beta'
  }
];

const screenshots = [
  { id: 1, title: 'Dashboard', desc: 'Portfolio overview' },
  { id: 2, title: 'Trading', desc: 'Buy & sell assets' },
  { id: 3, title: 'Impact', desc: 'Track your impact' },
  { id: 4, title: 'Wallet', desc: 'Manage assets' },
  { id: 5, title: 'Governance', desc: 'Vote on proposals' }
];

const userReviews = [
  {
    name: 'Maria Rodriguez',
    role: 'Conservation Project Manager',
    rating: 5,
    comment: 'The mobile app makes it easy to track our reforestation project impact in real-time. Game changer!',
    date: '2026-01-15'
  },
  {
    name: 'James Chen',
    role: 'Regenerative Farmer',
    rating: 5,
    comment: 'Simple, beautiful, and powerful. I can trade carbon credits while working in the field.',
    date: '2026-01-20'
  },
  {
    name: 'Aisha Nkrumah',
    role: 'Community Organizer',
    rating: 4,
    comment: 'Love the impact tracking features. Would like to see more language options.',
    date: '2026-01-28'
  }
];

export function MobileAppDemo() {
  const [selectedScreen, setSelectedScreen] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(true);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white mb-2">RVE Mobile App</h2>
          <p className="text-emerald-300/70">
            Regenerative finance in your pocket - iOS & Android
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-black hover:bg-black/80 text-white">
            <Apple className="w-5 h-5 mr-2" />
            App Store
          </Button>
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
            <Play className="w-5 h-5 mr-2" />
            Play Store
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: Download, label: 'Downloads', value: '125K+', color: 'emerald' },
          { icon: Star, label: 'Rating', value: '4.8/5', color: 'amber' },
          { icon: Users, label: 'Active Users', value: '87K', color: 'blue' },
          { icon: Shield, label: 'Security', value: 'Bank-grade', color: 'purple' }
        ].map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <Card key={idx} className="bg-emerald-900/20 border-emerald-500/20">
              <CardContent className="pt-6">
                <div className={`w-10 h-10 rounded-lg bg-${metric.color}-400/10 flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 text-${metric.color}-400`} />
                </div>
                <div className="text-sm text-emerald-300/70 mb-1">{metric.label}</div>
                <div className="text-white text-2xl">{metric.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="preview" className="space-y-6">
        <TabsList className="bg-emerald-900/20 border border-emerald-500/20">
          <TabsTrigger value="preview">App Preview</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="download">Download</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        {/* App Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Phone Mockup */}
            <div className="lg:col-span-2 flex justify-center items-start">
              <div className="relative">
                {/* Phone Frame */}
                <div className={`w-80 h-[640px] ${isDarkMode ? 'bg-black' : 'bg-white'} rounded-[3rem] border-8 ${isDarkMode ? 'border-gray-800' : 'border-gray-300'} shadow-2xl overflow-hidden relative`}>
                  {/* Notch */}
                  <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 ${isDarkMode ? 'bg-black' : 'bg-white'} rounded-b-3xl z-10`}></div>
                  
                  {/* Screen Content */}
                  <div className={`h-full ${isDarkMode ? 'bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950' : 'bg-gradient-to-br from-emerald-50 via-white to-teal-50'} overflow-hidden`}>
                    {/* Status Bar */}
                    <div className="flex items-center justify-between px-8 pt-12 pb-4">
                      <span className={`text-xs ${isDarkMode ? 'text-white' : 'text-black'}`}>9:41</span>
                      <div className="flex items-center gap-1">
                        <div className={`w-4 h-3 rounded-sm border ${isDarkMode ? 'border-white' : 'border-black'}`}>
                          <div className={`w-2 h-2 ${isDarkMode ? 'bg-white' : 'bg-black'} rounded-sm m-[1px]`}></div>
                        </div>
                      </div>
                    </div>

                    {/* App Header */}
                    <div className="px-6 mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                            <Leaf className="w-5 h-5 text-white" />
                          </div>
                          <span className={`${isDarkMode ? 'text-white' : 'text-black'} font-semibold`}>RVE</span>
                        </div>
                        <button onClick={() => setIsDarkMode(!isDarkMode)}>
                          {isDarkMode ? (
                            <Sun className="w-5 h-5 text-amber-400" />
                          ) : (
                            <Moon className="w-5 h-5 text-slate-600" />
                          )}
                        </button>
                      </div>
                      
                      {/* Portfolio Value Card */}
                      <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-emerald-900/30' : 'bg-emerald-100'} backdrop-blur-sm border ${isDarkMode ? 'border-emerald-500/20' : 'border-emerald-300'}`}>
                        <div className={`text-xs ${isDarkMode ? 'text-emerald-300/70' : 'text-emerald-700'} mb-1`}>Total Portfolio</div>
                        <div className={`text-2xl ${isDarkMode ? 'text-white' : 'text-black'} mb-1`}>$24,567.82</div>
                        <div className="flex items-center gap-1 text-emerald-400 text-sm">
                          <TrendingUp className="w-4 h-4" />
                          <span>+12.4% ($2,708)</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="px-6 mb-6">
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { icon: TrendingUp, label: 'Trade', color: 'emerald' },
                          { icon: Wallet, label: 'Wallet', color: 'blue' },
                          { icon: Globe, label: 'Impact', color: 'purple' },
                          { icon: Users, label: 'DAO', color: 'amber' }
                        ].map((action, idx) => {
                          const Icon = action.icon;
                          return (
                            <button
                              key={idx}
                              className={`flex flex-col items-center gap-2 p-3 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`}
                            >
                              <div className={`w-10 h-10 rounded-xl bg-${action.color}-400/10 flex items-center justify-center`}>
                                <Icon className={`w-5 h-5 text-${action.color}-400`} />
                              </div>
                              <span className={`text-xs ${isDarkMode ? 'text-white' : 'text-black'}`}>{action.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Assets List */}
                    <div className="px-6">
                      <h3 className={`text-sm ${isDarkMode ? 'text-white' : 'text-black'} mb-3`}>Your Assets</h3>
                      <div className="space-y-2">
                        {[
                          { symbol: 'RVE', name: 'RVE Token', amount: '2,450', value: '$6,125', change: '+5.2%', up: true },
                          { symbol: 'CARBON', name: 'Carbon Credits', amount: '1,800', value: '$4,320', change: '+3.1%', up: true },
                          { symbol: 'BIO', name: 'Biodiversity', amount: '950', value: '$2,185', change: '-1.5%', up: false }
                        ].map((asset, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-black/5'} flex items-center justify-between`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold">
                                {asset.symbol[0]}
                              </div>
                              <div>
                                <div className={`text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>{asset.name}</div>
                                <div className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>{asset.amount} {asset.symbol}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>{asset.value}</div>
                              <div className={`text-xs ${asset.up ? 'text-emerald-400' : 'text-red-400'}`}>{asset.change}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Device Controls */}
                <div className="absolute -right-16 top-1/2 -translate-y-1/2 space-y-2">
                  {screenshots.map((screen) => (
                    <button
                      key={screen.id}
                      onClick={() => setSelectedScreen(screen.id)}
                      className={`block w-12 h-12 rounded-lg border-2 transition-all ${
                        selectedScreen === screen.id
                          ? 'border-emerald-400 bg-emerald-400/20'
                          : 'border-emerald-500/30 bg-emerald-900/20 hover:border-emerald-500/50'
                      }`}
                      title={screen.title}
                    >
                      <span className="text-xs text-white">{screen.id}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-4">
              <Card className="bg-emerald-900/20 border-emerald-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Key Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { icon: Zap, text: 'Lightning-fast trading' },
                    { icon: Shield, text: 'Bank-grade security' },
                    { icon: Bell, text: 'Real-time notifications' },
                    { icon: Globe, text: 'Impact tracking' },
                    { icon: Fingerprint, text: 'Biometric auth' }
                  ].map((feature, idx) => {
                    const Icon = feature.icon;
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-emerald-400" />
                        <span className="text-emerald-300/90">{feature.text}</span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="bg-emerald-900/20 border-emerald-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Platform Support</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-emerald-950/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Apple className="w-5 h-5 text-white" />
                      <span className="text-white">iOS</span>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-0">
                      15.0+
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-emerald-950/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Play className="w-5 h-5 text-emerald-400" />
                      <span className="text-white">Android</span>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-0">
                      8.0+
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-emerald-900/20 border-emerald-500/20">
                <CardHeader>
                  <CardTitle className="text-white text-sm">What's New</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-emerald-300/90">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>Dark mode support</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>Improved camera evidence upload</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>Performance optimizations</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mobileFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.id} className="bg-emerald-900/20 border-emerald-500/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-400/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-white">{feature.name}</h4>
                          <Badge className={
                            feature.status === 'available' ? 'bg-emerald-500/20 text-emerald-400 border-0' :
                            feature.status === 'beta' ? 'bg-blue-500/20 text-blue-400 border-0' :
                            'bg-amber-500/20 text-amber-400 border-0'
                          }>
                            {feature.status === 'coming-soon' ? 'Coming Soon' : feature.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-emerald-300/70">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Download Tab */}
        <TabsContent value="download" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* iOS Download */}
            <Card className="bg-emerald-900/20 border-emerald-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Apple className="w-6 h-6" />
                  Download for iOS
                </CardTitle>
                <CardDescription className="text-emerald-300/70">
                  Available on the App Store
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <div className="w-48 h-48 bg-white rounded-2xl p-4 flex items-center justify-center">
                    <QrCode className="w-full h-full text-black" />
                  </div>
                </div>
                <div className="text-center text-sm text-emerald-300/70">
                  Scan QR code with your iPhone camera
                </div>
                <Button className="w-full bg-black hover:bg-black/80 text-white">
                  <Apple className="w-5 h-5 mr-2" />
                  Download on App Store
                </Button>
                <div className="space-y-2 text-sm text-emerald-300/70">
                  <div>• Requires iOS 15.0 or later</div>
                  <div>• Size: 45.2 MB</div>
                  <div>• Version: 2.1.0</div>
                </div>
              </CardContent>
            </Card>

            {/* Android Download */}
            <Card className="bg-emerald-900/20 border-emerald-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Play className="w-6 h-6" />
                  Download for Android
                </CardTitle>
                <CardDescription className="text-emerald-300/70">
                  Available on Google Play
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <div className="w-48 h-48 bg-white rounded-2xl p-4 flex items-center justify-center">
                    <QrCode className="w-full h-full text-black" />
                  </div>
                </div>
                <div className="text-center text-sm text-emerald-300/70">
                  Scan QR code with your Android camera
                </div>
                <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
                  <Play className="w-5 h-5 mr-2" />
                  Get it on Google Play
                </Button>
                <div className="space-y-2 text-sm text-emerald-300/70">
                  <div>• Requires Android 8.0 or later</div>
                  <div>• Size: 38.7 MB</div>
                  <div>• Version: 2.1.0</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Installation Guide */}
          <Card className="bg-emerald-900/20 border-emerald-500/20">
            <CardHeader>
              <CardTitle className="text-white">Installation Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    step: '1',
                    title: 'Download',
                    desc: 'Get the app from App Store or Google Play'
                  },
                  {
                    step: '2',
                    title: 'Connect Wallet',
                    desc: 'Link your existing Web3 wallet or create new one'
                  },
                  {
                    step: '3',
                    title: 'Start Trading',
                    desc: 'Begin trading regenerative assets immediately'
                  }
                ].map((item, idx) => (
                  <div key={idx} className="text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-400/10 flex items-center justify-center mx-auto mb-3 text-emerald-400 text-xl font-bold">
                      {item.step}
                    </div>
                    <h4 className="text-white mb-2">{item.title}</h4>
                    <p className="text-sm text-emerald-300/70">{item.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white text-2xl mb-1">4.8 out of 5</h3>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`w-5 h-5 ${star <= 4 ? 'fill-amber-400 text-amber-400' : 'text-gray-500'}`} />
                ))}
              </div>
              <p className="text-sm text-emerald-300/70 mt-1">Based on 3,247 reviews</p>
            </div>
          </div>

          <div className="space-y-4">
            {userReviews.map((review, idx) => (
              <Card key={idx} className="bg-emerald-900/20 border-emerald-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-white mb-1">{review.name}</h4>
                      <p className="text-sm text-emerald-300/50">{review.role}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-500'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-emerald-300/90 mb-3">{review.comment}</p>
                  <div className="text-xs text-emerald-300/50">
                    {new Date(review.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
