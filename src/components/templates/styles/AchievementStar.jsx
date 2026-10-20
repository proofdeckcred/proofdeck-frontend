import React from 'react';
import { SERVER_BASE_URL } from '../../../config';

const AchievementStar = ({ data }) => {
    const {
        backgroundStyle,
        logo_url,
        textStyle,
        certificateTitle = 'Congratulations!',
        recipient_name = 'Recipient Name',
        certificateBody = 'For outstanding performance and completion of',
        course_title = 'Course Title'
    } = data;

    const resolvedLogo = logo_url
        ? (logo_url.startsWith('blob:') || logo_url.startsWith('data:') || logo_url.startsWith('http')
            ? logo_url
            : `${SERVER_BASE_URL}${logo_url}`)
        : null;

    const customFields = (data.customFieldsArray || []).filter(f => f.key !== 'amount');

    return (
        <div
            style={{
                width: '1122px',
                height: '794px',
                backgroundColor: '#312e81',
                color: '#ffffff',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                boxSizing: 'border-box',
                fontFamily: data.font_family || "'Montserrat', sans-serif",
                ...backgroundStyle
            }}
        >
            {/* Soft radial background glow (Browser & WeasyPrint 1:1 compatible) */}
            <div
                style={{
                    position: 'absolute',
                    top: '-120px',
                    right: '-120px',
                    width: '460px',
                    height: '460px',
                    borderRadius: '9999px',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)'
                }}
            ></div>
            <div
                style={{
                    position: 'absolute',
                    bottom: '-120px',
                    left: '-120px',
                    width: '460px',
                    height: '460px',
                    borderRadius: '9999px',
                    background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)'
                }}
            ></div>

            {/* Yellow Left Strip */}
            <div
                style={{
                    width: '80px',
                    height: '100%',
                    backgroundColor: '#eab308',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    zIndex: 10,
                    flexShrink: 0,
                    boxShadow: '4px 0 16px rgba(0, 0, 0, 0.2)'
                }}
            >
                <div
                    style={{
                        color: '#312e81',
                        fontWeight: 900,
                        fontSize: '26px',
                        transform: 'rotate(90deg)',
                        whiteSpace: 'nowrap',
                        letterSpacing: '0.2em'
                    }}
                >
                    ACHIEVEMENT
                </div>
            </div>

            {/* Main Content */}
            <div
                style={{
                    flex: 1,
                    padding: '56px 72px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    position: 'relative',
                    zIndex: 10,
                    boxSizing: 'border-box'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                    <div
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.12)',
                            padding: '10px',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {resolvedLogo ? (
                            <img src={resolvedLogo} style={{ height: '36px', objectFit: 'contain' }} alt="Logo" />
                        ) : (
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="#facc15">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        )}
                    </div>
                    <p style={{ color: '#c7d2fe', textTransform: 'uppercase', letterSpacing: '0.16em', fontSize: '14px', fontWeight: 700, margin: 0 }}>
                        Star Student Award
                    </p>
                </div>

                <h1 style={{ fontSize: '52px', fontWeight: 800, margin: '0 0 8px 0', color: '#ffffff' }}>
                    {certificateTitle}
                </h1>
                <h2
                    style={{
                        fontSize: '42px',
                        fontWeight: 800,
                        color: '#facc15',
                        margin: '0 0 28px 0',
                        ...textStyle
                    }}
                >
                    {recipient_name}
                </h2>

                <div
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        padding: '28px 32px',
                        borderRadius: '14px',
                        border: '1px solid rgba(255, 255, 255, 0.14)',
                        marginBottom: '36px',
                        maxWidth: '680px',
                        boxSizing: 'border-box'
                    }}
                >
                    <p style={{ fontSize: '18px', color: '#e0e7ff', lineHeight: 1.6, margin: 0 }}>
                        {certificateBody} <strong style={{ color: '#ffffff' }}>{course_title}</strong>.
                        <br />
                        Your hard work has truly shone through!
                    </p>

                    {/* Custom Fields */}
                    {customFields.length > 0 && (
                        <div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '20px 40px',
                                borderTop: '1px solid rgba(255, 255, 255, 0.14)',
                                paddingTop: '16px',
                                marginTop: '16px'
                            }}
                        >
                            {customFields.map((field, index) => (
                                <div key={index}>
                                    <p style={{ fontSize: '11px', color: '#a5b4fc', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 4px 0' }}>
                                        {field.key}
                                    </p>
                                    <p style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', margin: 0 }}>
                                        {field.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>
                    <div>
                        <p style={{ fontSize: '11px', color: '#a5b4fc', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 4px 0' }}>
                            Total Points
                        </p>
                        <p style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff', margin: 0 }}>2,500 XP</p>
                    </div>
                    <div style={{ height: '36px', width: '1px', backgroundColor: '#4338ca' }}></div>
                    <div>
                        <p style={{ fontSize: '11px', color: '#a5b4fc', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 4px 0' }}>
                            Rank
                        </p>
                        <p style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff', margin: 0 }}>#1</p>
                    </div>
                    <div style={{ height: '36px', width: '1px', backgroundColor: '#4338ca' }}></div>
                    <div>
                        <p style={{ fontSize: '11px', color: '#a5b4fc', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 4px 0' }}>
                            Date
                        </p>
                        <p style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', margin: 0 }}>
                            {data.issueDateFormatted}
                        </p>
                    </div>

                    {(data.signature_image || data.signature) && (
                        <>
                            <div style={{ height: '36px', width: '1px', backgroundColor: '#4338ca' }}></div>
                            <div>
                                <p style={{ fontSize: '11px', color: '#a5b4fc', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 4px 0' }}>
                                    {data.signature_title || 'Authorized Signature'}
                                </p>
                                {data.signature_image ? (
                                    <img
                                        src={data.signature_image}
                                        alt="Signature"
                                        style={{ height: '34px', objectFit: 'contain', backgroundColor: 'rgba(255,255,255,0.9)', padding: '2px 8px', borderRadius: '4px' }}
                                    />
                                ) : (
                                    <p className="font-signature" style={{ fontSize: '22px', color: '#facc15', margin: 0 }}>
                                        {data.signature}
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AchievementStar;
