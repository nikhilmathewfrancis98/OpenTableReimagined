// const functions = require('firebase-functions');
// const express = require('express');
// const admin = require('firebase-admin');
// const cors = require('cors');

// // Use onInit to defer initialization
// const { onInit } = require('firebase-functions/v2/core');

// let app;

// onInit(async () => {
//   // Initialize Admin SDK
//   admin.initializeApp();

//   // Create Express app
//   app = express();

//   // Middleware
//   app.use(cors({ origin: true }));
//   app.use(express.json());

//   // Auth middleware
// //   async function verifyIdTokenMiddleware(req, res, next) {
// //     const authHeader = req.headers.authorization || '';
// //     const m = authHeader.match(/^Bearer (.+)$/);
// //     if (!m) return res.status(401).json({ error: 'Missing token' });
// //     try {
// //       const decoded = await admin.auth().verifyIdToken(m[1]);
// //       req.user = decoded;
// //       next();
// //     } catch (err) {
// //       return res.status(401).json({ error: 'Invalid token', details: String(err) });
// //     }
// //   }

//   // Health
//   app.get('/health', (req, res) => res.json({ ok: true }));

//   // Protected profile
// //   app.get('/api/protected/profile', verifyIdTokenMiddleware, async (req, res) => {
// //     try {
// //       const uid = req.user.uid;
// //       const db = admin.firestore();
// //       const doc = await db.collection('users').doc(uid).get();
// //       res.json({ uid, claims: req.user, profile: doc.exists ? doc.data() : null });
// //     } catch (err) {
// //       res.status(500).json({ error: String(err) });
// //     }
// //   });

//   // Sync profile
// //   app.post('/api/auth/sync', verifyIdTokenMiddleware, async (req, res) => {
// //     try {
// //       const uid = req.user.uid;
// //       const db = admin.firestore();
// //       const body = req.body || {};
// //       const userRef = db.collection('users').doc(uid);
// //       const doc = await userRef.get();
// //       const dataToSet = Object.assign({ id: uid, email: req.user.email || '' }, body.profile || {});
// //       if (!doc.exists) {
// //         await userRef.set(dataToSet, { merge: true });
// //       } else {
// //         await userRef.set(dataToSet, { merge: true });
// //       }

// //       const updated = await userRef.get();
// //       res.json({ ok: true, profile: updated.exists ? updated.data() : null });
// //     } catch (err) {
// //       res.status(500).json({ error: String(err) });
// //     }
// //   });

//   // Server-based sign-up
//   app.post('/api/auth/signup', async (req, res) => {
//     try {
//       const { email, password, username, name } = req.body || {};
//       if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

//       const userRecord = await admin.auth().createUser({
//         email,
//         password,
//         displayName: name || username || ''
//       });

//       const db = admin.firestore();
//       await db.collection('users').doc(userRecord.uid).set({
//         id: userRecord.uid,
//         email: userRecord.email || '',
//         username: username || '',
//         name: name || '',
//         createdAt: admin.firestore.FieldValue.serverTimestamp()
//       }, { merge: true });

//       const customToken = await admin.auth().createCustomToken(userRecord.uid);
//       res.json({ customToken, uid: userRecord.uid });
//     } catch (err) {
//       res.status(500).json({ error: String(err) });
//     }
//   });

//   // Server-based sign-in
//   app.post('/api/auth/signin', async (req, res) => {
//     try {
//       const { email, password } = req.body || {};
//       if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

//       const apiKey = functions.config().identity.api_key;
//       if (!apiKey) return res.status(500).json({ error: 'Server misconfigured: API key missing' });

//       const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
//       const fetchRes = await fetch(url, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, password, returnSecureToken: true }),
//       });
//       const data = await fetchRes.json();
//       if (!fetchRes.ok) {
//         return res.status(401).json({ error: data.error || 'Invalid credentials', details: data });
//       }

//       const uid = data.localId;
//       const customToken = await admin.auth().createCustomToken(uid);
//       res.json({ customToken, uid });
//     } catch (err) {
//       res.status(500).json({ error: String(err) });
//     }
//   });
// });

// // Export as HTTPS function
// exports.api = functions.https.onRequest((req, res) => {
//   if (!app) {
//     return res.status(500).json({ error: 'Function not initialized' });
//   }
//   app(req, res);
// });

const functions = require('firebase-functions');
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const { defineSecret } = require('firebase-functions/params');

// Define secret
const apiKeySecret = defineSecret('IDENTITY_API_KEY');

// Initialize Admin SDK (uses default Firebase service account)
admin.initializeApp({
  projectId: 'studio-1307585505-5b6be'
});

const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Health check
app.get('/health', (req, res) => res.json({ ok: true }));

// Sign up
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, username, name } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name || username || ''
    });

    const customToken = await admin.auth().createCustomToken(userRecord.uid);
    res.json({ customToken, uid: userRecord.uid });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Sign in with secret
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

    // Access the secret
    const apiKey = apiKeySecret.value();
    if (!apiKey) return res.status(500).json({ error: 'Server misconfigured: API key missing' });
    console.log("Api key retrieved:", apiKey);
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
    const fetchRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    });
    const data = await fetchRes.json();
    if (!fetchRes.ok) {
      return res.status(401).json({ error: data.error || 'Invalid credentials', details: data });
    }

    const uid = data.localId;
    const customToken = await admin.auth().createCustomToken(uid);
    res.json({ customToken, uid });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Export with secrets and specific service account
exports.api = functions.https.onRequest({
  secrets: [apiKeySecret],
  serviceAccount: 'firebase-adminsdk-fbsvc@studio-1307585505-5b6be.iam.gserviceaccount.com'
}, app);
