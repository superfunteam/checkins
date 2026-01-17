import { useApp } from '../context/AppContext';
import { badges } from '../data/badges';
import { formatCertificateDate } from '../utils/exportPng';

/**
 * Hidden template that gets captured for PNG export
 * This is rendered off-screen and captured by html2canvas
 */
export default function ExportTemplate() {
  const { name, badges: claimedBadges, isSecretUnlocked } = useApp();

  const claimedCount = Object.values(claimedBadges).filter(b => b?.claimed).length;
  // All badges sorted by order for a single unified grid
  const allBadgesSorted = [...badges].sort((a, b) => a.order - b.order);

  return (
    <div
      id="passport-export-template"
      style={{
        display: 'none',
        width: '1080px',
        height: '1920px', /* Full height to fit all 5 rows of badges + footer */
        backgroundColor: '#f9f6f0',
        fontFamily: 'Cinzel, serif',
        padding: '50px',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1
          style={{
            fontSize: '48px',
            fontWeight: '700',
            color: '#1f1a13',
            margin: '0 0 8px',
          }}
        >
          The Shire Passport
        </h1>
        <p
          style={{
            fontSize: '18px',
            color: '#5c4d3a',
            fontStyle: 'italic',
            margin: '0',
            fontFamily: 'Crimson Text, serif',
          }}
        >
          Official Documentation of One's Journey Through Middle-earth
        </p>
      </div>

      {/* Recipient with count */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '24px',
          padding: '16px 20px',
          backgroundColor: '#f0ebe0',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ textAlign: 'left' }}>
          <p style={{ fontSize: '18px', color: '#8b7355', margin: '0 0 4px', fontFamily: 'Google Sans Flex, sans-serif' }}>
            This certifies that
          </p>
          <p
            style={{
              fontSize: '32px',
              fontWeight: '600',
              color: '#4a6741',
              margin: '-4px 0 0 0',
            }}
          >
            {name}
          </p>
          <p style={{ fontSize: '18px', color: '#8b7355', margin: '0', fontFamily: 'Google Sans Flex, sans-serif' }}>
            has completed the sacred marathon
          </p>
        </div>
        <div
          style={{
            backgroundColor: '#4a6741',
            borderRadius: '12px',
            padding: '8px 20px 12px 20px',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: '36px',
              fontWeight: '700',
              color: '#f9f6f0',
              margin: '0',
              lineHeight: '1',
              fontFamily: 'Google Sans Flex, sans-serif',
            }}
          >
            {claimedCount}/{badges.length}
          </p>
          <p style={{ fontSize: '14px', color: '#d9e5d9', margin: '2px 0 0', fontFamily: 'Google Sans Flex, sans-serif' }}>
            Badges
          </p>
        </div>
      </div>

      {/* Date */}
      <p style={{ textAlign: 'center', fontSize: '20px', color: '#5c4d3a', margin: '0 0 20px' }}>
        {formatCertificateDate()}
      </p>

      {/* All Badges Grid - 5 rows x 4 columns */}
      <div style={{ marginBottom: '20px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
          }}
        >
          {allBadgesSorted.map((badge) => {
            const isClaimed = claimedBadges[badge.id]?.claimed;
            return (
              <div
                key={badge.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  position: 'relative',
                }}
              >
                {/* Badge with shadow - using padding trick for aspect ratio */}
                <div
                  style={{
                    width: '100%',
                    paddingBottom: '100%', /* 1:1 aspect ratio */
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderRadius: '50% 50% 24% 24%',
                      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.5), 0 3px 6px rgba(0, 0, 0, 0.4)',
                      opacity: isClaimed ? 1 : 0.25,
                      filter: isClaimed ? 'none' : 'grayscale(100%)',
                      border: '12px solid white',
                      overflow: 'hidden',
                      boxSizing: 'border-box',
                    }}
                  >
                    <img
                      src={badge.image}
                      alt={badge.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                      crossOrigin="anonymous"
                    />
                  </div>
                </div>
                {/* Purple checkmark for claimed badges */}
                {isClaimed && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '0',
                      right: '8px',
                      width: '36px',
                      height: '36px',
                      backgroundColor: '#7C3AED',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '3px solid white',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                )}
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: isClaimed ? '#1f1a13' : '#8b7355',
                    textAlign: 'center',
                    lineHeight: '1.2',
                    fontFamily: 'Google Sans Flex, sans-serif',
                  }}
                >
                  {badge.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '14px', color: '#8b7355', margin: '0 0 5px' }}>
          Hosted by Sophia and Matt
        </p>
        <p
          style={{
            fontSize: '12px',
            color: '#a68d6b',
            fontStyle: 'italic',
            fontFamily: 'Crimson Text, serif',
          }}
        >
          "The road goes ever on and on..."
        </p>
      </div>
    </div>
  );
}
