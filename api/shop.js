import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    const id = req.query.id;

    if (!id) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing shop id'
      });
    }

    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message
      });
    }

    res.status(200).json({
      status: 'success',
      data
    });

  } catch (err) {
    console.error('Serverless crash:', err);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
}
