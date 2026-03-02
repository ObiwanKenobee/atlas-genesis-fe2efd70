import { useState } from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, DollarSign, Activity, Star, Eye, BarChart3, BookOpen, Plus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const assets = [
  {
    symbol: 'CARB',
    name: 'Carbon Sequestration Credits',
    price: 124.56,
    change: 5.7,
    volume: '847M',
    category: 'Environmental',
    color: 'emerald',
  },
  {
    symbol: 'FRST',
    name: 'Forest Restoration Tokens',
    price: 89.34,
    change: 3.2,
    volume: '423M',
    category: 'Environmental',
    color: 'emerald',
  },
  {
    symbol: 'WETL',
    name: 'Wetland Revival Credits',
    price: 67.89,
    change: -1.4,
    volume: '234M',
    category: 'Environmental',
    color: 'emerald',
  },
  {
    symbol: 'WELL',
    name: 'Community Wellness Bonds',
    price: 156.78,
    change: 4.5,
    volume: '567M',
    category: 'Health & Social',
    color: 'blue',
  },
  {
    symbol: 'LANG',
    name: 'Language Preservation Units',
    price: 43.21,
    change: 8.9,
    volume: '123M',
    category: 'Cultural',
    color: 'amber',
  },
  {
    symbol: 'POLL',
    name: 'Pollination Service Credits',
    price: 78.45,
    change: 2.3,
    volume: '289M',
    category: 'Ecosystem Services',
    color: 'purple',
  },
];

const chartData = [
  { time: '9:00', price: 118 },
  { time: '10:00', price: 119.5 },
  { time: '11:00', price: 121 },
  { time: '12:00', price: 120 },
  { time: '1:00', price: 122.5 },
  { time: '2:00', price: 123 },
  { time: '3:00', price: 124.5 },
];

const recentTrades = [
  { id: 1, asset: 'CARB', type: 'buy', price: 124.56, amount: 1000, time: '2 min ago' },
  { id: 2, asset: 'WELL', type: 'sell', price: 156.78, amount: 500, time: '5 min ago' },
  { id: 3, asset: 'LANG', type: 'buy', price: 43.21, amount: 2500, time: '8 min ago' },
  { id: 4, asset: 'FRST', type: 'buy', price: 89.34, amount: 750, time: '12 min ago' },
  { id: 5, asset: 'POLL', type: 'sell', price: 78.45, amount: 1200, time: '15 min ago' },
];

const orderBook = {
  bids: [
    { price: 124.54, amount: 1250, total: 155675 },
    { price: 124.52, amount: 890, total: 110823 },
    { price: 124.50, amount: 2100, total: 261450 },
    { price: 124.48, amount: 750, total: 93360 },
    { price: 124.45, amount: 1500, total: 186675 },
  ],
  asks: [
    { price: 124.58, amount: 900, total: 112122 },
    { price: 124.60, amount: 1450, total: 180670 },
    { price: 124.62, amount: 680, total: 84741 },
    { price: 124.65, amount: 2200, total: 274230 },
    { price: 124.68, amount: 1100, total: 137148 },
  ]
};

const portfolioAssets = [
  { symbol: 'CARB', name: 'Carbon Credits', holdings: 2500, avgPrice: 118.34, currentPrice: 124.56, value: 311400 },
  { symbol: 'WELL', name: 'Wellness Bonds', holdings: 850, avgPrice: 149.23, currentPrice: 156.78, value: 133263 },
  { symbol: 'LANG', name: 'Language Units', holdings: 5000, avgPrice: 39.87, currentPrice: 43.21, value: 216050 },
];

