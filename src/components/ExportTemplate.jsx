import { useApp } from '../context/AppContext';
import { usePassport } from '../context/PassportContext';
import { formatCertificateDate } from '../utils/exportPng';

// Shape constants for shuffle mode (must match BadgeCard)
const SHUFFLE_SHAPES = ['arch', 'circle', 'square'];
const SHUFFLE_TILTS = [-3, 3, 0]; // degrees

// Border radius values for each shape
const SHAPE_BORDER_RADIUS = {
  arch: '50% 50% 24% 24%',
  circle: '50%',
  square: '22%',
};

/**
 * Get shape properties for a badge at a given index
 */
function getShapeProps(badgeShape, index) {
  if (badgeShape === 'shuffle') {
    const shape = SHUFFLE_SHAPES[index % SHUFFLE_SHAPES.length];
    const tilt = SHUFFLE_TILTS[(index + Math.floor(index / 3)) % SHUFFLE_TILTS.length];
    return { borderRadius: SHAPE_BORDER_RADIUS[shape], tiltDeg: tilt };
  }
  return { borderRadius: SHAPE_BORDER_RADIUS[badgeShape] || SHAPE_BORDER_RADIUS.arch, tiltDeg: 0 };
}

/**
 * Hidden template that gets captured for PNG export
 * This is rendered off-screen and captured by html2canvas
 */
export default function ExportTemplate() {
  const { name, badges: claimedBadges, isSecretUnlocked } = useApp();
  const { badges: allBadges, getAssetUrl, meta, content, theme, badgeShape } = usePassport();

  const certContent = content.certificate;

  const claimedCount = Object.values(claimedBadges).filter(b => b?.claimed).length;
  const allBadgesSorted = [...allBadges].sort((a, b) => a.order - b.order);

  // Format hosts text
  const hostsText = meta.hosts?.names?.join(' and ') || '';
  const hostedByText = certContent?.hostedBy?.replace('{hosts}', hostsText) || `Hosted by ${hostsText}`;

  return (
    <div
      id="passport-export-template"
      style={{
        display: 'none',
        width: '1080px',
        height: '1920px',
        backgroundColor: theme.colors.background['100'],
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
            color: theme.colors.text['800'],
            margin: '0 0 8px',
          }}
        >
          {certContent?.title || meta.name}
        </h1>
        <p
          style={{
            fontSize: '18px',
            color: theme.colors.text['600'],
            fontStyle: 'italic',
            margin: '0',
            fontFamily: 'Crimson Text, serif',
          }}
        >
          {certContent?.subtitle || meta.description}
        </p>
      </div>

      {/* Recipient with count */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '24px',
          padding: '16px 20px',
          backgroundColor: theme.colors.background['200'],
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ textAlign: 'left' }}>
          <p style={{ fontSize: '18px', color: theme.colors.text['500'], margin: '0 0 4px', fontFamily: 'Google Sans Flex, sans-serif' }}>
            {certContent?.certifies || 'This certifies that'}
          </p>
          <p
            style={{
              fontSize: '32px',
              fontWeight: '600',
              color: theme.colors.primary['500'],
              margin: '-4px 0 0 0',
            }}
          >
            {name}
          </p>
          <p style={{ fontSize: '18px', color: theme.colors.text['500'], margin: '0', fontFamily: 'Google Sans Flex, sans-serif' }}>
            {certContent?.completed || 'has completed the sacred marathon'}
          </p>
        </div>
        <div
          style={{
            backgroundColor: theme.colors.primary['500'],
            borderRadius: '12px',
            padding: '8px 20px 12px 20px',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: '36px',
              fontWeight: '700',
              color: theme.colors.background['100'],
              margin: '0',
              lineHeight: '1',
              fontFamily: 'Google Sans Flex, sans-serif',
            }}
          >
            {claimedCount}/{allBadges.length}
          </p>
          <p style={{ fontSize: '14px', color: theme.colors.primary['100'], margin: '2px 0 0', fontFamily: 'Google Sans Flex, sans-serif' }}>
            {certContent?.badgesLabel || 'Badges'}
          </p>
        </div>
      </div>

      {/* Date */}
      <p style={{ textAlign: 'center', fontSize: '20px', color: theme.colors.text['600'], margin: '0 0 20px' }}>
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
          {allBadgesSorted.map((badge, index) => {
            const isClaimed = claimedBadges[badge.id]?.claimed;
            const { borderRadius, tiltDeg } = getShapeProps(badgeShape, index);
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
                <div
                  style={{
                    width: '100%',
                    paddingBottom: '100%',
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
                      borderRadius,
                      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.5), 0 3px 6px rgba(0, 0, 0, 0.4)',
                      opacity: isClaimed ? 1 : 0.25,
                      filter: isClaimed ? 'none' : 'grayscale(100%)',
                      border: '12px solid white',
                      overflow: 'hidden',
                      boxSizing: 'border-box',
                      transform: tiltDeg !== 0 ? `rotate(${tiltDeg}deg)` : undefined,
                    }}
                  >
                    {badge.emoji ? (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '64px',
                        }}
                      >
                        {badge.emoji}
                      </div>
                    ) : (
                      <img
                        src={getAssetUrl(badge.image)}
                        alt={badge.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                        crossOrigin="anonymous"
                      />
                    )}
                  </div>
                </div>
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
                    color: isClaimed ? theme.colors.text['800'] : theme.colors.text['500'],
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
        <p style={{ fontSize: '14px', color: theme.colors.text['500'], margin: '0 0 5px' }}>
          {hostedByText}
        </p>
        <p
          style={{
            fontSize: '12px',
            color: theme.colors.text['400'],
            fontStyle: 'italic',
            fontFamily: 'Crimson Text, serif',
          }}
        >
          {certContent?.footer || '"The road goes ever on and on..."'}
        </p>
      </div>
    </div>
  );
}
