const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const crypto = require('crypto');

admin.initializeApp();
const db = admin.firestore();

// M-Pesa Configuration
const MPESA_CONFIG = {
  CONSUMER_KEY: (functions.config().mpesa && functions.config().mpesa.consumer_key) || '',
  CONSUMER_SECRET: (functions.config().mpesa && functions.config().mpesa.consumer_secret) || '',
  PASSKEY: (functions.config().mpesa && functions.config().mpesa.passkey) || '',
  SHORTCODE: (functions.config().mpesa && functions.config().mpesa.shortcode) || '174379',
  ENVIRONMENT: (functions.config().mpesa && functions.config().mpesa.environment) || 'sandbox',
};

// Get OAuth Token
async function getMpesaToken() {
  const auth = Buffer.from(MPESA_CONFIG.CONSUMER_KEY + ':' + MPESA_CONFIG.CONSUMER_SECRET).toString('base64');
  const url = MPESA_CONFIG.ENVIRONMENT === 'sandbox'
    ? 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
    : 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

  try {
    const response = await axios.get(url, {
      headers: { 'Authorization': 'Basic ' + auth }
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting M-Pesa token:', error.response?.data || error.message);
    throw new Error('Failed to get M-Pesa token');
  }
}

// Generate password
function generatePassword(shortcode, passkey, timestamp) {
  const str = shortcode + passkey + timestamp;
  return crypto.createHash('sha256').update(str).digest('hex');
}

// STK Push
exports.stkPush = functions.https.onCall(async (data, context) => {
  const { orderId, amount, phoneNumber, accountReference, transactionDesc } = data;

  if (!orderId || !amount || !phoneNumber) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
  }

  try {
    const token = await getMpesaToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = generatePassword(MPESA_CONFIG.SHORTCODE, MPESA_CONFIG.PASSKEY, timestamp);
    
    const url = MPESA_CONFIG.ENVIRONMENT === 'sandbox'
      ? 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
      : 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

    const requestBody = {
      BusinessShortCode: MPESA_CONFIG.SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: phoneNumber,
      PartyB: MPESA_CONFIG.SHORTCODE,
      PhoneNumber: phoneNumber,
      CallBackURL: `https://us-central1-monah-ai.cloudfunctions.net/mpesaCallback`,
      AccountReference: accountReference || orderId,
      TransactionDesc: transactionDesc || 'Payment for order'
    };

    const response = await axios.post(url, requestBody, {
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      }
    });

    await db.collection('mpesa_transactions').doc(orderId).set({
      orderId,
      checkoutRequestID: response.data.CheckoutRequestID,
      merchantRequestID: response.data.MerchantRequestID,
      responseCode: response.data.ResponseCode,
      responseDescription: response.data.ResponseDescription,
      amount: Math.round(amount),
      phoneNumber,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      success: true,
      checkoutRequestID: response.data.CheckoutRequestID,
      merchantRequestID: response.data.MerchantRequestID,
      responseCode: response.data.ResponseCode,
      message: response.data.ResponseDescription
    };
  } catch (error) {
    console.error('STK Push error:', error.response?.data || error.message);
    throw new functions.https.HttpsError('internal', 'Failed to initiate payment', error.message);
  }
});

// Query payment status
exports.queryStatus = functions.https.onCall(async (data, context) => {
  const { checkoutRequestID, orderId } = data;

  if (!checkoutRequestID && !orderId) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing checkoutRequestID or orderId');
  }

  try {
    let checkoutId = checkoutRequestID;
    if (!checkoutId && orderId) {
      const transactionDoc = await db.collection('mpesa_transactions').doc(orderId).get();
      if (transactionDoc.exists) {
        checkoutId = transactionDoc.data().checkoutRequestID;
      } else {
        throw new Error('Transaction not found');
      }
    }

    const token = await getMpesaToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = generatePassword(MPESA_CONFIG.SHORTCODE, MPESA_CONFIG.PASSKEY, timestamp);

    const url = MPESA_CONFIG.ENVIRONMENT === 'sandbox'
      ? 'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query'
      : 'https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query';

    const requestBody = {
      BusinessShortCode: MPESA_CONFIG.SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutId
    };

    const response = await axios.post(url, requestBody, {
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      }
    });

    if (orderId) {
      await db.collection('mpesa_transactions').doc(orderId).update({
        resultCode: response.data.ResultCode,
        resultDesc: response.data.ResultDesc,
        status: response.data.ResultCode === '0' ? 'completed' : 'failed',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    return {
      success: response.data.ResultCode === '0',
      resultCode: response.data.ResultCode,
      resultDesc: response.data.ResultDesc
    };
  } catch (error) {
    console.error('Query status error:', error.response?.data || error.message);
    throw new functions.https.HttpsError('internal', 'Failed to query payment status');
  }
});

// M-Pesa Callback
exports.mpesaCallback = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  console.log('M-Pesa Callback received:', JSON.stringify(req.body));

  try {
    const callbackData = req.body.Body && req.body.Body.stkCallback;
    if (!callbackData) {
      res.json({ ResultCode: 1, ResultDesc: 'Invalid callback data' });
      return;
    }

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = callbackData;

    const transactionsSnapshot = await db.collection('mpesa_transactions')
      .where('checkoutRequestID', '==', CheckoutRequestID)
      .limit(1)
      .get();

    if (transactionsSnapshot.empty) {
      res.json({ ResultCode: 0, ResultDesc: 'Transaction not found but acknowledged' });
      return;
    }

    const transactionDoc = transactionsSnapshot.docs[0];
    const orderId = transactionDoc.data().orderId;

    let mpesaReceiptNumber = '';
    if (CallbackMetadata && CallbackMetadata.Item) {
      CallbackMetadata.Item.forEach((item) => {
        if (item.Name === 'MpesaReceiptNumber') mpesaReceiptNumber = item.Value;
      });
    }

    await transactionDoc.ref.update({
      resultCode: ResultCode,
      resultDesc: ResultDesc,
      status: ResultCode === '0' ? 'completed' : 'failed',
      mpesaReceiptNumber,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    if (ResultCode === '0' && orderId) {
      const orderRef = db.collection('orders').doc(orderId);
      const orderDoc = await orderRef.get();
      
      if (orderDoc.exists) {
        await orderRef.update({
          status: 'paid',
          paidAt: admin.firestore.FieldValue.serverTimestamp(),
          mpesaReceiptNumber
        });
      } else {
        const contributionRef = db.collection('contributions').doc(orderId);
        const contributionDoc = await contributionRef.get();
        if (contributionDoc.exists) {
          await contributionRef.update({
            status: 'completed',
            completedAt: admin.firestore.FieldValue.serverTimestamp(),
            mpesaReceiptNumber
          });
        }
      }
    }

    res.json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (error) {
    console.error('Callback error:', error);
    res.json({ ResultCode: 1, ResultDesc: 'Failed to process callback' });
  }
});

// Health check
exports.mpesaHealth = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.json({
    status: 'healthy',
    environment: MPESA_CONFIG.ENVIRONMENT,
    shortcode: MPESA_CONFIG.SHORTCODE,
    timestamp: new Date().toISOString()
  });
});