export function TradingInterface() {
  const [selectedAsset, setSelectedAsset] = useState(assets[0]);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop'>('market');
  const [amount, setAmount] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [watchlist, setWatchlist] = useState<string[]>(['CARB', 'WELL']);
  const [activeView, setActiveView] = useState<'trade' | 'portfolio' | 'orderbook'>('trade');

  const toggleWatchlist = (symbol: string) => {
    setWatchlist(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  const portfolioValue = portfolioAssets.reduce((sum, asset) => sum + asset.value, 0);
  const portfolioCost = portfolioAssets.reduce((sum, asset) => sum + (asset.holdings * asset.avgPrice), 0);
  const portfolioGain = portfolioValue - portfolioCost;
  const portfolioGainPercent = (portfolioGain / portfolioCost * 100).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-6">
        <h2 className="text-white mb-2">Regenerative Asset Trading</h2>
        <p className="text-emerald-300/80">
          Trade regenerative credits and tokens backed by real ecological restoration, cultural preservation, 
          and community well-being initiatives.
        </p>
      </div>

      {/* View Selector */}
      <div className="flex gap-2 bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-2">
        <button
          onClick={() => setActiveView('trade')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
            activeView === 'trade'
              ? 'bg-emerald-500 text-white'
              : 'text-emerald-400 hover:bg-emerald-500/10'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Trading</span>
        </button>
        <button
          onClick={() => setActiveView('portfolio')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
            activeView === 'portfolio'
              ? 'bg-emerald-500 text-white'
              : 'text-emerald-400 hover:bg-emerald-500/10'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Portfolio</span>
        </button>
        <button
          onClick={() => setActiveView('orderbook')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
            activeView === 'orderbook'
              ? 'bg-emerald-500 text-white'
              : 'text-emerald-400 hover:bg-emerald-500/10'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Order Book</span>
        </button>
      </div>

      {/* Market Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
          <div className="text-emerald-300/70 text-sm mb-2">24h Trading Volume</div>
          <div className="text-white mb-1">$2.48B</div>
          <div className="flex items-center gap-1 text-emerald-400 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>+12.5%</span>
          </div>
        </div>
        <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
          <div className="text-emerald-300/70 text-sm mb-2">Active Traders</div>
          <div className="text-white mb-1">23,847</div>
          <div className="flex items-center gap-1 text-emerald-400 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>+8.3%</span>
          </div>
        </div>
        <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
          <div className="text-emerald-300/70 text-sm mb-2">Total Assets</div>
          <div className="text-white mb-1">142</div>
          <div className="flex items-center gap-1 text-emerald-400 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>+3 new</span>
          </div>
        </div>
        <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
          <div className="text-emerald-300/70 text-sm mb-2">Impact Verified</div>
          <div className="text-white mb-1">$847.3B</div>
          <div className="flex items-center gap-1 text-emerald-400 text-sm">
            <Activity className="w-4 h-4" />
            <span>Real-time</span>
          </div>
        </div>
      </div>

      {/* Main Trading Area */}
      {activeView === 'trade' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Asset List */}
            <div className="lg:col-span-2 bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white">Market Overview</h3>
                <div className="flex items-center gap-2 text-emerald-300/70 text-sm">
                  <Star className="w-4 h-4" />
                  <span>Watchlist: {watchlist.length}</span>
                </div>
              </div>
              <div className="space-y-2">
                {assets.map((asset) => (
                  <button
                    key={asset.symbol}
                    onClick={() => setSelectedAsset(asset)}
                    className={`w-full flex items-center justify-between p-4 rounded-lg transition-all ${
                      selectedAsset.symbol === asset.symbol
                        ? 'bg-emerald-500/20 border border-emerald-500/40'
                        : 'bg-emerald-900/10 border border-emerald-500/10 hover:border-emerald-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWatchlist(asset.symbol);
                        }}
                        className="hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star 
                          className={`w-5 h-5 ${
                            watchlist.includes(asset.symbol) 
                              ? 'fill-emerald-400 text-emerald-400' 
                              : 'text-emerald-400/30'
                          }`}
                        />
                      </div>
                      <div className={`w-10 h-10 bg-gradient-to-br from-${asset.color}-500 to-${asset.color}-600 rounded-lg flex items-center justify-center text-white`}>
                        {asset.symbol.substring(0, 2)}
                      </div>
                      <div className="text-left">
                        <div className="text-white">{asset.symbol}</div>
                        <div className="text-emerald-300/70 text-sm">{asset.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white mb-1">${asset.price}</div>
                      <div className={`flex items-center gap-1 text-sm ${asset.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {asset.change >= 0 ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                        <span>{Math.abs(asset.change)}%</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Enhanced Trading Panel */}
            <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
              <h3 className="text-white mb-6">Trade {selectedAsset.symbol}</h3>
              
              {/* Buy/Sell Tabs */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setTradeType('buy')}
                  className={`flex-1 py-3 rounded-lg transition-all ${
                    tradeType === 'buy'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                  }`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setTradeType('sell')}
                  className={`flex-1 py-3 rounded-lg transition-all ${
                    tradeType === 'sell'
                      ? 'bg-red-500 text-white'
                      : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                  }`}
                >
                  Sell
                </button>
              </div>

              {/* Order Type Selector */}
              <div className="mb-6">
                <label className="text-emerald-300/70 text-sm mb-2 block">Order Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {['market', 'limit', 'stop'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setOrderType(type as any)}
                      className={`py-2 rounded-lg text-sm transition-all capitalize ${
                        orderType === type
                          ? 'bg-emerald-500 text-white'
                          : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Price */}
              <div className="bg-emerald-900/20 rounded-lg p-4 mb-6">
                <div className="text-emerald-300/70 text-sm mb-1">Current Price</div>
                <div className="text-white">${selectedAsset.price}</div>
              </div>

              {/* Limit Price Input (shown for limit/stop orders) */}
              {(orderType === 'limit' || orderType === 'stop') && (
                <div className="mb-6">
                  <label className="text-emerald-300/70 text-sm mb-2 block">
                    {orderType === 'limit' ? 'Limit Price' : 'Stop Price'}
                  </label>
                  <input
                    type="number"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-4 py-3 text-white placeholder:text-emerald-300/30 focus:outline-none focus:border-emerald-500/40"
                  />
                </div>
              )}

              {/* Amount Input */}
              <div className="mb-6">
                <label className="text-emerald-300/70 text-sm mb-2 block">Amount (Credits)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-4 py-3 text-white placeholder:text-emerald-300/30 focus:outline-none focus:border-emerald-500/40"
                />
              </div>

              {/* Total */}
              <div className="bg-emerald-900/20 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-emerald-300/70 text-sm">Total</span>
                  <span className="text-white">
                    ${amount ? (parseFloat(amount) * selectedAsset.price).toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-300/70">Trading Fee (0.1%)</span>
                  <span className="text-emerald-300/70">
                    ${amount ? ((parseFloat(amount) * selectedAsset.price) * 0.001).toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>

              {/* Trade Button */}
              <button
                className={`w-full py-3 rounded-lg transition-all ${
                  tradeType === 'buy'
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                {tradeType === 'buy' ? `Place ${orderType === 'market' ? 'Market' : orderType === 'limit' ? 'Limit' : 'Stop'} Buy Order` : `Place ${orderType === 'market' ? 'Market' : orderType === 'limit' ? 'Limit' : 'Stop'} Sell Order`}
              </button>

              {/* Impact Info */}
              <div className="mt-6 pt-6 border-t border-emerald-500/20">
                <div className="text-emerald-300/70 text-sm mb-2">Impact Backing</div>
                <div className="text-emerald-400 text-sm">
                  Each {selectedAsset.symbol} credit is backed by verified regenerative impact, 
                  tracked in real-time through our AI verification layer.
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
            <h3 className="text-white mb-6">{selectedAsset.symbol} - Today's Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#10b981" opacity={0.1} />
                <XAxis dataKey="time" stroke="#6ee7b7" />
                <YAxis stroke="#6ee7b7" domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#064e3b', 
                    border: '1px solid #10b981',
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
                <Line type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Trades */}
          <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
            <h3 className="text-white mb-6">Recent Market Activity</h3>
            <div className="space-y-3">
              {recentTrades.map((trade) => (
                <div key={trade.id} className="flex items-center justify-between bg-emerald-900/10 border border-emerald-500/10 rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 rounded-full text-sm ${
                      trade.type === 'buy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {trade.type.toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white mb-1">{trade.asset}</div>
                      <div className="text-emerald-300/70 text-sm">{trade.amount.toLocaleString()} credits @ ${trade.price}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white mb-1">${(trade.amount * trade.price).toLocaleString()}</div>
                    <div className="text-emerald-300/50 text-sm">{trade.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Portfolio View */}
      {activeView === 'portfolio' && (
        <div className="space-y-6">
          {/* Portfolio Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
              <div className="text-emerald-300/70 text-sm mb-2">Portfolio Value</div>
              <div className="text-white mb-1">${portfolioValue.toLocaleString()}</div>
              <div className={`flex items-center gap-1 text-sm ${parseFloat(portfolioGainPercent) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {parseFloat(portfolioGainPercent) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{portfolioGainPercent}%</span>
              </div>
            </div>
            <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
              <div className="text-emerald-300/70 text-sm mb-2">Total Gain/Loss</div>
              <div className={`mb-1 ${portfolioGain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                ${Math.abs(portfolioGain).toLocaleString()}
              </div>
              <div className="text-emerald-300/60 text-sm">{portfolioGain >= 0 ? 'Profit' : 'Loss'}</div>
            </div>
            <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
              <div className="text-emerald-300/70 text-sm mb-2">Total Assets</div>
              <div className="text-white mb-1">{portfolioAssets.length}</div>
              <div className="text-emerald-300/60 text-sm">Holdings</div>
            </div>
            <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
              <div className="text-emerald-300/70 text-sm mb-2">Watchlist</div>
              <div className="text-white mb-1">{watchlist.length}</div>
              <div className="text-emerald-300/60 text-sm">Assets tracked</div>
            </div>
          </div>

          {/* Portfolio Holdings */}
          <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
            <h3 className="text-white mb-6">Your Holdings</h3>
            <div className="space-y-3">
              {portfolioAssets.map((asset) => {
                const gain = asset.currentPrice - asset.avgPrice;
                const gainPercent = (gain / asset.avgPrice * 100).toFixed(2);
                return (
                  <div key={asset.symbol} className="bg-emerald-900/10 border border-emerald-500/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-white mb-1">{asset.symbol} - {asset.name}</div>
                        <div className="text-emerald-300/70 text-sm">{asset.holdings.toLocaleString()} credits</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white mb-1">${asset.value.toLocaleString()}</div>
                        <div className={`flex items-center gap-1 text-sm justify-end ${parseFloat(gainPercent) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {parseFloat(gainPercent) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          <span>{gainPercent}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-emerald-300/70 mb-1">Avg Price</div>
                        <div className="text-white">${asset.avgPrice}</div>
                      </div>
                      <div>
                        <div className="text-emerald-300/70 mb-1">Current Price</div>
                        <div className="text-white">${asset.currentPrice}</div>
                      </div>
                      <div>
                        <div className="text-emerald-300/70 mb-1">Gain/Loss</div>
                        <div className={parseFloat(gainPercent) >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                          ${(gain * asset.holdings).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Order Book View */}
      {activeView === 'orderbook' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sell Orders (Asks) */}
          <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
            <h3 className="text-white mb-6">Sell Orders (Asks) - {selectedAsset.symbol}</h3>
            <div className="space-y-2">
              {orderBook.asks.reverse().map((ask, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                  <div className="text-red-400">${ask.price.toFixed(2)}</div>
                  <div className="text-emerald-300/70 text-sm">{ask.amount.toLocaleString()}</div>
                  <div className="text-emerald-300/50 text-sm">${ask.total.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Buy Orders (Bids) */}
          <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
            <h3 className="text-white mb-6">Buy Orders (Bids) - {selectedAsset.symbol}</h3>
            <div className="space-y-2">
              {orderBook.bids.map((bid, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                  <div className="text-emerald-400">${bid.price.toFixed(2)}</div>
                  <div className="text-emerald-300/70 text-sm">{bid.amount.toLocaleString()}</div>
                  <div className="text-emerald-300/50 text-sm">${bid.total.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Spread Info */}
          <div className="lg:col-span-2 bg-gradient-to-r from-emerald-900/40 to-teal-900/40 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-6">
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="text-emerald-300/70 text-sm mb-2">Best Bid</div>
                <div className="text-emerald-400">${orderBook.bids[0].price.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-emerald-300/70 text-sm mb-2">Spread</div>
                <div className="text-white">${(orderBook.asks[orderBook.asks.length - 1].price - orderBook.bids[0].price).toFixed(2)}</div>
              </div>
              <div>
                <div className="text-emerald-300/70 text-sm mb-2">Best Ask</div>
                <div className="text-red-400">${orderBook.asks[orderBook.asks.length - 1].price.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}