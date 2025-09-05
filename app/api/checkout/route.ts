import Stripe from 'stripe'
export async function POST(req: Request){
  // Placeholder Stripe Connect Checkout route
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });
  // TODO: create a Checkout session, set application_fee_amount to 1% of subtotal.
  return new Response(JSON.stringify({ ok:true }), { headers: { 'content-type':'application/json' } });
}