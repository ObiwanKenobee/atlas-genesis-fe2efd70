import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Leaf, TrendingUp, Wallet, Shield } from 'lucide-react';

// CRITICAL: Minimal Auth Component
export function MinimalAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/core/auth/login' : '/api/core/auth/signup';
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Auth failed:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{isLogin ? 'Login' : 'Sign Up'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full">
            {isLogin ? 'Login' : 'Sign Up'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsLogin(!isLogin)}
            className="w-full"
          >
            {isLogin ? 'Need an account?' : 'Have an account?'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// CRITICAL: Minimal Marketplace Component
export function MinimalMarketplace() {
  const [projects, setProjects] = useState([]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/core/marketplace/projects');
      const data = await response.json();
      if (data.success) setProjects(data.projects);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const purchaseCredits = async (projectId: string, quantity: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/core/marketplace/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ projectId, quantity })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Purchase successful!');
      }
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Carbon Marketplace</h1>
        <Button onClick={fetchProjects}>
          <Leaf className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      <div className="grid gap-4">
        {projects.map((project: any) => (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle>{project.title}</CardTitle>
              <Badge>{project.project_type}</Badge>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    ${project.price_per_credit}/credit
                  </p>
                  <p className="text-sm">
                    {project.available_credits} credits available
                  </p>
                </div>
                <Button onClick={() => purchaseCredits(project.id, 1)}>
                  Buy 1 Credit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// CRITICAL: Minimal Portfolio Component
export function MinimalPortfolio() {
  const [holdings, setHoldings] = useState([]);

  const fetchHoldings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/core/portfolio/holdings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) setHoldings(data.holdings);
    } catch (error) {
      console.error('Failed to fetch holdings:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Portfolio</h1>
        <Button onClick={fetchHoldings}>
          <Wallet className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      <div className="grid gap-4">
        {holdings.map((holding: any) => (
          <Card key={holding.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{holding.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {holding.quantity} credits @ ${holding.purchase_price}
                  </p>
                </div>
                <Badge variant={holding.retired ? "outline" : "default"}>
                  {holding.retired ? 'Retired' : 'Active'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// CRITICAL: Minimal Dashboard Component
export function MinimalDashboard() {
  const [stats, setStats] = useState({
    totalCredits: 0,
    totalValue: 0,
    trustScore: 0.5
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCredits}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalValue}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trust Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.trustScore * 100).toFixed(0)}%</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}