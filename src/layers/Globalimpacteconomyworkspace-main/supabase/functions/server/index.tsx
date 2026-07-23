import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Email notification helper function
async function sendInvestmentEmail(
  email: string,
  userName: string,
  projectTitle: string,
  amount: number,
  reference: string
) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
  );

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 16px; text-align: center; }
          .content { background: #f8fafc; padding: 30px; border-radius: 16px; margin-top: 20px; }
          .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0; }
          .detail-label { color: #64748b; font-size: 14px; }
          .detail-value { font-weight: 600; color: #0f172a; }
          .footer { text-align: center; color: #94a3b8; font-size: 12px; margin-top: 30px; }
          .impact-badge { background: #d1fae5; color: #065f46; padding: 8px 16px; border-radius: 8px; display: inline-block; margin-top: 20px; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">🌍 Investment Confirmed!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.95;">Thank you for creating positive impact</p>
          </div>
          
          <div class="content">
            <p>Hi ${userName},</p>
            <p>Your investment has been successfully processed. You're now contributing to meaningful change!</p>
            
            <div style="margin-top: 30px;">
              <div class="detail-row">
                <span class="detail-label">Project</span>
                <span class="detail-value">${projectTitle}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Amount</span>
                <span class="detail-value">$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Transaction Reference</span>
                <span class="detail-value" style="font-family: monospace; font-size: 12px;">${reference}</span>
              </div>
              <div class="detail-row" style="border-bottom: none;">
                <span class="detail-label">Date</span>
                <span class="detail-value">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>

            <div class="impact-badge">
              ✨ Impact Score: +${Math.floor(amount / 100)} points
            </div>
          </div>

          <div class="footer">
            <p>TerraFlow - Global Impact Economy Platform</p>
            <p>This is an automated notification. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  // Note: Supabase Auth email requires SMTP configuration
  // For now, we'll log the email and attempt to send via Supabase (if configured)
  console.log(`📧 Email notification prepared for ${email}`);
  console.log(`Subject: Investment Confirmed - ${projectTitle}`);
  
  // Attempt to send via Supabase Auth's email service
  // This requires SMTP to be configured in Supabase project settings
  try {
    // Supabase doesn't have a direct email API in the client library
    // In production, you would integrate with a service like SendGrid, Resend, or Mailgun
    // For this implementation, we'll log and store the notification
    
    // Store email notification in KV for user's notification history
    const notificationKey = `notification:${Date.now()}:${email}`;
    await kv.set(notificationKey, {
      email,
      subject: `Investment Confirmed - ${projectTitle}`,
      html: emailHtml,
      sentAt: new Date().toISOString(),
      type: 'investment_success'
    });

    console.log(`✅ Email notification logged and stored for ${email}`);
    console.log(`💡 To enable actual email delivery, integrate SendGrid, Resend, or configure Supabase SMTP.`);
    
  } catch (error) {
    console.error("Error storing email notification:", error);
    throw error;
  }
}

// Enable logger
app.use('*', logger(console.log));

// Enable CORS
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check
app.get("/make-server-76dec4a8/health", (c) => {
  return c.json({ status: "ok" });
});

// --- Auth ---

// Signup Route
app.post("/make-server-76dec4a8/signup", async (c) => {
  const { email, password, name } = await c.req.json();
  
  if (!email || !password) {
    return c.json({ error: "Email and password are required" }, 400);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
  );

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { name },
    email_confirm: true
  });

  if (error) {
    console.error("Signup error:", error);
    return c.json({ error: error.message }, 400);
  }

  // Initialize user portfolio in KV
  if (data.user) {
    await kv.set(`portfolio:${data.user.id}`, {
      balance: 0,
      totalYield: 0,
      invested: 0,
      transactions: []
    });
  }

  return c.json({ user: data.user });
});

// --- Data ---

const MOCK_PROJECTS = [
  {
    id: '1',
    title: 'Amazon Reforestation Initiative',
    category: 'Regeneration',
    location: 'Brazil',
    image: 'https://images.unsplash.com/photo-1600443106786-9b0bd14f56e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    raised: 450000,
    goal: 1000000,
    impactMetric: '50k Trees',
    supporters: 1240,
    returnRate: '5.2%'
  },
  {
    id: '2',
    title: 'Solar Grid for Rural Rajasthan',
    category: 'Energy',
    location: 'India',
    image: 'https://images.unsplash.com/photo-1628206554160-63e8c921e398?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    raised: 890000,
    goal: 950000,
    impactMetric: '1.2 MW',
    supporters: 3100,
    returnRate: '8.5%'
  },
  {
    id: '3',
    title: 'Clean Water Micro-Infrastructure',
    category: 'Water',
    location: 'Kenya',
    image: 'https://images.unsplash.com/photo-1559079236-2e64f89c7764?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    raised: 125000,
    goal: 300000,
    impactMetric: '15k People',
    supporters: 850,
    returnRate: '4.1%'
  },
  {
    id: '4',
    title: 'Sustainable Coffee Farming',
    category: 'Agriculture',
    location: 'Colombia',
    image: 'https://images.unsplash.com/photo-1721928005280-a5ac7cc2c50d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    raised: 65000,
    goal: 150000,
    impactMetric: '200 Acres',
    supporters: 420,
    returnRate: '7.8%'
  },
  {
    id: '5',
    title: 'Offshore Wind Farm Development',
    category: 'Energy',
    location: 'North Sea',
    image: 'https://images.unsplash.com/photo-1599405032290-29d6e9e7274c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    raised: 2100000,
    goal: 5000000,
    impactMetric: '50 MW',
    supporters: 5600,
    returnRate: '6.4%'
  }
];

// Get Projects (Seed if empty)
app.get("/make-server-76dec4a8/projects", async (c) => {
  try {
    let projects = await kv.get("projects");
    if (!projects) {
      projects = MOCK_PROJECTS;
      await kv.set("projects", projects);
    }
    return c.json({ projects });
  } catch (e) {
    console.error("Error fetching projects:", e);
    return c.json({ error: e.message }, 500);
  }
});

// Get Demo Portfolio
app.get("/make-server-76dec4a8/demo-portfolio", async (c) => {
  try {
    let portfolio = await kv.get("demo-portfolio");
    if (!portfolio) {
      portfolio = {
        balance: 12450,
        totalYield: 1240,
        invested: 5000,
        transactions: [
          {
            id: 1,
            type: 'Investment',
            project: 'Amazon Reforestation Initiative',
            amount: -2000,
            date: new Date().toLocaleDateString(),
            status: 'Completed',
            reference: 'demo-ref-' + Date.now()
          },
          {
            id: 2,
            type: 'Investment',
            project: 'Solar Grid for Rural Rajasthan',
            amount: -3000,
            date: new Date(Date.now() - 86400000).toLocaleDateString(),
            status: 'Completed',
            reference: 'demo-ref-' + (Date.now() - 1000)
          },
          {
            id: 3,
            type: 'Yield',
            project: 'Amazon Reforestation Initiative',
            amount: 120,
            date: new Date(Date.now() - 172800000).toLocaleDateString(),
            status: 'Received',
          }
        ]
      };
      await kv.set("demo-portfolio", portfolio);
    }
    return c.json({ portfolio });
  } catch (e) {
    console.error("Error fetching demo portfolio:", e);
    return c.json({ error: e.message }, 500);
  }
});

// Demo Invest Route (no auth required)
app.post("/make-server-76dec4a8/demo-invest", async (c) => {
  try {
    const { projectId, amount } = await c.req.json();

    // Update Project
    let projects = await kv.get("projects") || MOCK_PROJECTS;
    const projectIndex = projects.findIndex((p: any) => p.id === projectId);
    
    if (projectIndex === -1) {
      return c.json({ error: "Project not found" }, 404);
    }
    
    projects[projectIndex].raised += Number(amount);
    projects[projectIndex].supporters += 1;
    await kv.set("projects", projects);
    
    // Update Demo Portfolio
    let portfolio = await kv.get("demo-portfolio");
    if (!portfolio) {
      portfolio = {
        balance: 12450,
        totalYield: 0,
        invested: 0,
        transactions: []
      };
    }
    
    portfolio.invested += Number(amount);
    portfolio.balance -= Number(amount);
    portfolio.transactions.unshift({
      id: Date.now(),
      type: 'Investment',
      project: projects[projectIndex].title,
      amount: -Number(amount),
      date: new Date().toLocaleDateString(),
      status: 'Completed',
      reference: 'demo-ref-' + Date.now()
    });
    
    await kv.set("demo-portfolio", portfolio);
    
    console.log(`✅ Demo investment: $${amount} in ${projects[projectIndex].title}`);
    
    return c.json({ success: true, project: projects[projectIndex], portfolio });
  } catch (e) {
    console.error("Demo invest error:", e);
    return c.json({ error: e.message }, 500);
  }
});

const MOCK_REPORTS = [
  {
    id: 1,
    title: 'FY2025 Impact Assessment',
    type: 'Annual',
    date: '2025-12-31',
    size: '4.2 MB',
    status: 'Verified',
    verifier: 'Verra',
    downloadUrl: '#'
  },
  {
    id: 2,
    title: 'Q4 2025 Carbon Credit Audit',
    type: 'Audit',
    date: '2025-10-15',
    size: '1.8 MB',
    status: 'Verified',
    verifier: 'Gold Standard',
    downloadUrl: '#'
  },
  {
    id: 3,
    title: 'Amazon Reforestation: Satellite Verification',
    type: 'Project',
    date: '2025-09-01',
    size: '12.5 MB',
    status: 'Verified',
    verifier: 'Pachama',
    downloadUrl: '#'
  },
  {
    id: 4,
    title: 'Community Development Index 2024',
    type: 'Social',
    date: '2025-01-20',
    size: '3.1 MB',
    status: 'Verified',
    verifier: 'UN SDG',
    downloadUrl: '#'
  }
];

// Get Reports
app.get("/make-server-76dec4a8/reports", (c) => {
  return c.json({ reports: MOCK_REPORTS });
});

// Get detailed impact stats
app.get("/make-server-76dec4a8/impact-stats", async (c) => {
  // In a real app, this would calculate based on user's specific investments
  // For demo, we return an aggregated view
  const stats = {
    carbonOffset: { total: 12.5, unit: 'tons', history: [0.5, 1.2, 2.5, 4.0, 6.8, 9.2, 12.5] },
    treesPlanted: { total: 1240, unit: 'trees', history: [50, 120, 300, 550, 800, 1050, 1240] },
    waterSaved: { total: 450000, unit: 'liters' },
    energyGenerated: { total: 32.5, unit: 'MWh' },
    biodiversityScore: 92, // out of 100
    badges: [
      { id: '1', name: 'Early Adopter', icon: '🌟', date: '2024-01-15' },
      { id: '2', name: 'Carbon Neutral', icon: '🌿', date: '2024-06-20' },
      { id: '3', name: 'Forest Guardian', icon: '🌳', date: '2025-02-10' }
    ],
    projects: [
      {
        id: 1,
        name: 'Amazon Bio-Corridor',
        location: 'Brazil',
        type: 'Reforestation',
        contribution: '120 Trees',
        impact: '2.5t CO₂',
        image: 'https://images.unsplash.com/photo-1677126577258-1a82fdf1a976?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWdlbmVyYXRpdmUlMjBhZ3JpY3VsdHVyZSUyMGRyb25lfGVufDF8fHx8MTc3MDMzNTg1OHww&ixlib=rb-4.1.0&q=80&w=1080',
        progress: 75
      },
      {
        id: 2,
        name: 'Sahara Solar Initiative',
        location: 'Morocco',
        type: 'Renewable Energy',
        contribution: '45 MWh',
        impact: 'Avoided 15t CO₂',
        image: 'https://images.unsplash.com/photo-1670519808965-16b9b2f724af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2xhciUyMGZhcm0lMjBhZXN0aGV0aWN8ZW58MXx8fHwxNzcwMzM1ODU4fDA&ixlib=rb-4.1.0&q=80&w=1080',
        progress: 40
      },
      {
        id: 3,
        name: 'Blue Carbon Mangroves',
        location: 'Indonesia',
        type: 'Conservation',
        contribution: '0.5 Hectares',
        impact: 'Protected 50 Species',
        image: 'https://images.unsplash.com/photo-1613153262531-aeff570789ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW5ncm92ZSUyMGZvcmVzdCUyMGFlcmlhbCUyMHZpZXd8ZW58MXx8fHwxNzcwMzM1ODU4fDA&ixlib=rb-4.1.0&q=80&w=1080',
        progress: 90
      }
    ],
    assets: [
      {
        id: 1,
        name: 'Carbon Credit NFT #4021',
        issuer: 'Verra',
        vintage: '2024',
        value: '2.5 ETH',
        image: 'https://images.unsplash.com/photo-1644677656410-c6ffa3f8fa6d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwbmF0dXJlJTIwYWJzdHJhY3QlMjAzZHxlbnwxfHx8fDE3NzAzMzU4NTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
        contractAddress: '0xabc...123',
        tokenId: '4021',
        network: 'Polygon'
      }
    ],
    marketData: [
      { symbol: 'NCT', price: 14.25, change: '+2.4%', name: 'Nature Carbon Tonne' },
      { symbol: 'BCT', price: 2.10, change: '-0.5%', name: 'Base Carbon Tonne' },
      { symbol: 'ETH', price: 2450.00, change: '+1.2%', name: 'Ethereum' },
      { symbol: 'KLIMA', price: 4.80, change: '+5.1%', name: 'KlimaDAO' }
    ],
    wallet: {
      address: '0x71C...9A23',
      balance: '14.5 ETH',
      network: 'Mainnet'
    }
  };
  return c.json(stats);
});

// Paystack Config
app.get("/make-server-76dec4a8/paystack/config", (c) => {
  return c.json({ publicKey: Deno.env.get('PAYSTACK_PUBLIC_KEY') });
});

// Invest in a Project
app.post("/make-server-76dec4a8/invest", async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) return c.json({ error: "Unauthorized" }, 401);
  
  const token = authHeader.split(' ')[1];
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_ANON_KEY') || '',
  );
  
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { projectId, amount, reference } = await c.req.json();

  // Verify Paystack Transaction if reference provided
  if (reference) {
    try {
      const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          Authorization: `Bearer ${Deno.env.get('PAYSTACK_SECRET_KEY')}`,
        },
      });
      const verifyData = await verifyRes.json();
      
      if (!verifyData.status || verifyData.data.status !== 'success') {
         return c.json({ error: "Payment verification failed" }, 400);
      }
      
      // Optional: Check amount match (Paystack is in kobo)
      // if (verifyData.data.amount !== amount * 100) ... 
    } catch (e) {
      console.error("Paystack verification error:", e);
      return c.json({ error: "Payment verification error" }, 500);
    }
  }
  
  // Update Project
  let projects = await kv.get("projects") || MOCK_PROJECTS;
  const projectIndex = projects.findIndex((p: any) => p.id === projectId);
  
  if (projectIndex === -1) {
    return c.json({ error: "Project not found" }, 404);
  }
  
  projects[projectIndex].raised += Number(amount);
  projects[projectIndex].supporters += 1;
  await kv.set("projects", projects);
  
  // Update User Portfolio
  let portfolio = await kv.get(`portfolio:${user.id}`);
  if (!portfolio) {
    portfolio = {
      balance: 10000, 
      totalYield: 0,
      invested: 0,
      transactions: []
    };
  }
  
  portfolio.invested += Number(amount);
  portfolio.transactions.unshift({
    id: Date.now(),
    type: 'Investment',
    project: projects[projectIndex].title,
    amount: -Number(amount),
    date: new Date().toLocaleDateString(),
    status: 'Completed',
    reference // Store reference
  });
  
  await kv.set(`portfolio:${user.id}`, portfolio);
  
  // Send email notification
  try {
    await sendInvestmentEmail(
      user.email,
      user.user_metadata?.name || user.email.split('@')[0],
      projects[projectIndex].title,
      amount,
      reference
    );
  } catch (emailError) {
    console.error("Email notification error (non-critical):", emailError);
    // Don't fail the investment if email fails
  }
  
  return c.json({ success: true, project: projects[projectIndex], portfolio });
});

// Get User Data
app.get("/make-server-76dec4a8/user-data", async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) return c.json({ error: "Unauthorized" }, 401);
  
  const token = authHeader.split(' ')[1];
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_ANON_KEY') || '',
  );
  
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  let portfolio = await kv.get(`portfolio:${user.id}`);
  if (!portfolio) {
    portfolio = {
      balance: 10000, // Initial mock balance
      totalYield: 0,
      invested: 0,
      transactions: []
    };
    await kv.set(`portfolio:${user.id}`, portfolio);
  }

  return c.json({ portfolio });
});

Deno.serve(app.fetch);