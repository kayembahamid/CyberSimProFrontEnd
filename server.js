'use strict';

const path = require('path');
const express = require('express');
const compression = require('compression');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Config
const HOST = process.env.HOST || '0.0.0.0';
const PORT = Number(process.env.PORT || 5173);
const MOUNT_PATH = process.env.MOUNT_PATH || '/'; // e.g. '/ui'
const CRM_WEBHOOK_URL = process.env.CRM_WEBHOOK_URL;
const CRM_WEBHOOK_AUTH = process.env.CRM_WEBHOOK_AUTH;
const CRM_PROVIDER = (process.env.CRM_PROVIDER || '').toLowerCase();
const LEAD_RATE_WINDOW_MS = Number(process.env.LEAD_RATE_WINDOW_MS || 15 * 60 * 1000);
const LEAD_RATE_LIMIT = Number(process.env.LEAD_RATE_LIMIT || 5);
const FEATURE_SELF_SERVICE_ENABLED = process.env.FEATURE_SELF_SERVICE_ENABLED === 'true';
const FEATURE_AUTOMATIONS_ENABLED = process.env.FEATURE_AUTOMATIONS_ENABLED === 'true';

// Middlewares
app.disable('x-powered-by');
app.use(compression());
app.use(cors({ origin: true, credentials: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static serving
const staticDir = path.resolve(__dirname);
const assetDir = path.join(staticDir, 'assets');
const isProduction = process.env.NODE_ENV === 'production';
const staticOptions = {
  extensions: ['html'],
  maxAge: isProduction ? '12h' : 0,
  setHeaders: (res) => {
    if (isProduction) {
      res.setHeader('Cache-Control', 'public, max-age=43200');
    } else {
      res.setHeader('Cache-Control', 'no-store');
    }
  }
};

app.use(MOUNT_PATH, express.static(staticDir, staticOptions));

// Ensure relative asset paths resolve even when the app is mounted under a sub-path
const mountPrefix = MOUNT_PATH === '/' ? '' : MOUNT_PATH;
const mountedAssetPath = `${mountPrefix}/assets`;
app.use(mountedAssetPath, express.static(assetDir, staticOptions));
if (MOUNT_PATH !== '/') {
  app.use('/assets', express.static(assetDir, staticOptions));
}

const joinMountPath = (suffix) => {
  if (!suffix.startsWith('/')) {
    suffix = `/${suffix}`;
  }
  return MOUNT_PATH === '/' ? suffix : `${MOUNT_PATH.replace(/\/$/, '')}${suffix}`;
};

const leadAttempts = new Map();

const isRateLimited = (ip) => {
  if (!LEAD_RATE_LIMIT || LEAD_RATE_LIMIT <= 0) {
    return false;
  }
  const now = Date.now();
  const record = leadAttempts.get(ip) || { count: 0, first: now };
  if (now - record.first > LEAD_RATE_WINDOW_MS) {
    record.count = 0;
    record.first = now;
  }
  record.count += 1;
  leadAttempts.set(ip, record);
  return record.count > LEAD_RATE_LIMIT;
};

const allowedTimelines = new Set(['0-30', '30-90', 'gt-90', 'research']);

const leadPaths = new Set(['/api/leads', joinMountPath('/api/leads')]);
leadPaths.forEach((routePath) => {
  app.post(routePath, async (req, res) => {
    const ip = req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.socket.remoteAddress;
    if (isRateLimited(ip)) {
      return res.status(429).json({ error: 'Too many requests. Try again later.' });
    }

    const { name, email, company, timeline, notes = '', source = '', website = '' } = req.body ?? {};

    if (website) {
      return res.status(400).json({ error: 'Invalid submission.' });
    }

    if (!name || typeof name !== 'string' || name.length < 2) {
      return res.status(400).json({ error: 'Name is required.' });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailPattern.test(email)) {
      return res.status(400).json({ error: 'Valid work email is required.' });
    }

    if (!company || typeof company !== 'string' || company.length < 2) {
      return res.status(400).json({ error: 'Company is required.' });
    }

    if (!allowedTimelines.has(timeline)) {
      return res.status(400).json({ error: 'Invalid timeline selection.' });
    }

    const payload = {
      name: name.trim(),
      email: email.trim(),
      company: company.trim(),
      timeline,
      notes: typeof notes === 'string' ? notes.trim() : '',
      source: typeof source === 'string' ? source.trim() : 'cybersimpro-front',
      submittedAt: new Date().toISOString(),
      provider: CRM_PROVIDER || 'unconfigured',
      ip,
      userAgent: req.headers['user-agent'] || 'unknown',
    };

    let forwarded = false;
    if (CRM_WEBHOOK_URL) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), Number(process.env.CRM_TIMEOUT_MS || 8000));
      try {
        const headers = {
          'Content-Type': 'application/json',
        };
        if (CRM_WEBHOOK_AUTH) {
          headers.Authorization = CRM_WEBHOOK_AUTH;
        }
        const response = await fetch(CRM_WEBHOOK_URL, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`CRM responded with ${response.status}`);
        }
        forwarded = true;
      } catch (error) {
        console.error('Lead forwarding failed', error);
      } finally {
        clearTimeout(timeout);
      }
    } else {
      console.info('Lead captured (no CRM webhook configured):', payload);
    }

    if (!forwarded && CRM_WEBHOOK_URL) {
      return res.status(202).json({ status: 'queued', forwarded: false, message: 'Lead captured locally; CRM forwarding failed.' });
    }

    return res.status(202).json({ status: 'queued', forwarded: forwarded || false });
  });
});

const configPaths = new Set(['/config.json', joinMountPath('/config.json')]);
configPaths.forEach((routePath) => {
  app.get(routePath, (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json({
      segmentWriteKey: process.env.SEGMENT_WRITE_KEY || null,
      gtmId: process.env.GTM_ID || null,
      calendlyUrl: process.env.CALENDLY_URL || 'https://calendly.com/cybersimpro/demo',
      stripeCheckoutUrl: process.env.STRIPE_CHECKOUT_URL || null,
      featureFlags: {
        selfServiceCheckout: FEATURE_SELF_SERVICE_ENABLED,
        workflowAutomations: FEATURE_AUTOMATIONS_ENABLED,
      },
    });
  });
});

// SPA fallback to index.html
app.get(MOUNT_PATH + '*', (_req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`CyberSim Pro Frontend serving ${staticDir}`);
  console.log(`Mounted at ${MOUNT_PATH} on http://${HOST}:${PORT}`);
});
