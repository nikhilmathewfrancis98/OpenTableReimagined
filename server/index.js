const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

// Initialize Admin SDK with service account
var serviceAccount = require("./service-account.json");

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (e) {
  console.warn('admin.initializeApp() warning', e && e.message);
}

const app = express();
app.use(bodyParser.json());

async function verifyIdTokenMiddleware(req, res, next) {
  const auth = req.headers.authorization || '';
  const m = auth.match(/^Bearer (.+)$/);
  if (!m) return res.status(401).json({ error: 'Missing token' });
  const idToken = m[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token', details: String(err) });
  }
}

// Protected example endpoint
app.get('/api/protected/profile', verifyIdTokenMiddleware, async (req, res) => {
  try {
    const uid = req.user.uid;
    const db = admin.firestore();
    const doc = await db.collection('users').doc(uid).get();
    res.json({ uid, claims: req.user, profile: doc.exists ? doc.data() : null });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Sync endpoint: after client signs in/ signs up, client calls this to ensure server-side profile exists
app.post('/api/auth/sync', verifyIdTokenMiddleware, async (req, res) => {
  try {
    console.log('[server] /api/auth/sync called, uid=', req.user && req.user.uid);
    const uid = req.user.uid;
    const db = admin.firestore();
    const body = req.body || {};
    const userRef = db.collection('users').doc(uid);
    const doc = await userRef.get();
    const dataToSet = Object.assign({ id: uid, email: req.user.email || '' }, body.profile || {});
    if (!doc.exists) {
      console.log('[server] creating users/%s doc', uid);
      await userRef.set(dataToSet, { merge: true });
    } else {
      console.log('[server] users/%s exists, merging', uid);
      await userRef.set(dataToSet, { merge: true });
    }

    const updated = await userRef.get();
    res.json({ ok: true, profile: updated.exists ? updated.data() : null });
  } catch (err) {
    console.error('[server] /api/auth/sync error', err);
    res.status(500).json({ error: String(err) });
  }
});

// Server-based sign-up: create user via Admin SDK then issue a custom token
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, username, name } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
    console.log('[server] /api/auth/signup called', { email, username });

    // Create user via Admin SDK
    const userRecord = await admin.auth().createUser({ email, password, displayName: name || username || '' });
    console.log('[server] created user', userRecord.uid);

    // create users/{uid} profile
    try {
      const db = admin.firestore();
      await db.collection('users').doc(userRecord.uid).set({ id: userRecord.uid, email: userRecord.email || '', username: username || '', name: name || '', createdAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
      console.log('[server] created profile for', userRecord.uid);
    } catch (e) {
      console.warn('[server] failed to create profile', e && e.message);
    }

    // Create a custom token for client to sign in with SDK
    const customToken = await admin.auth().createCustomToken(userRecord.uid);
    res.json({ customToken, uid: userRecord.uid });
  } catch (err) {
    console.error('[server] /api/auth/signup error', err);
    res.status(500).json({ error: String(err) });
  }
});

// Server-based sign-in: verify credentials via Identity Toolkit REST and return custom token
app.post('/api/auth/signin', async (req, res) => {
  console.log("Inside");
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
    console.log('[server] /api/auth/signin called', { email });

    const apiKey = process.env.FIREBASE_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Server misconfigured: FIREBASE_API_KEY missing' });

    // Call Identity Toolkit to verify password
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
    const fetchRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    });
    const data = await fetchRes.json();
    if (!fetchRes.ok) {
      console.warn('[server] signInWithPassword failed', data);
      return res.status(401).json({ error: data.error || 'Invalid credentials', details: data });
    }

    const uid = data.localId;
    console.log('[server] signIn verified, uid=', uid);

    // Create custom token
    const customToken = await admin.auth().createCustomToken(uid);
    res.json({ customToken, uid });
  } catch (err) {
    console.error('[server] /api/auth/signin error', err);
    res.status(500).json({ error: String(err) });
  }
});

// Unprotected health check
app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
const HOST = '0.0.0.0'; // Accept connections from any IP

app.listen(PORT, HOST, () => {
  console.log(`Server listening on ${HOST}:${PORT}`);
});
