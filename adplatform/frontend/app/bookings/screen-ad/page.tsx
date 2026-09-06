import { redirect } from 'next/navigation';

// This page used to be a self-contained "Book Ad" form + billing modal, but
// every step in it was disconnected from the backend — no creative/ad
// picker, no real time-slot selection, and every "Pay" button just advanced
// a local UI state to a fake success screen with a hardcoded amount.
//
// /book already implements the real version of this flow: it picks a real
// creative, checks real slot availability, and adds a real item to the cart
// for checkout at /cart. Rather than duplicate that (and risk the two
// drifting out of sync the way this page already had), old links here now
// go straight to the real flow.
export default function BookScreenAdRedirect() {
  redirect('/book');
}
