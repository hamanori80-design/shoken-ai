export default async function handler(req, res) {
  // CORS設定(他のサイトからも呼び出せるようにする)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'メールアドレスが必要です' });
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const response = await fetch(
      `${supabaseUrl}/rest/v1/premium_users?email=eq.${encodeURIComponent(email.toLowerCase().trim())}&status=eq.active`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    const data = await response.json();
    const isPremium = Array.isArray(data) && data.length > 0;

    return res.status(200).json({ isPremium });
  } catch (error) {
    console.error('Error checking premium status:', error);
    return res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
}
