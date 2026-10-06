import React, { useEffect, useState } from 'react';
import { Star, ExternalLink, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { getCardByIdFromFirestore, recordCardTapInFirestore } from '../firebase/config';
import type { CardItem } from '../types';

interface CustomerTapRedirectPageProps {
  cardId: string;
  cards: CardItem[];
  onOpenAdmin?: () => void;
}

export function isSafeRedirectUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export const CustomerTapRedirectPage: React.FC<CustomerTapRedirectPageProps> = ({
  cardId,
  cards,
  onOpenAdmin,
}) => {
  const [card, setCard] = useState<CardItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function loadCardAndRedirect() {
      setLoading(true);

      // 1. Always prioritize live Firestore database document
      let foundCard: CardItem | null = null;
      try {
        foundCard = await getCardByIdFromFirestore(cardId.trim());
      } catch (e) {
        console.warn('Could not fetch card from Firestore, checking cache:', e);
      }

      // 2. Fallback to in-memory / cached cards if offline or network failure
      if (!foundCard) {
        foundCard = cards.find((c) => c.id.trim().toLowerCase() === cardId.trim().toLowerCase()) || null;
      }

      if (isCancelled) return;

      setCard(foundCard);
      setLoading(false);

      if (foundCard && foundCard.status === 'Active' && isSafeRedirectUrl(foundCard.googleReviewUrl)) {
        // Record tap event in Firestore & analytics
        recordCardTapInFirestore(foundCard.id, 'nfc');

        // Automatic redirect after small delay for smooth visual feedback
        setRedirecting(true);
        const timer = setTimeout(() => {
          const dest = foundCard?.googleReviewUrl;
          if (!isCancelled && dest && isSafeRedirectUrl(dest)) {
            window.location.replace(dest);
          }
        }, 1200);

        return () => clearTimeout(timer);
      }
    }

    loadCardAndRedirect();

    return () => {
      isCancelled = true;
    };
  }, [cardId, cards]);

  const handleManualRedirect = () => {
    if (card?.googleReviewUrl && isSafeRedirectUrl(card.googleReviewUrl)) {
      recordCardTapInFirestore(card.id, 'nfc');
      window.location.href = card.googleReviewUrl;
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#0F172A',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: '440px',
          width: '100%',
          backgroundColor: '#1E293B',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '36px 28px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle background glow */}
        <div
          style={{
            position: 'absolute',
            top: '-60px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            backgroundColor: '#0B63E5',
            filter: 'blur(70px)',
            opacity: 0.35,
            pointerEvents: 'none',
          }}
        />

        {/* Brand Header */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '20px', backgroundColor: 'rgba(11, 99, 229, 0.2)', border: '1px solid rgba(11, 99, 229, 0.4)', marginBottom: '24px' }}>
          <Sparkles size={14} style={{ color: '#60A5FA' }} />
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.8px', color: '#93C5FD', textTransform: 'uppercase' }}>
            Modexa TapCard Verified
          </span>
        </div>

        {/* Google G Logo & Stars */}
        <div style={{ marginBottom: '20px' }}>
          <div
            style={{
              width: '74px',
              height: '74px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            }}
          >
            <svg width="42" height="42" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginBottom: '8px' }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={22} fill="#FBBF24" color="#FBBF24" />
            ))}
          </div>
        </div>

        {/* State 1A: Active Card Redirecting */}
        {card && card.status === 'Active' && isSafeRedirectUrl(card.googleReviewUrl) && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 6px 0', color: '#FFFFFF' }}>
              {card.businessName}
            </h2>
            <p style={{ fontSize: '13px', color: '#94A3B8', margin: '0 0 24px 0' }}>
              {redirecting ? 'Opening Google Review page on your device...' : 'Tap detected! Preparing review page...'}
            </p>

            <button
              type="button"
              onClick={handleManualRedirect}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                backgroundColor: '#0B63E5',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '15px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(11, 99, 229, 0.4)',
                marginBottom: '16px',
              }}
            >
              <span>Continue to Google Review</span>
              <ArrowRight size={18} />
            </button>

            <div style={{ fontSize: '11px', color: '#64748B' }}>
              Hardware ID: <strong style={{ color: '#94A3B8', fontFamily: 'monospace' }}>{card.id}</strong>
            </div>
          </div>
        )}

        {/* State 1B: Active Card with Invalid / Unsafe URL Scheme */}
        {card && card.status === 'Active' && !isSafeRedirectUrl(card.googleReviewUrl) && (
          <div>
            <h2 style={{ fontSize: '19px', fontWeight: 700, margin: '0 0 8px 0', color: '#EF4444' }}>
              Security Alert: Invalid Review Link
            </h2>
            <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.5, margin: '0 0 20px 0' }}>
              The destination link configured for card <strong style={{ color: '#FFFFFF', fontFamily: 'monospace' }}>{card.id}</strong> uses an unverified or unsafe URL protocol. Automatic redirection was blocked to protect your device.
            </p>
            {onOpenAdmin && (
              <button
                type="button"
                onClick={onOpenAdmin}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  backgroundColor: '#334155',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Fix in Admin Portal
              </button>
            )}
          </div>
        )}

        {/* State 2: Unassigned or Inactive Card */}
        {card && card.status !== 'Active' && (
          <div>
            <h2 style={{ fontSize: '19px', fontWeight: 700, margin: '0 0 8px 0', color: '#F59E0B' }}>
              Card Ready for Activation
            </h2>
            <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.5, margin: '0 0 20px 0' }}>
              Hardware Card <strong style={{ color: '#FFFFFF', fontFamily: 'monospace' }}>{card.id}</strong> is registered in Modexa inventory and awaiting business assignment.
            </p>

            {onOpenAdmin && (
              <button
                type="button"
                onClick={onOpenAdmin}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  backgroundColor: '#334155',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <span>Open Admin Portal</span>
                <ExternalLink size={15} />
              </button>
            )}
          </div>
        )}

        {/* State 3: Card Not Found */}
        {!loading && !card && (
          <div>
            <h2 style={{ fontSize: '19px', fontWeight: 700, margin: '0 0 8px 0', color: '#EF4444' }}>
              Card Not Found ({cardId})
            </h2>
            <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.5, margin: '0 0 20px 0' }}>
              This card sequence ID is not yet assigned in the Modexa TapCard database.
            </p>
            {onOpenAdmin && (
              <button
                type="button"
                onClick={onOpenAdmin}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  backgroundColor: '#0B63E5',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Go to Modexa TapCard Portal
              </button>
            )}
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div style={{ padding: '20px 0' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                border: '3px solid rgba(255,255,255,0.1)',
                borderTopColor: '#0B63E5',
                borderRadius: '50%',
                margin: '0 auto 12px',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <div style={{ fontSize: '12.5px', color: '#94A3B8' }}>Loading NFC Hardware profile...</div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: '28px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <ShieldCheck size={14} style={{ color: '#10B981' }} />
          <span>Hosted on modexacards.web.app • Firebase Cloud Engine</span>
        </div>
      </div>
    </div>
  );
};
